# Project Structure

Complete directory structure and file organization.

```
Ai-interview-service/
│
├── app/                                    # Next.js App Router pages
│   ├── api/                               # API routes
│   │   ├── auth/
│   │   │   └── user/route.ts             # Get/update user data
│   │   ├── copilot/
│   │   │   ├── stream/route.ts           # SSE streaming AI answers
│   │   │   ├── ingest/route.ts           # Receive questions from extension
│   │   │   └── listen/route.ts           # SSE connection for live updates
│   │   ├── mock/
│   │   │   ├── generate/route.ts         # Generate mock questions
│   │   │   └── evaluate/route.ts         # Evaluate answers
│   │   ├── polar/
│   │   │   └── webhook/route.ts          # Polar.sh payment webhooks
│   │   ├── reports/route.ts              # Get session history
│   │   ├── resume/
│   │   │   └── upload/route.ts           # Upload and parse PDF
│   │   └── session/
│   │       ├── start/route.ts            # Create new session
│   │       ├── end/route.ts              # End session
│   │       └── [id]/route.ts             # Get session by ID
│   │
│   ├── copilot/page.tsx                  # Main copilot dashboard
│   ├── mock-interview/page.tsx           # Mock interview practice
│   ├── resume/page.tsx                   # Resume upload/management
│   ├── reports/page.tsx                  # Session reports and analytics
│   ├── pricing/page.tsx                  # Pricing plans and upgrade
│   ├── payment/
│   │   └── success/page.tsx              # Payment success redirect
│   ├── page.tsx                          # Landing page with auth
│   ├── layout.tsx                        # Root layout with AuthProvider
│   └── globals.css                       # Global styles and utilities
│
├── components/                            # React components
│   ├── copilot/
│   │   ├── LeftPanel.tsx                 # Meeting control panel
│   │   ├── CenterPanel.tsx               # Q&A feed
│   │   ├── RightPanel.tsx                # Quick actions
│   │   ├── QuestionCard.tsx              # Individual question/answer card
│   │   ├── FloatingMiniMode.tsx          # Draggable mini widget
│   │   └── SpeechRecognitionManager.tsx  # Speech API wrapper
│   ├── AuthProvider.tsx                  # Firebase auth listener
│   └── Navbar.tsx                        # Navigation bar
│
├── store/                                 # Zustand state management
│   ├── auth-store.ts                     # Auth state (user, userData)
│   └── copilot-store.ts                  # Copilot state (questions, settings)
│
├── lib/                                   # Utility libraries
│   ├── mongodb.ts                        # MongoDB connection
│   ├── firebase.ts                       # Firebase client config
│   ├── firebase-admin.ts                 # Firebase admin SDK
│   ├── openrouter.ts                     # OpenRouter API functions
│   └── question-detector.ts              # Question detection algorithm
│
├── models/                                # MongoDB Mongoose models
│   ├── User.ts                           # User schema
│   └── InterviewSession.ts               # Session and Question schemas
│
├── hooks/                                 # Custom React hooks
│   └── useSpeechRecognition.ts           # Web Speech API hook
│
├── chrome-extension/                      # Chrome Extension (Manifest V3)
│   ├── manifest.json                     # Extension configuration
│   ├── background.js                     # Service worker
│   ├── utils.js                          # Shared question detection
│   ├── content-meet.js                   # Google Meet integration
│   ├── content-zoom.js                   # Zoom web integration
│   ├── content-teams.js                  # Teams integration
│   ├── popup.html                        # Extension popup UI
│   ├── popup.js                          # Popup logic
│   ├── icons/                            # Extension icons
│   │   └── README.md                     # Icon requirements
│   └── README.md                         # Extension documentation
│
├── public/                                # Static assets (if any)
│
├── .vscode/                              # VS Code settings
│   └── settings.json                     # Editor config
│
├── .env                                  # Environment variables (DO NOT COMMIT)
├── .env.example                          # Example environment variables
├── .gitignore                            # Git ignore rules
├── .prettierrc                           # Prettier configuration
├── .eslintrc.json                        # ESLint configuration
│
├── package.json                          # Dependencies and scripts
├── tsconfig.json                         # TypeScript configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
├── postcss.config.mjs                    # PostCSS configuration
├── next.config.mjs                       # Next.js configuration
│
├── README.md                             # Main documentation
├── QUICKSTART.md                         # 5-minute quick start
├── SETUP.md                              # Detailed setup instructions
├── FEATURES.md                           # Feature documentation
├── DEPLOYMENT.md                         # Deployment guide
├── PROJECT_STRUCTURE.md                  # This file
└── LICENSE                               # MIT License
```

