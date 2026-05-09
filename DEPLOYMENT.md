# Deployment Guide

## Prerequisites

1. MongoDB Atlas account (free tier works)
2. Firebase project with Auth enabled
3. OpenRouter API account
4. Polar.sh account for payments
5. Vercel account (or other Next.js hosting)

## Step 1: MongoDB Setup

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP addresses (or allow all for development)
4. Get your connection string
5. Add to `.env` as `MONGODB_URI`

## Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication:
   - Enable Google provider
   - Enable GitHub provider
4. Get your Firebase config from Project Settings
5. For Firebase Admin (server-side):
   - Go to Project Settings > Service Accounts
   - Generate a new private key
   - Extract `project_id`, `client_email`, and `private_key`
   - Add to `.env`

## Step 3: OpenRouter Setup

1. Sign up at [OpenRouter](https://openrouter.ai)
2. Get your API key
3. Add to `.env` as `OPENROUTER_API_KEY`
4. Free tier includes access to `meta-llama/llama-3.1-8b-instruct:free`

## Step 4: Polar.sh Setup

1. Create account at [Polar.sh](https://polar.sh)
2. Create an organization
3. Create a product (AI Interview Copilot Pro - $19/month)
4. Get your:
   - Access Token
   - Organization ID
   - Webhook Secret
5. Add all to `.env`

## Step 5: Deploy to Vercel

### Via GitHub

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables:
   - Copy all from `.env`
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel URL
6. Deploy!

### Via CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts and add environment variables when asked.

## Step 6: Configure Webhooks

1. In Polar.sh, go to Settings > Webhooks
2. Add webhook URL: `https://your-domain.com/api/polar/webhook`
3. Select events:
   - `checkout.completed`
   - `subscription.created`
   - `subscription.cancelled`
   - `subscription.expired`

## Step 7: Update Chrome Extension

1. Open `chrome-extension/manifest.json`
2. Update `host_permissions`:
   ```json
   "host_permissions": [
     "https://your-domain.com/*"
   ]
   ```
3. Repackage extension (or republish if published to Chrome Web Store)

## Step 8: Test Everything

1. Sign in with Google/GitHub
2. Upload a resume
3. Start a copilot session
4. Test Chrome extension in a Google Meet call
5. Try mock interview
6. Verify payment flow works
7. Check webhook is receiving events

## Environment Variables Checklist

### Required
- ✅ `MONGODB_URI`
- ✅ `FIREBASE_PROJECT_ID`
- ✅ `FIREBASE_CLIENT_EMAIL`
- ✅ `FIREBASE_PRIVATE_KEY`
- ✅ `OPENROUTER_API_KEY`
- ✅ `POLAR_ACCESS_TOKEN`
- ✅ `NEXT_PUBLIC_POLAR_ORGANIZATION_ID`
- ✅ `NEXT_PUBLIC_APP_URL`

### Optional
- `POLAR_WEBHOOK_SECRET` (recommended for security)
- `POLAR_MODE` (sandbox/production)

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Ensure MongoDB URI is correct format
- Verify Firebase private key is properly escaped

### Authentication Not Working
- Check Firebase config in `lib/firebase.ts`
- Verify OAuth redirect URLs are configured in Firebase
- Ensure your domain is authorized

### Payments Not Working
- Verify Polar.sh webhook URL is correct
- Check webhook secret matches
- Test with Polar sandbox mode first

### Extension Not Connecting
- Update manifest.json with production URL
- Ensure CORS is configured if needed
- Check API endpoints are accessible

## Security Best Practices

1. **Never commit `.env` to git** (already in .gitignore)
2. **Use environment variables** for all secrets
3. **Enable Firebase App Check** in production
4. **Set up rate limiting** on API routes
5. **Review MongoDB security rules**
6. **Use HTTPS everywhere**
7. **Implement proper CORS policies**

## Monitoring

### Vercel Analytics
Enable in Vercel dashboard for:
- Page load times
- API response times
- Error tracking

### Firebase Console
Monitor:
- Authentication usage
- Failed sign-ins

### MongoDB Atlas
Track:
- Database size
- Query performance
- Connection counts

### Polar.sh Dashboard
Review:
- Subscription metrics
- Revenue
- Churn rate

## Scaling Considerations

### Free Tier Limits
- MongoDB Atlas: 512MB storage
- Vercel: 100GB bandwidth
- Firebase Auth: 50k MAU
- OpenRouter: Free tier rate limits

### When to Upgrade
- MongoDB: When approaching 512MB
- Vercel: If bandwidth exceeds 100GB/month
- Firebase: If exceeding 50k monthly active users
- OpenRouter: If you need faster models or higher rate limits

## Backup Strategy

1. **MongoDB backups**: Use Atlas automated backups
2. **Code backups**: GitHub repository
3. **Environment variables**: Store securely in password manager

## Production Checklist

- [ ] All environment variables set
- [ ] Firebase OAuth redirects configured
- [ ] MongoDB connection working
- [ ] OpenRouter API responding
- [ ] Polar.sh webhook receiving events
- [ ] Chrome extension updated with production URL
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Error monitoring setup
- [ ] Analytics enabled
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Test user flow end-to-end

## Post-Deployment

1. Create a test user account
2. Run through full user journey
3. Test payment upgrade/downgrade
4. Verify Chrome extension works on all platforms
5. Check all email notifications (if implemented)
6. Monitor error logs for first 24 hours
7. Gather user feedback

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review MongoDB Atlas logs
3. Check Firebase Auth logs
4. Verify webhook delivery in Polar.sh
5. Test API endpoints directly
6. Check browser console for errors

## Updates & Maintenance

### Regular Tasks
- Monitor usage limits
- Review error logs weekly
- Update dependencies monthly
- Review security patches
- Backup critical data

### OpenRouter Model Updates
When new free models become available:
1. Update `lib/openrouter.ts`
2. Test responses
3. Update documentation
4. Notify users

Good luck with your deployment! 🚀
