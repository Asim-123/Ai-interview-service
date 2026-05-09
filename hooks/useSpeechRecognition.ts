import { useEffect, useRef, useState } from 'react';
import { useCopilotStore } from '@/store/copilot-store';
import { isInterviewQuestion } from '@/lib/question-detector';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export function useSpeechRecognition() {
  const { isListening, addQuestion, answerStyle } = useCopilotStore();
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState('');
  const lastSpeechTime = useRef(Date.now());
  const speechBuffer = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPiece = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcriptPiece + ' ';
          lastSpeechTime.current = Date.now();
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      if (finalTranscript) {
        speechBuffer.current += finalTranscript;
        setTranscript(speechBuffer.current);
        
        // Check for question patterns
        const detection = isInterviewQuestion(speechBuffer.current.trim());
        
        if (detection.isQuestion) {
          console.log('✅ Question detected:', speechBuffer.current.trim());
          
          addQuestion({
            id: Date.now().toString(),
            question: speechBuffer.current.trim(),
            answer: '',
            source: 'mic',
            confidence: detection.confidence,
            timestamp: new Date(),
            answerStyle,
            isStreaming: true,
          });

          // Clear buffer after detecting question
          speechBuffer.current = '';
          setTranscript('');
        }
      }

      // Show interim results
      if (interimTranscript) {
        setTranscript(speechBuffer.current + interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart if no speech detected
        if (isListening) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (err) {
              // Already started
            }
          }, 100);
        }
      }
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      if (isListening) {
        // Restart if still supposed to be listening
        try {
          recognition.start();
        } catch (err) {
          // Already started
        }
      }
    };

    recognitionRef.current = recognition;

    // Periodic buffer check — flush on 3-second pause regardless of whether it is a question
    const pauseCheckInterval = setInterval(() => {
      if (!speechBuffer.current || Date.now() - lastSpeechTime.current < 3000) return;

      const text = speechBuffer.current.trim();
      // Always clear the buffer so old speech never bleeds into the next sentence
      speechBuffer.current = '';
      setTranscript('');

      const detection = isInterviewQuestion(text);
      if (detection.isQuestion) {
        console.log('✅ Question detected (pause):', text);
        addQuestion({
          id: Date.now().toString(),
          question: text,
          answer: '',
          source: 'mic',
          confidence: detection.confidence,
          timestamp: new Date(),
          answerStyle,
          isStreaming: true,
        });
      }
    }, 1000);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearInterval(pauseCheckInterval);
    };
  }, [isListening, addQuestion, answerStyle]);

  useEffect(() => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        // Already started
      }
    } else if (!isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      speechBuffer.current = '';
      setTranscript('');
    }
  }, [isListening]);

  return {
    transcript,
    isSupported: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
  };
}
