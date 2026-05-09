// Background Service Worker

console.log('AI Interview Copilot - Background service worker started');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'QUESTION_DETECTED') {
    console.log('Question detected:', request.question);
    // Forward to web app if needed
  }
  
  return true;
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open popup
  chrome.action.openPopup();
});

// Keep service worker alive
let keepAliveInterval;

function keepAlive() {
  keepAliveInterval = setInterval(() => {
    chrome.runtime.getPlatformInfo();
  }, 20000);
}

keepAlive();

chrome.runtime.onStartup.addListener(keepAlive);
chrome.runtime.onInstalled.addListener(keepAlive);
