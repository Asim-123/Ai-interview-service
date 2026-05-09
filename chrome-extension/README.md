# AI Interview Copilot - Chrome Extension

This Chrome extension automatically detects interview questions from Google Meet, Zoom, and Microsoft Teams, and sends them to your AI Interview Copilot web app for instant answers.

## Features

- 🎯 **Automatic Question Detection** from:
  - Chat messages
  - Live captions/subtitles
  - Real-time transcription
  
- 🥷 **Completely Invisible** - No UI elements added to meeting pages
- ⚡ **Instant Sync** - Questions appear in your copilot dashboard immediately
- 🔒 **Secure** - Uses Firebase authentication tokens

## Installation

### Step 1: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder from this project

### Step 2: Connect to Your Account

1. Open the AI Interview Copilot web app at http://localhost:3000
2. Sign in with Google or GitHub
3. Go to the **Copilot** page
4. Click the extension icon in Chrome toolbar
5. In the popup:
   - **API URL**: Enter `http://localhost:3000` (or your deployed URL)
   - **Firebase Token**: Copy your token from the app settings
6. Click **Connect Extension**
7. You should see "✅ Connected" status

### Step 3: Use in Meetings

1. Join a Google Meet, Zoom, or Teams meeting
2. Open the copilot web app in another window/monitor
3. Questions detected from chat or captions will appear automatically
4. Read the AI-generated answers in real-time

## How to Get Your Firebase Token

1. Open the web app
2. Sign in
3. Open browser DevTools (F12)
4. Go to Console tab
5. Run this command:
   ```javascript
   firebase.auth().currentUser.getIdToken().then(token => console.log(token))
   ```
6. Copy the token that appears
7. Paste it into the extension popup

## Supported Platforms

- ✅ Google Meet (meet.google.com)
- ✅ Zoom Web Client (zoom.us/wc)
- ✅ Microsoft Teams (teams.microsoft.com)

## Privacy & Security

- The extension ONLY runs on meeting pages
- No data is stored locally
- Questions are sent securely to your own backend
- Completely invisible to interviewers

## Troubleshooting

### Extension not detecting questions?

1. Check that you're connected (green dot in extension popup)
2. Make sure captions/subtitles are enabled in the meeting
3. Open the meeting chat and test by typing a question
4. Check browser console (F12) for any errors

### Connection issues?

1. Verify API URL is correct
2. Ensure Firebase token is up-to-date (tokens expire after 1 hour)
3. Check that the web app is running

### Questions not appearing in copilot?

1. Make sure the copilot page is open in another tab
2. Check that your plan hasn't reached usage limits
3. Verify the extension status shows "Connected"

## Development

To modify detection logic, edit:
- `utils.js` - Question detection algorithm
- `content-meet.js` - Google Meet integration
- `content-zoom.js` - Zoom integration
- `content-teams.js` - Teams integration

After changes, go to `chrome://extensions/` and click the **Reload** button for this extension.

## Support

For issues or questions, open an issue on GitHub or contact support.
