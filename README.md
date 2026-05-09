# AI Interview Copilot SaaS

A full-stack AI-powered interview assistant that works invisibly alongside Google Meet, Zoom, and Microsoft Teams. Get real-time AI-generated answers to interview questions detected automatically from speech, chat, and captions.

## 🚀 Features

### Live Interview Assistant (Primary Feature)
- **Real-time Question Detection** from:
  - Microphone (Web Speech API)
  - Chat messages (Chrome Extension)
  - Live captions/subtitles (Chrome Extension)
- **Instant AI Answers** streaming in under 2 seconds
- **Multi-platform Support**: Google Meet, Zoom, Microsoft Teams
- **Resume Personalization**: Answers tailored to your experience
- **Floating Mini Mode**: Draggable overlay for quick reference
- **Three-panel Dashboard**: Control panel, Q&A feed, quick actions

### Chrome Extension
- Manifest V3 compliant
- Invisible operation (zero UI on meeting pages)
- Automatic question detection from chat and captions
- Real-time sync with web app via Server-Sent Events

### Mock Interview Practice
- AI-generated questions based on job role and level
- Answer evaluation with detailed feedback
- Track progress over time

### Resume Management
- PDF upload and parsing
- AI extraction of skills, experience, and roles
- Auto-inject into copilot prompts

### Reports & Analytics
- Session history with full Q&A transcripts
- Performance charts
- Usage statistics

### Pricing & Payments (Polar.sh)
- Free tier: 10 answers/month, 2 mock interviews
- Pro tier: Unlimited everything
- Webhook integration for automatic upgrades

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS (dark theme, neon accents)
- **AI**: OpenRouter API (meta-llama/llama-3.1-8b-instruct:free)
- **Auth**: Firebase Authentication (Google + GitHub OAuth)
- **Database**: MongoDB with Mongoose
- **Payments**: Polar.sh
- **PDF**: pdf-parse
- **Speech**: Web Speech API
- **State**: Zustand
- **Real-time**: Server-Sent Events (SSE)
- **Charts**: Recharts

## 📦 Installation

### 1. Clone Repository

```bash
git clone <repo-url>
cd Ai-interview-service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required:
- MongoDB URI
- Firebase credentials
- OpenRouter API key
- Polar.sh credentials (for payments)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `chrome-extension` folder
5. Click the extension icon and connect with your Firebase token

See [chrome-extension/README.md](chrome-extension/README.md) for details.

## 📖 Usage

### Live Interview Assistant

1. Sign in with Google or GitHub
2. Go to `/copilot`
3. Select platform (Meet/Zoom/Teams) and job role
4. Upload your resume (optional, recommended)
5. Click **Start Meeting**
6. Enable microphone listening or install Chrome extension
7. Questions will appear automatically with AI answers streaming

### Mock Interview

1. Go to `/mock-interview`
2. Enter job role and experience level
3. Click **Start Mock Interview**
4. Answer 10 AI-generated questions
5. Get detailed feedback on each answer

### Reports

1. Go to `/reports`
2. View all past sessions
3. Click any session to see full Q&A transcript
4. Track performance over time

## 🎯 Question Detection

Questions are detected using multiple signals:

1. **Ends with ?**
2. **Starts with question keywords**: "Tell me", "Explain", "Describe", "What is", "How would", etc.
3. **Contains interview phrases**: "your experience", "a time when", "give me an example", etc.
4. **Silence pause detection**: 2.5+ seconds after sentence
5. **Minimum 6 words** to filter noise

Confidence score (0-100) based on matched patterns.

## 🔒 Security & Privacy

- All authentication via Firebase
- MongoDB with secure connections
- No data stored in Chrome extension
- Completely invisible to interviewers
- Optional: Delete sessions after interviews

## 🎨 UI/UX Highlights

- **Bold dark theme** with neon cyan/purple/magenta accents
- **Glass-morphism panels** with backdrop blur
- **Real-time streaming** text animation
- **Responsive design** for all screen sizes
- **Keyboard shortcuts**: Ctrl+Shift+Space for mini mode

## 📊 Database Schema

### User
- uid, email, displayName, provider
- plan (free/pro)
- copilotAnswersUsed, mockInterviewsUsed
- resume (skills, experience, targetRoles)

### InterviewSession
- userId, type (live/mock)
- jobRole, platform
- questions[] (question, answer, source, confidence, timestamp)
- startTime, endTime, duration, status

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables in Production

Don't forget:
- Set `NEXT_PUBLIC_APP_URL` to your domain
- Update Chrome extension `host_permissions` in manifest.json
- Configure Polar webhook URL

## 🔌 API Routes

- `POST /api/copilot/stream` - Stream AI answer
- `POST /api/copilot/ingest` - Receive question from extension
- `GET /api/copilot/listen` - SSE connection for live updates
- `POST /api/session/start` - Create session
- `POST /api/session/end` - End session
- `GET /api/session/:id` - Get session details
- `POST /api/resume/upload` - Upload and parse resume
- `POST /api/mock/generate` - Generate mock questions
- `POST /api/mock/evaluate` - Evaluate answer
- `GET /api/reports` - Get all sessions
- `POST /api/polar/webhook` - Polar.sh webhook

## 🐛 Troubleshooting

### Extension not detecting questions?
- Check connection status (green dot in popup)
- Enable captions in the meeting
- Check browser console for errors

### Microphone not working?
- Grant microphone permissions
- Check browser supports Web Speech API (Chrome/Edge)
- Ensure HTTPS in production

### Answers not streaming?
- Check OpenRouter API key
- Verify MongoDB connection
- Check browser console for errors

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Open an issue or PR.

## 📧 Support

For issues, open a GitHub issue or contact support.
