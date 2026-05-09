# Quick Start Guide

Get up and running in under 5 minutes!

## 1. Install Dependencies (30 seconds)

```bash
npm install
```

## 2. Get OpenRouter API Key (2 minutes)

1. Go to https://openrouter.ai
2. Sign up (free)
3. Go to Settings → API Keys
4. Create a key
5. Copy it

## 3. Add to .env

Open `.env` and add your OpenRouter key:

```
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

The `.env` file already has everything else configured!

## 4. Run the App (10 seconds)

```bash
npm run dev
```

Open http://localhost:3000

## 5. Sign In

Click "Continue with Google" or "Continue with GitHub"

## 6. Start Using It!

### Test the Copilot

1. Go to `/copilot`
2. Enter job role: "Software Engineer"
3. Click "Start Meeting"
4. Type a question manually in the right panel
5. Watch the AI answer stream!

Example questions to try:
- "Tell me about your experience with React"
- "How do you handle conflicts in a team?"
- "What is your greatest weakness?"

### Try Mock Interview

1. Go to `/mock-interview`
2. Enter job role and level
3. Click "Start Mock Interview"
4. Answer a few questions
5. Get AI feedback!

### Upload Resume (Optional)

1. Go to `/resume`
2. Drag & drop a PDF
3. AI extracts your skills
4. Now copilot answers are personalized!

## 🎉 That's It!

You're ready to ace your interviews.

## What's Next?

### For Development:
- Read [FEATURES.md](FEATURES.md) for full feature docs
- Read [SETUP.md](SETUP.md) for detailed setup
- Customize the UI in `app/globals.css`

### For Production:
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide
- Get Firebase Admin credentials (optional)
- Deploy to Vercel

### Install Chrome Extension:
1. Go to `chrome://extensions`
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select `chrome-extension/` folder
5. Follow [chrome-extension/README.md](chrome-extension/README.md)

## Troubleshooting

**"OpenRouter API error"**
- Check your API key is correct
- Make sure you have free tier access
- Try visiting openrouter.ai to verify your account

**"Can't connect to MongoDB"**
- The pre-configured connection should work
- If not, create your own MongoDB Atlas cluster
- Update `MONGODB_URI` in `.env`

**"Speech recognition not working"**
- Only works in Chrome/Edge
- Check microphone permissions
- Try manual input instead

## Need Help?

- 📖 Read [README.md](README.md)
- 🔧 Read [SETUP.md](SETUP.md)
- 📚 Read [FEATURES.md](FEATURES.md)
- 🚀 Read [DEPLOYMENT.md](DEPLOYMENT.md)

Happy interviewing! 🎯
