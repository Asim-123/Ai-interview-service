import { useEffect, useRef } from 'react';
import { useCopilotStore } from '@/store/copilot-store';
import { isInterviewQuestion } from '@/lib/question-detector';
import { auth } from '@/lib/firebase';

// 16 kHz mono is the sweet-spot for speech recognition APIs
const SAMPLE_RATE = 16000;
// Flush and transcribe every N seconds of audio
const FLUSH_INTERVAL_MS = 5000;
// Minimum audio length before sending (avoids wasting API calls on silence)
const MIN_SAMPLES = SAMPLE_RATE * 1.5; // 1.5 seconds

// ── WAV encoder ────────────────────────────────────────────────────────────
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);        // chunk size
  view.setUint16(20, 1, true);         // PCM
  view.setUint16(22, 1, true);         // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true);         // block align
  view.setUint16(34, 16, true);        // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function mergeFloat32(arrays: Float32Array[]): Float32Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}
// ───────────────────────────────────────────────────────────────────────────

export function useTabSpeechRecognition(stream: MediaStream | null) {
  const { addQuestion, answerStyle } = useCopilotStore();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const samplesRef = useRef<Float32Array[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!stream) return;

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn('[TabAudio] No audio tracks — make sure to share audio when prompted.');
      return;
    }

    // Build a fresh AudioContext at 16 kHz for speech
    const audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
    audioCtxRef.current = audioCtx;

    const audioStream = new MediaStream(audioTracks);
    const source = audioCtx.createMediaStreamSource(audioStream);

    // ScriptProcessor lets us grab raw PCM without AudioWorklet boilerplate
    // bufferSize 4096 gives ~256 ms at 16 kHz — fine for buffering
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (e) => {
      const data = e.inputBuffer.getChannelData(0);
      samplesRef.current.push(new Float32Array(data));
    };

    source.connect(processor);
    // ScriptProcessor must be connected to the destination to fire
    processor.connect(audioCtx.destination);

    const flush = async () => {
      if (samplesRef.current.length === 0) return;

      const allSamples = mergeFloat32(samplesRef.current);
      samplesRef.current = [];

      if (allSamples.length < MIN_SAMPLES) return; // skip near-silence chunks

      const wavBlob = encodeWAV(allSamples, SAMPLE_RATE);

      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const form = new FormData();
        form.append('audio', wavBlob, 'chunk.wav');
        form.append('token', token);

        const res = await fetch('/api/copilot/transcribe', { method: 'POST', body: form });
        if (!res.ok) {
          const body = await res.text();
          console.error('[TabAudio] Transcribe error:', res.status, body);
          return;
        }

        const { transcript } = await res.json() as { transcript?: string };
        if (!transcript?.trim()) return;

        console.log('[TabAudio] Transcript:', transcript);

        const detection = isInterviewQuestion(transcript.trim());
        if (detection.isQuestion) {
          console.log('[TabAudio] Question detected:', transcript.trim());
          addQuestion({
            id: `tab-${Date.now()}`,
            question: transcript.trim(),
            answer: '',
            source: 'caption',
            confidence: detection.confidence,
            timestamp: new Date(),
            answerStyle,
            isStreaming: true,
          });
        }
      } catch (err) {
        console.error('[TabAudio] Unexpected error:', err);
      }
    };

    intervalRef.current = setInterval(flush, FLUSH_INTERVAL_MS);

    return () => {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      processor.disconnect();
      source.disconnect();
      audioCtx.close();
      audioCtxRef.current = null;
      samplesRef.current = [];
    };
  // Re-run only when the stream reference changes (new share / share stopped)
  }, [stream]); // eslint-disable-line react-hooks/exhaustive-deps
}
