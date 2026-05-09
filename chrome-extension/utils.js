// Shared utility functions for question detection

const QUESTION_STARTERS = [
  'tell me', 'tell us',
  'explain',
  'describe',
  'walk me through', 'walk us through',
  'what is', 'what are', 'what was', 'what were', 'what would', 'what will',
  'what do', 'what does', 'what did', 'what has', 'what have',
  'what experience', 'what challenges', 'what motivates',
  'how is', 'how are', 'how was', 'how were',
  'how would', 'how do', 'how does', 'how did', 'how have', 'how has',
  'have you', 'has there', 'had you',
  'give me an example', 'give me', 'give us',
  'share an example', 'share a time', 'share with',
  'why did', 'why do', 'why does', 'why would', 'why have',
  'can you', 'could you', 'would you', 'will you',
  'do you have', 'do you', 'did you', 'are you', 'were you',
  'when have you', 'when did you',
  'where have you', 'where do you', 'where did you', 'where do you see',
  'who did you',
  'which',
  'in your experience', 'from your experience', 'based on your',
];

const QUESTION_PHRASES = [
  'your experience with', 'your experience in',
  'your background',
  'about yourself',
  'your greatest', 'your biggest',
  'your weakness', 'your weaknesses',
  'your strength', 'your strengths',
  'a time when', 'a situation where', 'a situation when',
  'an example of', 'an example where',
  'worked on', 'have worked on',
  'handled a situation',
  'dealt with',
  'approach to',
  'your role', 'your responsibilities',
  'you motivated', 'stay motivated',
  'do you see yourself', 'where do you see',
  'five years', 'ten years',
  'conflict with',
  'work under pressure', 'under pressure',
  'in a team', 'team environment', 'team player',
  'challenging situation', 'challenging project',
  'difficult situation', 'difficult project',
  'work style', 'management style', 'leadership style',
  'feedback', 'criticism',
  'you handle', 'how you handle',
  'have you ever',
];

function isInterviewQuestion(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return { isQuestion: false, confidence: 0, reason: 'Empty text' };
  }

  const normalized = text.trim().toLowerCase();
  const words = normalized.split(/\s+/);

  if (words.length < 4) {
    return { isQuestion: false, confidence: 0, reason: 'Too short' };
  }

  let confidence = 0;
  const reasons = [];

  if (normalized.endsWith('?')) {
    confidence += 35;
    reasons.push('Ends with ?');
  }

  for (const starter of QUESTION_STARTERS) {
    if (normalized.startsWith(starter)) {
      confidence += 35;
      reasons.push(`Starts with "${starter}"`);
      break;
    }
  }

  for (const phrase of QUESTION_PHRASES) {
    if (normalized.includes(phrase)) {
      confidence += 20;
      reasons.push(`Contains "${phrase}"`);
    }
  }

  const whWords = ['what', 'where', 'when', 'why', 'who', 'how', 'which'];
  for (const wh of whWords) {
    if (words.includes(wh)) {
      confidence += 10;
      reasons.push(`WH-word: ${wh}`);
      break;
    }
  }

  confidence = Math.min(confidence, 100);
  const isQuestion = confidence >= 30;

  return {
    isQuestion,
    confidence,
    reason: reasons.length > 0 ? reasons.join('; ') : 'No question patterns',
  };
}

// Send question to backend
async function sendQuestionToBackend(question, source, platform) {
  try {
    const config = await chrome.storage.local.get(['userToken', 'apiUrl']);
    const userToken = config.userToken;
    const apiUrl = config.apiUrl || 'http://localhost:3000';

    if (!userToken) {
      console.warn('No user token found. Please connect extension in popup.');
      return false;
    }

    const response = await fetch(`${apiUrl}/api/copilot/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        source,
        platform,
        userToken,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Question sent:', question, '| Confidence:', data.confidence);
      return true;
    } else {
      console.error('Failed to send question:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error sending question:', error);
    return false;
  }
}

// Send meeting lifecycle event to backend
async function sendMeetingEventToBackend(platform, eventType = 'meeting_start') {
  try {
    const config = await chrome.storage.local.get(['userToken', 'apiUrl']);
    const userToken = config.userToken;
    const apiUrl = config.apiUrl || 'http://localhost:3000';

    if (!userToken) return false;

    const response = await fetch(`${apiUrl}/api/copilot/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, platform, userToken }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending meeting event:', error);
    return false;
  }
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
