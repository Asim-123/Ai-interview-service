# Setup Guide

Follow these steps to get the AI Interview Copilot running locally.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free)
- Firebase account (free)
- OpenRouter account (free)
- Chrome browser (for extension testing)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file already exists with some values pre-configured. You need to add:

#### A. OpenRouter API Key (Required)

1. Go to [OpenRouter](https://openrouter.ai)
2. Sign up for a free account
3. Go to Settings > API Keys
4. Create a new API key
5. Add to `.env`:
   ```
   OPENROUTER_API_KEY=your-api-key-here
   ```

#### B. Firebase Admin Credentials (Optional for Development)

For full functionality, you need Firebase Admin credentials:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select the `ghost-interviewer` project (or create your own)
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract these values and add to `.env`:
   ```
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@ghost-interviewer.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
   ```

**Note**: The app will work without Firebase Admin credentials, but some features may be limited.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Sign In

1. Click "Continue with Google" or "Continue with GitHub"
2. Authorize the app
3. You'll be redirected to `/copilot`

## Testing the Features

### Live Interview Assistant

1. Go to `/copilot`
2. Enter a job role (e.g., "Senior Frontend Engineer")
3. Click "Start Meeting"
4. Enable microphone or manually type questions
5. Watch AI answers stream in real-time

### Chrome Extension

1. Load the extension from `chrome-extension/` folder
2. Follow instructions in [chrome-extension/README.md](chrome-extension/README.md)
3. Get your Firebase token (see below)
4. Connect the extension
5. Join a Google Meet/Zoom/Teams call
6. Questions from chat/captions will appear in the copilot automatically

#### Getting Your Firebase Token

1. Open the web app
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run:
   ```javascript
   firebase.auth().currentUser.getIdToken().then(token => {
     console.log(token);
     navigator.clipboard.writeText(token);
     console.log('Token copied to clipboard!');
   });
   ```
5. Paste the token into the extension popup

### Mock Interview

1. Go to `/mock-interview`
2. Enter job role and experience level
3. Click "Start Mock Interview"
4. Answer 10 AI-generated questions
5. Get feedback on each answer

### Resume Upload

1. Go to `/resume`
2. Drag & drop a PDF resume
3. AI will extract skills, experience, and target roles
4. Your copilot answers will now be personalized

### Reports

1. Go to `/reports`
2. View all past interview sessions
3. Click any session to see full Q&A transcript
4. Track performance over time

## Troubleshooting

### "Error connecting to MongoDB"
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas whitelist includes your IP
- Ensure MongoDB cluster is running

### "OpenRouter API error"
- Verify `OPENROUTER_API_KEY` is set
- Check you have credits/free tier access
- Try a different model in `lib/openrouter.ts`

### "Firebase auth failed"
- Check Firebase project is active
- Verify OAuth providers are enabled
- Ensure redirect URLs are configured

### Speech recognition not working
- Only works in Chrome/Edge
- Requires HTTPS in production (localhost is fine)
- Check microphone permissions

### Extension not detecting questions
- Verify extension is connected (green dot)
- Check browser console for errors
- Ensure you're on a supported platform (Meet/Zoom/Teams)

## Development Tips

### Hot Reload
Next.js supports hot reload. Changes to files will automatically refresh the browser.

### Database Inspection
Use MongoDB Compass or MongoDB Atlas UI to inspect your database.

### Testing Payments
Polar.sh is in sandbox mode by default. No real charges will occur.

### Debugging API Routes
Check terminal logs for API route errors. Add `console.log()` statements as needed.

### Inspecting Network Requests
Use browser DevTools Network tab to inspect API calls and SSE connections.

## Optional Configuration

### Change AI Model

Edit `lib/openrouter.ts`:

```typescript
const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';
// Change to another free model or paid model
```

### Adjust Question Detection Sensitivity

Edit `lib/question-detector.ts`:

```typescript
const isQuestion = confidenceScore >= 40; // Lower to detect more, raise to be stricter
```

### Customize UI Theme

Edit `tailwind.config.ts` to change colors:

```typescript
neon: {
  cyan: '#00ffff',     // Change these
  magenta: '#ff00ff',
  // ...
}
```

## Next Steps

1. ✅ Get the app running locally
2. ✅ Test all major features
3. ✅ Customize for your use case
4. 📦 Deploy to production (see [DEPLOYMENT.md](DEPLOYMENT.md))
5. 🚀 Share with the world!

## Getting Help

- Check the [README.md](README.md) for feature details
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Open an issue on GitHub for bugs
- Check browser console and terminal logs for errors

## What's Already Configured

These are pre-configured in the `.env` file:
- ✅ MongoDB connection string
- ✅ Firebase client config (in `lib/firebase.ts`)
- ✅ Polar.sh sandbox credentials
- ✅ Polar.sh organization ID

You only need to add:
- ⚠️ OpenRouter API key (required)
- ⚠️ Firebase Admin credentials (optional but recommended)

Happy coding! 🎉
