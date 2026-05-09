# Feature Documentation

Detailed documentation of all features in the AI Interview Copilot.

## Table of Contents

1. [Live Interview Assistant](#live-interview-assistant)
2. [Question Detection](#question-detection)
3. [Chrome Extension](#chrome-extension)
4. [Mock Interview](#mock-interview)
5. [Resume Management](#resume-management)
6. [Reports & Analytics](#reports--analytics)
7. [Pricing & Payments](#pricing--payments)

---

## Live Interview Assistant

The core feature of the application. Provides real-time AI-generated answers during live interviews.

### How It Works

1. **Start Session**: User selects platform (Meet/Zoom/Teams) and job role
2. **Question Detection**: Questions detected via:
   - Microphone (Web Speech API)
   - Chrome extension (chat + captions)
   - Manual input
3. **AI Processing**: Question sent to OpenRouter API
4. **Streaming Response**: Answer streams back in real-time (SSE)
5. **Display**: Answer appears in the Q&A feed with source badge

### Three-Panel Layout

#### Left Panel - Meeting Control
- Platform selector (Meet/Zoom/Teams/Other)
- Job role input (pre-filled from resume if available)
- Extension connection status
- Meeting status (Waiting/Active)
- Microphone status with audio visualizer
- System audio toggle
- Session timer
- Start/End meeting buttons

#### Center Panel - Live Q&A Feed
- Real-time feed of detected questions
- Each question shows:
  - Source badge (MIC/CHAT/CAPTION/MANUAL)
  - Platform badge (Meet/Zoom/Teams)
  - Timestamp
  - Question text
  - Streaming AI answer
  - Confidence score
  - Copy/Regenerate/Mark as Answered buttons
- Auto-scroll to newest questions
- Empty state when no questions

#### Right Panel - Quick Actions
- Manual question input (textarea + paste button)
- Resume context toggle
- Answer style selector:
  - **Concise**: 1 paragraph, quick answer
  - **STAR Format**: Structured behavioral (Situation, Task, Action, Result)
  - **Technical**: Detailed with examples and analogies
- Keyword cheatsheet (interview buzzwords)
- Quick notes textarea

### Floating Mini Mode

- Triggered by `Ctrl+Shift+Space`
- Draggable 320px window
- Shows only latest question + answer
- Semi-transparent glass design
- Can be repositioned anywhere on screen
- Perfect for keeping on top of meeting window

### Answer Personalization

When resume is uploaded:
- Skills automatically injected into prompts
- Experience included in context
- Answers reference specific projects/technologies
- More authentic and detailed responses

### Usage Limits

**Free Plan:**
- 10 copilot answers per month
- Usage tracked in MongoDB User model
- API route checks limit before generating
- Error shown when limit reached

**Pro Plan:**
- Unlimited answers
- No checks, always generates

---

## Question Detection

Sophisticated multi-factor detection algorithm.

### Detection Rules

A text is considered a question if it meets threshold (40+ confidence points):

| Rule | Points | Examples |
|------|--------|----------|
| Ends with `?` | 40 | "What is your experience with React?" |
| Starts with question word | 30 | "Tell me about...", "Explain how...", "Describe your..." |
| Contains interview phrase | 15 | "your experience with", "a time when", "give me an example" |
| Contains WH-word in first 3 words | 10 | "What", "Where", "When", "Why", "Who", "How" |

### Minimum Requirements
- At least 6 words (filters out noise like "Hello?", "OK?")
- Text must be trimmed and non-empty

### Confidence Scoring
- 0-39: Not a question
- 40-69: Likely a question
- 70-100: Definitely a question

### False Positive Prevention
- Short phrases filtered out
- Non-interview questions (e.g., "What's the weather?") get low confidence
- Context-aware keyword matching

### Question Sources

1. **Microphone (Web Speech API)**
   - Continuous listening mode
   - Interim results shown
   - Final results processed
   - Pause detection (2.5s silence)
   - Buffer-based sentence reconstruction

2. **Chrome Extension - Chat**
   - MutationObserver watches DOM
   - Detects new messages instantly
   - Platform-specific selectors
   - Deduplication via Set

3. **Chrome Extension - Captions**
   - Watches live caption containers
   - Buffers partial sentences
   - Reconstructs complete sentences
   - Timeout-based flush (3s)

4. **Manual Input**
   - Textarea in right panel
   - Paste from clipboard button
   - Ctrl+Enter shortcut to submit

---

## Chrome Extension

Manifest V3 extension for invisible question detection.

### Architecture

```
manifest.json          → Extension config
background.js          → Service worker
utils.js               → Shared detection logic
content-meet.js        → Google Meet integration
content-zoom.js        → Zoom web integration
content-teams.js       → Teams integration
popup.html/popup.js    → Configuration UI
```

### Content Scripts

Each platform has its own content script with:
- **Chat Detection**: MutationObserver on chat container
- **Caption Detection**: MutationObserver on caption container
- **Meeting Detection**: Checks if in active call
- **Question Validation**: Uses shared `isInterviewQuestion()`
- **Backend Communication**: Posts to `/api/copilot/ingest`

### Popup Configuration

User must:
1. Enter API URL (defaults to localhost:3000)
2. Enter Firebase token (from web app)
3. Click "Connect Extension"

Connection status shown with green dot.

### Security

- No data stored locally
- Token stored in chrome.storage.local
- Encrypted communication with backend
- Zero visible UI on meeting pages

### Supported Platforms

| Platform | URL Pattern | Chat | Captions | Status |
|----------|-------------|------|----------|--------|
| Google Meet | meet.google.com | ✅ | ✅ | Stable |
| Zoom Web | zoom.us/wc | ✅ | ✅ | Stable |
| Microsoft Teams | teams.microsoft.com | ✅ | ✅ | Stable |

---

## Mock Interview

Practice mode with AI-generated questions and feedback.

### Flow

1. **Setup**
   - User enters job role (e.g., "Senior Backend Engineer")
   - Selects experience level (Entry/Mid/Senior/Lead)
   - Clicks "Start Mock Interview"

2. **Generation**
   - API calls OpenRouter to generate 10 questions
   - Mix of behavioral and technical questions
   - Relevant to job role and level

3. **Interview**
   - Questions shown one at a time
   - Textarea for user answer
   - Skip button to move ahead
   - Progress bar at bottom
   - Question counter (e.g., "3 of 10")

4. **Evaluation**
   - All answers sent to OpenRouter for evaluation
   - Feedback includes:
     - Relevance assessment
     - Clarity and structure notes
     - Specific improvements
     - Score out of 10
   - Streaming evaluation (one at a time)

5. **Results**
   - Full list of Q&A pairs with feedback
   - Can restart for new session
   - Session saved to MongoDB

### Usage Limits

**Free Plan:**
- 2 mock interviews per month
- Full 10 questions per interview
- AI feedback on all answers

**Pro Plan:**
- Unlimited mock interviews

---

## Resume Management

Upload and parse PDF resumes for personalized answers.

### Upload Process

1. User drags PDF or clicks to browse
2. File sent to `/api/resume/upload`
3. Server uses `pdf-parse` to extract text
4. OpenRouter extracts structured data:
   - Name
   - Skills (array)
   - Experience (job titles/companies)
   - Target roles
5. Data saved to User document in MongoDB

### Resume Usage

Once uploaded:
- Skills and experience auto-injected into AI prompts
- Copilot answers reference specific projects
- More authentic, personalized responses
- Increases credibility in answers

### Display

Resume data shown in cards:
- Skills as neon cyan tags
- Experience as bullet list
- Target roles as neon purple tags
- "Upload New Resume" button to replace

### Data Structure

```typescript
{
  name: string;
  skills: string[];
  experience: string[];
  targetRoles: string[];
  rawText: string; // First 2000 chars
}
```

---

## Reports & Analytics

View past interview sessions and performance.

### Overview Page

**Stats Cards:**
- Total sessions count
- Total questions answered
- Copilot answers used (for quota tracking)

**Chart:**
- Line chart showing questions per session
- Last 10 sessions
- X-axis: Session number
- Y-axis: Question count

**Sessions List:**
- Sorted by most recent first
- Each session shows:
  - Type badge (LIVE/MOCK)
  - Platform badge (if live)
  - Job role
  - Date
  - Duration
  - Question count

### Session Detail Modal

Click any session to see:
- Full job role and timestamp
- All Q&A pairs
- Answers shown in gray boxes
- Close button to exit

### Data Retention

**Free Plan:**
- Last 30 days of history

**Pro Plan:**
- Unlimited history

---

## Pricing & Payments

Polar.sh integration for subscriptions.

### Plans

| Feature | Free | Pro |
|---------|------|-----|
| Copilot answers | 10/month | Unlimited |
| Mock interviews | 2/month | Unlimited |
| Resume personalization | ❌ | ✅ |
| Report history | 30 days | Unlimited |
| All answer styles | ❌ | ✅ |
| Priority support | ❌ | ✅ |
| **Price** | **$0** | **$19/month** |

### Payment Flow

1. User clicks "Upgrade to Pro" on `/pricing`
2. Redirected to Polar.sh checkout
3. Completes payment
4. Polar.sh sends webhook to `/api/polar/webhook`
5. User.plan updated to "pro" in MongoDB
6. User redirected to `/payment/success`
7. Auto-redirect to `/copilot` after 5 seconds

### Webhook Events

| Event | Action |
|-------|--------|
| `checkout.completed` | Upgrade to Pro |
| `subscription.created` | Upgrade to Pro |
| `subscription.cancelled` | Downgrade to Free |
| `subscription.expired` | Downgrade to Free |

### Quota Tracking

On each copilot answer:
1. Check user plan
2. If Free, check `copilotAnswersUsed < 10`
3. If limit reached, return 403 error
4. If OK, increment counter
5. Generate answer

Pro users skip all checks.

### Security

- Webhook signature verification
- HMAC SHA-256 with secret
- Reject invalid signatures

---

## Technical Implementation Details

### Real-Time Communication (SSE)

**Server → Client:**
- `/api/copilot/listen` - Long-lived SSE connection
- Heartbeat every 15 seconds
- Extension messages pushed instantly

**Client → Server:**
- `/api/copilot/stream` - SSE for AI answers
- Chunks sent as they arrive from OpenRouter
- `[DONE]` message signals completion

### State Management (Zustand)

**AuthStore:**
- Firebase user object
- User data from MongoDB
- Loading state

**CopilotStore:**
- Session ID
- Job role, platform
- Questions array
- Current question
- Settings (answer style, use resume, etc.)
- Meeting status
- Extension connection status

### Database Schema

**User:**
```typescript
{
  uid: string;           // Firebase UID
  email: string;
  displayName: string;
  plan: 'free' | 'pro';
  copilotAnswersUsed: number;
  resume?: ResumeData;
}
```

**InterviewSession:**
```typescript
{
  userId: string;
  type: 'live' | 'mock';
  jobRole: string;
  questions: Question[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
}
```

**Question:**
```typescript
{
  question: string;
  answer: string;
  source: 'mic' | 'chat' | 'caption' | 'manual';
  confidence: number;
  timestamp: Date;
  answerStyle: 'concise' | 'star' | 'technical';
}
```

### Performance Optimizations

- SSE instead of WebSockets (simpler, works everywhere)
- Debounced speech recognition processing
- Memoized components with React hooks
- Lazy loading of heavy pages
- Optimistic UI updates

---

## Future Enhancements

### Planned Features

- [ ] Video practice mode with webcam
- [ ] Voice answer mode (text-to-speech)
- [ ] Team collaboration (share sessions)
- [ ] Interview question bank
- [ ] Company-specific question sets
- [ ] Integration with LinkedIn
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)

### Community Requests

- Multi-language support
- Custom AI models
- On-premise deployment
- API for developers

---

Need help? Check [README.md](README.md) or [SETUP.md](SETUP.md).
