// Google Meet Content Script
console.log('🎯 AI Interview Copilot - Google Meet mode activated');

let processedMessages = new Set();
let captionBuffer = '';
let lastCaptionTime = Date.now();
let meetingNotified = false;

// CHAT MESSAGE DETECTION
function observeChatMessages() {
  const chatContainer = document.querySelector('[data-participant-id]')?.closest('[role="complementary"]');
  
  if (!chatContainer) {
    // Chat not open yet, retry
    setTimeout(observeChatMessages, 2000);
    return;
  }

  console.log('✅ Chat container found, observing messages...');

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          processChatMessage(node);
        }
      }
    }
  });

  observer.observe(chatContainer, {
    childList: true,
    subtree: true,
  });
}

function processChatMessage(element) {
  // Google Meet chat messages typically have data-message-text attribute
  const messageText = element.getAttribute('data-message-text') || element.textContent;
  
  if (!messageText || processedMessages.has(messageText)) {
    return;
  }

  processedMessages.add(messageText);

  const detection = isInterviewQuestion(messageText);
  if (detection.isQuestion) {
    console.log('💬 Question detected in chat:', messageText);
    sendQuestionToBackend(messageText, 'chat', 'meet');
  }
}

// CAPTION/SUBTITLE DETECTION
function observeCaptions() {
  const captionContainer = document.querySelector('[class*="caption"]') || 
                          document.querySelector('.a4cQT');

  if (!captionContainer) {
    setTimeout(observeCaptions, 3000);
    return;
  }

  console.log('✅ Caption container found, observing captions...');

  const observer = new MutationObserver(debounce(() => {
    const captionText = captionContainer.textContent?.trim();
    
    if (!captionText) return;

    // Buffer captions to reconstruct sentences
    captionBuffer += ' ' + captionText;
    lastCaptionTime = Date.now();

    // Check for sentence completion
    if (captionText.endsWith('.') || captionText.endsWith('?') || captionText.endsWith('!')) {
      processCaptionSentence(captionBuffer.trim());
      captionBuffer = '';
    }
  }, 500));

  observer.observe(captionContainer, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Periodic check to flush buffer
  setInterval(() => {
    if (captionBuffer && Date.now() - lastCaptionTime > 3000) {
      processCaptionSentence(captionBuffer.trim());
      captionBuffer = '';
    }
  }, 3000);
}

function processCaptionSentence(sentence) {
  if (!sentence || processedMessages.has(sentence)) {
    return;
  }

  processedMessages.add(sentence);

  const detection = isInterviewQuestion(sentence);
  if (detection.isQuestion) {
    console.log('📝 Question detected in captions:', sentence);
    sendQuestionToBackend(sentence, 'caption', 'meet');
  }
}

// MEETING DETECTION
function detectMeetingStatus() {
  const cameraButton = document.querySelector('[data-is-muted]');
  const inMeeting = !!cameraButton;

  if (inMeeting && !meetingNotified) {
    meetingNotified = true;
    console.log('✅ Google Meet detected — notifying Ghost Interviewer');
    sendMeetingEventToBackend('meet', 'meeting_start');
  }

  return inMeeting;
}

// Initialize
setTimeout(() => {
  if (detectMeetingStatus()) {
    observeChatMessages();
    observeCaptions();
  }
}, 2000);

// Monitor for meeting start
const bodyObserver = new MutationObserver(() => {
  if (detectMeetingStatus()) {
    observeChatMessages();
    observeCaptions();
    bodyObserver.disconnect();
  }
});

bodyObserver.observe(document.body, {
  childList: true,
  subtree: true,
});
