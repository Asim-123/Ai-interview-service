# Getting Started with AI Interview Copilot

Welcome! This guide will help you understand and use the AI Interview Copilot.

## What is This?

AI Interview Copilot is a **real-time interview assistant** that works invisibly alongside your video calls (Google Meet, Zoom, Teams). It automatically detects interview questions and streams AI-generated answers instantly.

Think of it as having an expert coach whispering answers in your ear during live interviews.

## Key Features at a Glance

1. **Live Interview Assistant** - Main feature, real-time help during calls
2. **Chrome Extension** - Invisible detection from chat/captions
3. **Web Speech API** - Microphone-based question detection
4. **Resume Personalization** - Answers based on your experience
5. **Mock Interviews** - Practice with AI-generated questions
6. **Reports** - Track your performance over time
7. **Floating Mini Mode** - Draggable overlay for quick reference

## Documentation Index

Pick the right guide for your needs:

| Document | Best For | Time Required |
|----------|----------|---------------|
| [QUICKSTART.md](QUICKSTART.md) | **Get running ASAP** | 5 minutes |
| [SETUP.md](SETUP.md) | **Detailed setup** | 15 minutes |
| [FEATURES.md](FEATURES.md) | **Learn all features** | 30 minutes |
| [DEPLOYMENT.md](DEPLOYMENT.md) | **Deploy to production** | 1-2 hours |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | **Understand codebase** | 20 minutes |
| [README.md](README.md) | **Overview + tech stack** | 10 minutes |

## Quick Decision Tree

### I want to...

**...use it right now:**
→ Follow [QUICKSTART.md](QUICKSTART.md)
- Install dependencies
- Get OpenRouter API key
- Run `npm run dev`
- Sign in and test

**...understand how it works:**
→ Read [FEATURES.md](FEATURES.md)
- Detailed feature explanations
- How question detection works
- Chrome extension architecture
- API documentation

**...set it up properly:**
→ Follow [SETUP.md](SETUP.md)
- Configure all services
- Get Firebase credentials
- Test all features
- Troubleshooting guide

**...deploy to production:**
→ Follow [DEPLOYMENT.md](DEPLOYMENT.md)
- Vercel deployment
- Environment variables
- Domain setup
- Webhook configuration

