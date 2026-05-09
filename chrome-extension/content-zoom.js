// Zoom Web Client Content Script
console.log('🎯 AI Interview Copilot - Zoom mode activated');

let processedMessages = new Set();
let captionBuffer = '';
let lastCaptionTime = Date.now();
let meetingNotified = false;

// CHAT MESSAGE DETECTION
function observeChatMessages() {
  const chatContainer = document.querySelector('.chat-message-list__body');
  
  if (!chatContainer) {
    setTimeout(observeChatMessages, 2000);
    return;
  }

  console.log('✅ Zoom chat container found, observing messages...');

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1 && node.classList?.contains('chat-message__text')) {
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
  const messageText = element.textContent?.trim();
  
  if (!messageText || processedMessages.has(messageText)) {
    return;
  }

  processedMessages.add(messageText);

  const detection = isInterviewQuestion(messageText);
  if (detection.isQuestion) {
    console.log('💬 Question detected in Zoom chat:', messageText);
    sendQuestionToBackend(messageText, 'chat', 'zoom');
  }
}

// CAPTION DETECTION
function observeCaptions() {
  const captionContainer = document.querySelector('[class*="caption"]') ||
                          document.querySelector('.closed-caption-container');

  if (!captionContainer) {
    setTimeout(observeCaptions, 3000);
    return;
  }

  console.log('✅ Zoom caption container found, observing captions...');

  const observer = new MutationObserver(debounce(() => {
    const captionText = captionContainer.textContent?.trim();
    
    if (!captionText) return;

    captionBuffer += ' ' + captionText;
    lastCaptionTime = Date.now();

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
    console.log('📝 Question detected in Zoom captions:', sentence);
    sendQuestionToBackend(sentence, 'caption', 'zoom');
  }
}

// MEETING DETECTION
function detectMeetingStatus() {
  const micButton = document.querySelector('[aria-label*="Mute"]') ||
                   document.querySelector('[aria-label*="Unmute"]');
  const inMeeting = !!micButton;

  if (inMeeting && !meetingNotified) {
    meetingNotified = true;
    console.log('✅ Zoom meeting detected — notifying Ghost Interviewer');
    sendMeetingEventToBackend('zoom', 'meeting_start');
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