## File Descriptions

### Core Application Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page with Google/GitHub sign-in |
| `app/copilot/page.tsx` | Main dashboard with 3-panel layout |
| `app/layout.tsx` | Root layout, includes AuthProvider |
| `app/globals.css` | Global styles, dark theme, neon accents |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/copilot/stream` | POST | Stream AI answer via SSE |
| `/api/copilot/ingest` | POST | Receive question from extension |
| `/api/copilot/listen` | GET | SSE connection for live updates |
| `/api/session/start` | POST | Create interview session |
| `/api/session/end` | POST | End session and calculate duration |
| `/api/session/:id` | GET | Get session details |
| `/api/auth/user` | GET/PATCH | Get or update user data |
| `/api/resume/upload` | POST | Upload and parse PDF resume |
| `/api/mock/generate` | POST | Generate mock questions |
| `/api/mock/evaluate` | POST | Evaluate answer |
| `/api/reports` | GET | Get all user sessions |
| `/api/polar/webhook` | POST | Handle payment webhooks |

### Components

| Component | Purpose |
|-----------|---------|
| `LeftPanel` | Platform/role selection, meeting controls |
| `CenterPanel` | Q&A feed, displays questions and answers |
| `RightPanel` | Manual input, answer style, notes |
| `QuestionCard` | Individual Q&A with streaming answer |
| `FloatingMiniMode` | Draggable mini widget (Ctrl+Shift+Space) |
| `SpeechRecognitionManager` | Handles Web Speech API |
| `AuthProvider` | Wraps app, manages Firebase auth state |
| `Navbar` | Navigation with plan badge and sign out |

### State Management (Zustand)

| Store | State |
|-------|-------|
| `auth-store` | user, userData, loading |
| `copilot-store` | sessionId, jobRole, platform, questions[], settings |

### Libraries

| Library | Purpose |
|---------|---------|
| `mongodb.ts` | Connection with caching |
| `firebase.ts` | Client-side auth (Google/GitHub) |
| `firebase-admin.ts` | Server-side token verification |
| `openrouter.ts` | AI API, streaming, question generation |
| `question-detector.ts` | Multi-factor question detection |

### Models

| Model | Fields |
|-------|--------|
| `User` | uid, email, plan, resume, usage counters |
| `InterviewSession` | userId, type, jobRole, questions[], timestamps |

### Chrome Extension

| File | Purpose |
|------|---------|
| `manifest.json` | Extension metadata, permissions |
| `background.js` | Service worker, keeps alive |
| `utils.js` | Shared question detection logic |
| `content-meet.js` | Google Meet chat/caption observer |
| `content-zoom.js` | Zoom web chat/caption observer |
| `content-teams.js` | Teams chat/caption observer |
| `popup.html/js` | Configuration UI, connection setup |

### Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables (secrets) |
| `tsconfig.json` | TypeScript compiler options |
| `tailwind.config.ts` | Theme colors, utilities |
| `next.config.mjs` | Next.js settings |
| `.prettierrc` | Code formatting rules |
| `.eslintrc.json` | Linting rules |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Project overview, features, tech stack |
| `QUICKSTART.md` | Get running in 5 minutes |
| `SETUP.md` | Detailed setup instructions |
| `FEATURES.md` | In-depth feature documentation |
| `DEPLOYMENT.md` | Production deployment guide |
| `PROJECT_STRUCTURE.md` | This file, directory structure |

## Key Dependencies

### Production Dependencies

```json
{
  "@polar-sh/nextjs": "^1.0.0",      // Polar.sh integration
  "firebase": "^10.7.1",               // Client-side auth
  "firebase-admin": "^12.0.0",         // Server-side auth
  "mongoose": "^8.0.3",                // MongoDB ODM
  "next": "14.2.0",                    // React framework
  "pdf-parse": "^1.1.1",               // PDF extraction
  "react": "^18.2.0",                  // UI library
  "recharts": "^2.10.3",               // Charts
  "zustand": "^4.4.7"                  // State management
}
```

### Dev Dependencies

```json
{
  "@types/node": "^20",
  "@types/react": "^18",
  "autoprefixer": "^10.0.1",           // PostCSS plugin
  "eslint": "^8",                      // Linting
  "postcss": "^8",                     // CSS processing
  "tailwindcss": "^3.3.0",             // Utility CSS
  "typescript": "^5"                   // Type safety
}
```

## Environment Variables

### Required

```bash
MONGODB_URI                           # MongoDB connection string
OPENROUTER_API_KEY                    # AI API key
FIREBASE_PROJECT_ID                   # Firebase project
NEXT_PUBLIC_APP_URL                   # App URL
```

### Optional (Enhanced Features)

```bash
FIREBASE_CLIENT_EMAIL                 # Firebase admin
FIREBASE_PRIVATE_KEY                  # Firebase admin
POLAR_ACCESS_TOKEN                    # Payments
POLAR_WEBHOOK_SECRET                  # Payment security
NEXT_PUBLIC_POLAR_ORGANIZATION_ID     # Payment org
```

## Data Flow

### Live Interview Assistant

```
User Action → Speech/Extension/Manual
    ↓
