export interface QuestionDetectionResult {
  isQuestion: boolean;
  confidence: number;
  reason: string;
}

// Phrases that strongly signal an interview question when they START the sentence
const QUESTION_STARTERS = [
  'tell me',
  'tell us',
  'explain',
  'describe',
  'walk me through',
  'walk us through',
  'what is',
  'what are',
  'what was',
  'what were',
  'what would',
  'what will',
  'what do',
  'what does',
  'what did',
  'what has',
  'what have',
  'what experience',
  'what challenges',
  'what motivates',
  'how is',
  'how are',
  'how was',
  'how were',
  'how would',
  'how do',
  'how does',
  'how did',
  'how have',
  'how has',
  'have you',
  'has there',
  'had you',
  'give me an example',
  'give me',
  'give us',
  'share an example',
  'share a time',
  'share with',
  'why did',
  'why do',
  'why does',
  'why would',
  'why have',
  'can you',
  'could you',
  'would you',
  'will you',
  'do you have',
  'do you',
  'did you',
  'are you',
  'were you',
  'when have you',
  'when did you',
  'where have you',
  'where do you',
  'where did you',
  'where do you see',
  'who did you',
  'which',
  'in your experience',
  'from your experience',
  'based on your',
];

// Phrases that appear anywhere in the text and signal an interview question
const QUESTION_PHRASES = [
  'your experience with',
  'your experience in',
  'your background',
  'about yourself',
  'your greatest',
  'your biggest',
  'your weakness',
  'your strength',
  'your strengths',
  'your weaknesses',
  'a time when',
  'a situation where',
  'a situation when',
  'an example of',
  'an example where',
  'worked on',
  'have worked on',
  'handled a situation',
  'dealt with',
  'approach to',
  'your role',
  'your responsibilities',
  'you motivated',
  'stay motivated',
  'do you see yourself',
  'where do you see',
  'five years',
  'ten years',
  'conflict with',
  'work under pressure',
  'under pressure',
  'in a team',
  'team environment',
  'team player',
  'challenging situation',
  'challenging project',
  'difficult situation',
  'difficult project',
  'work style',
  'management style',
  'leadership style',
  'feedback',
  'criticism',
  'you handle',
  'how you handle',
  'have you ever',
];

const WH_WORDS = ['what', 'where', 'when', 'why', 'who', 'how', 'which'];

export function isInterviewQuestion(text: string): QuestionDetectionResult {
  if (!text || text.trim().length === 0) {
    return { isQuestion: false, confidence: 0, reason: 'Empty text' };
  }

  const normalized = text.trim().toLowerCase();
  const words = normalized.split(/\s+/);

  // Minimum word count — speech segments under 4 words are almost always noise
  if (words.length < 4) {
    return { isQuestion: false, confidence: 0, reason: 'Too short (< 4 words)' };
  }

  let confidenceScore = 0;
  const reasons: string[] = [];

  // Ends with question mark (often absent in speech transcripts, so not required)
  if (normalized.endsWith('?')) {
    confidenceScore += 35;
    reasons.push('Ends with ?');
  }

  // Starts with a known question opener
  for (const starter of QUESTION_STARTERS) {
    if (normalized.startsWith(starter)) {
      confidenceScore += 35;
      reasons.push(`Starts with "${starter}"`);
      break; // count once
    }
  }

  // Contains a question phrase anywhere in the text
  for (const phrase of QUESTION_PHRASES) {
    if (normalized.includes(phrase)) {
      confidenceScore += 20;
      reasons.push(`Contains "${phrase}"`);
      // Don't break — multiple matching phrases raise confidence further
    }
  }

  // WH-word anywhere in the sentence (speech is often mid-sentence questions)
  for (const wh of WH_WORDS) {
    if (words.includes(wh)) {
      confidenceScore += 10;
      reasons.push(`WH-word: ${wh}`);
      break; // count once
    }
  }

  // Cap and threshold
  confidenceScore = Math.min(confidenceScore, 100);

  // Lower threshold so speech-transcribed questions (no `?`) still pass
  const isQuestion = confidenceScore >= 30;
  const reason = reasons.length > 0 ? reasons.join('; ') : 'No question patterns detected';

  return { isQuestion, confidence: confidenceScore, reason };
}

/**
 * Split a raw speech transcript into candidate sentences and return those
 * that look like interview questions.
 *
 * Speech-to-text output rarely contains punctuation, so we split on
 * natural clause boundaries instead of just `.!?`.
 */
export function extractQuestionFromTranscript(transcript: string): string[] {
  if (!transcript) return [];

  // First try punctuation-based splitting
  let segments: string[] = transcript.match(/[^.!?]+[.!?]*/g) ?? [];

  // If the whole transcript came back as one segment (no punctuation),
  // split on common spoken-language clause boundaries instead.
  if (segments.length <= 1) {
    segments = transcript
      .split(/\b(so|and|but|okay|alright|now|next|also|well|right)\b/i)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const questions: string[] = [];
  for (const seg of segments) {
    const detection = isInterviewQuestion(seg);
    if (detection.isQuestion) {
      questions.push(seg.trim());
    }
  }

  // If no segments qualified but the whole transcript does, return it as-is
  if (questions.length === 0) {
    const fullDetection = isInterviewQuestion(transcript);
    if (fullDetection.isQuestion) return [transcript.trim()];
  }

  return questions;
}