**...contribute or modify:**
→ Read [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- File organization
- Component hierarchy
- State management
- Architecture decisions

## Common Workflows

### First-Time User

1. Read [README.md](README.md) to understand what this is
2. Follow [QUICKSTART.md](QUICKSTART.md) to run locally
3. Test the live copilot
4. Try mock interview
5. Upload a resume

### Developer Contributing

1. Clone the repository
2. Follow [SETUP.md](SETUP.md) for detailed setup
3. Read [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) to understand codebase
4. Read [FEATURES.md](FEATURES.md) to understand features
5. Make changes and test
6. Submit PR

### Deploying to Production

1. Ensure you've tested locally first
2. Create accounts:
   - Vercel (or other host)
   - MongoDB Atlas
   - Firebase (with OAuth configured)
   - OpenRouter
   - Polar.sh (for payments)
3. Follow [DEPLOYMENT.md](DEPLOYMENT.md) step by step
4. Test everything in production
5. Monitor for issues

## Prerequisites

### To Run Locally

**Required:**
- Node.js 18+
- OpenRouter API key (free)

**Optional (for full features):**
- Firebase Admin credentials
- Polar.sh sandbox account

### To Deploy to Production

**Required:**
- All of the above
- MongoDB Atlas account (free)
- Firebase project with OAuth configured
- Vercel account (free)
- Domain name (optional but recommended)

**Optional:**
- Polar.sh production account (for real payments)

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication |
| Database | MongoDB + Mongoose |
| AI | OpenRouter API |
| State | Zustand |
| Real-time | Server-Sent Events (SSE) |
| Payments | Polar.sh |
| Extension | Chrome Manifest V3 |
| Speech | Web Speech API |
| Charts | Recharts |

## File Structure Basics

```
app/              → Pages and API routes (Next.js App Router)
components/       → React components
store/            → Zustand state management
lib/              → Utility functions
models/           → MongoDB schemas
hooks/            → Custom React hooks
chrome-extension/ → Chrome extension code
```

## Key Concepts

### SSE (Server-Sent Events)
- Real-time streaming from server to client
- Used for AI answer streaming
- Used for extension → web app communication

### Question Detection
- Multi-factor algorithm
- Checks for question patterns
- Assigns confidence score (0-100)
- Sources: mic, chat, captions, manual

### State Management (Zustand)
- `auth-store`: User authentication state
- `copilot-store`: Live session state, questions, settings

### Chrome Extension
- Invisible operation (no UI on meeting pages)
- Watches chat and captions via DOM observers
- Sends detected questions to web app
- Connected via Firebase token

## Usage Limits

| Feature | Free Plan | Pro Plan |
|---------|-----------|----------|
| Copilot answers | 10/month | Unlimited |
| Mock interviews | 2/month | Unlimited |
| Resume personalization | ❌ | ✅ |
| Report history | 30 days | Unlimited |
| Price | $0 | $19/month |

## Support & Help

### Documentation
- All docs in repository root
- Start with [README.md](README.md)
- Check relevant guide from table above

### Troubleshooting
- See [SETUP.md](SETUP.md) → Troubleshooting section
- Check browser console for errors
- Check terminal logs for API errors
- Verify environment variables

### Common Issues

**"OpenRouter API error"**
→ Check API key is correct and has free tier access

**"MongoDB connection failed"**
→ Verify connection string and IP whitelist

**"Firebase auth not working"**
→ Ensure OAuth providers enabled in Firebase Console

**"Extension not detecting questions"**
→ Verify connection status (green dot) and check browser console

### Getting More Help

1. Check existing documentation first
2. Search GitHub issues
3. Open new issue with:
   - What you tried
   - Error messages
   - Browser console logs
   - Steps to reproduce

## Next Steps

Based on your goal:

### Just Want to Try It?
1. Go to [QUICKSTART.md](QUICKSTART.md)
2. Follow 5 steps
3. Start using!

### Want to Understand It?
1. Read [README.md](README.md)
2. Read [FEATURES.md](FEATURES.md)
3. Browse [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

### Ready to Deploy?
1. Test locally first
2. Read [DEPLOYMENT.md](DEPLOYMENT.md)
3. Follow deployment checklist
4. Monitor for issues

### Want to Contribute?
1. Fork repository
2. Set up locally ([SETUP.md](SETUP.md))
3. Make changes
4. Test thoroughly
5. Submit PR

## Learning Path

Recommended order for reading docs:

1. **Start**: [README.md](README.md) - Overview
2. **Quick Try**: [QUICKSTART.md](QUICKSTART.md) - Get running
3. **Deep Dive**: [FEATURES.md](FEATURES.md) - Learn features
4. **Develop**: [SETUP.md](SETUP.md) - Full setup
5. **Deploy**: [DEPLOYMENT.md](DEPLOYMENT.md) - Production
6. **Contribute**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture

## Pro Tips

### For Users
- Upload your resume first for better answers
- Use STAR format for behavioral questions
- Practice with mock interviews before real ones
- Install Chrome extension for automatic detection
- Use Ctrl+Shift+Space for floating mini mode

### For Developers
- Read all docs before starting
- Test locally before deploying
- Use VS Code for best experience
- Check `.vscode/settings.json` for config
- Follow code style (Prettier + ESLint)
- Commit early and often

### For Production
- Test everything thoroughly locally first
- Use environment variables for all secrets
- Enable error monitoring
- Set up backups
- Monitor usage limits
- Keep dependencies updated

## Community & Contributing

This is an open-source project. Contributions welcome!

**How to Contribute:**
1. Fork the repo
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit PR with clear description

**What We Need:**
- Bug fixes
- New features
- Documentation improvements
- UI/UX enhancements
- Performance optimizations
- Test coverage

## License

MIT License - See [LICENSE](LICENSE) file.

Free to use, modify, and distribute with attribution.

---

## Ready to Start?

Choose your path:

- **Quick Start** → [QUICKSTART.md](QUICKSTART.md)
- **Full Setup** → [SETUP.md](SETUP.md)
- **Learn Features** → [FEATURES.md](FEATURES.md)
- **Deploy** → [DEPLOYMENT.md](DEPLOYMENT.md)
- **Architecture** → [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

Good luck with your interviews! 🚀