Question Detection
    ↓
POST /api/copilot/stream
    ↓
OpenRouter API
    ↓
SSE Stream Back
    ↓
UI Updates (Zustand)
    ↓
Save to MongoDB
```

### Chrome Extension

```
Meeting Platform (Meet/Zoom/Teams)
    ↓
DOM MutationObserver (Chat/Captions)
    ↓
Question Detection (utils.js)
    ↓
POST /api/copilot/ingest
    ↓
SSE Push to Client (/api/copilot/listen)
    ↓
UI Updates
```

### Payment Flow

```
User Clicks "Upgrade"
    ↓
Polar.sh Checkout
    ↓
Payment Complete
    ↓
Webhook → /api/polar/webhook
    ↓
Update User.plan in MongoDB
    ↓
Redirect to Success Page
```

## Architecture Decisions

### Why Next.js 14 App Router?
- Server-side rendering for SEO
- API routes for backend
- File-based routing
- Built-in TypeScript support

### Why MongoDB?
- Flexible schema for questions/sessions
- Free tier (Atlas)
- Easy scaling
- Mongoose ODM for type safety

### Why Firebase Auth?
- Free tier includes Google/GitHub OAuth
- No password management
- Secure token verification
- Easy client/server integration

### Why OpenRouter?
- Access to free models (Llama 3.1 8B)
- Unified API for multiple providers
- Streaming support
- Pay-as-you-go pricing

### Why Zustand?
- Simpler than Redux
- No boilerplate
- TypeScript friendly
- Perfect for small-medium state

### Why SSE over WebSockets?
- Simpler protocol
- One-way push (sufficient for this use case)
- Works through firewalls/proxies
- Auto-reconnect in browsers

### Why Chrome Extension (not app)?
- No interviewer sees it
- Works invisibly
- Easy distribution
- Access to page DOM

## Performance Considerations

### Frontend
- Lazy loading for heavy pages
- Memoized components
- Debounced speech processing
- Optimistic UI updates

### Backend
- MongoDB connection pooling
- Cached database connections
- Streamed AI responses
- Indexed database queries

### Extension
- MutationObserver (efficient DOM watching)
- Debounced question processing
- Minimal background processing

## Security Measures

- Firebase token verification on all API routes
- MongoDB connection over SSL
- Environment variables for secrets
- Input validation on all forms
- CORS configured for specific origins
- Webhook signature verification (Polar.sh)
- No sensitive data in extension storage
- HTTPS required in production

## Testing Strategy

### Manual Testing Checklist

- [ ] Sign in with Google
- [ ] Sign in with GitHub
- [ ] Upload resume
- [ ] Start live session
- [ ] Test microphone detection
- [ ] Test manual question input
- [ ] Test answer styles
- [ ] Start mock interview
- [ ] Complete mock interview
- [ ] View reports
- [ ] Test payment flow
- [ ] Install Chrome extension
- [ ] Test extension in Meet
- [ ] Test extension in Zoom
- [ ] Test floating mini mode

### Automated Testing (Future)

- Unit tests for question detection
- API route integration tests
- E2E tests with Playwright
- Extension content script tests

## Deployment Checklist

- [ ] All environment variables set
- [ ] MongoDB Atlas cluster created
- [ ] Firebase project configured
- [ ] OpenRouter API key obtained
- [ ] Polar.sh product created
- [ ] Extension updated with production URL
- [ ] HTTPS enabled
- [ ] Domain configured
- [ ] Webhooks tested
- [ ] Error monitoring setup
- [ ] Analytics enabled

---

Need help navigating the codebase? Start with [README.md](README.md) or [QUICKSTART.md](QUICKSTART.md).
