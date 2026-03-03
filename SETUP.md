# 🚀 Quick Setup Guide - CareerPilot AutoAgent

Get up and running in 10 minutes!

## Prerequisites Checklist

Before you start, make sure you have:

- [ ] Node.js 18+ installed
- [ ] npm or pnpm installed
- [ ] PostgreSQL database (local or cloud)
- [ ] Google AI API key ([Get one here](https://makersuite.google.com/app/apikey))
- [ ] Git installed

## Step-by-Step Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/careerpilot-autoagent.git
cd careerpilot-autoagent

# Install dependencies
npm install
# or
pnpm install

# This will install:
# - Next.js and React
# - Gemini AI SDK
# - Playwright (browser automation)
# - Prisma (database)
# - All UI components
```

### 2. Get Your Gemini API Key (1 minute)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)
4. Keep it safe - you'll need it in the next step

### 3. Configure Environment (2 minutes)

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your editor
nano .env
# or
code .env
```

Fill in your credentials:

```env
# Required: Your Gemini API key
GOOGLE_AI_API_KEY=AIzaSy...your_key_here

# Required: Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/careerpilot

# Optional: Google Cloud (for production)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name

# App configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Set Up Database (2 minutes)

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (if not already installed)
# macOS:
brew install postgresql
brew services start postgresql

# Ubuntu/Debian:
sudo apt-get install postgresql
sudo service postgresql start

# Windows:
# Download from https://www.postgresql.org/download/windows/

# Create database
createdb careerpilot

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://localhost:5432/careerpilot
```

#### Option B: Cloud Database (Recommended for demo)

Use a free tier from:
- [Supabase](https://supabase.com) (Recommended - Free PostgreSQL)
- [Neon](https://neon.tech) (Serverless PostgreSQL)
- [Railway](https://railway.app) (Easy setup)

Get the connection string and add to `.env`

### 5. Initialize Database (1 minute)

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Verify it worked
npm run prisma:studio
# This opens a database GUI at http://localhost:5555
```

### 6. Install Playwright Browsers (1 minute)

```bash
# Install Chromium for browser automation
npx playwright install chromium

# This downloads the browser binary (~100MB)
# Only needs to be done once
```

### 7. Start Development Server (1 minute)

```bash
# Start Next.js dev server
npm run dev

# Server starts at http://localhost:3000
```

Open your browser to `http://localhost:3000` 🎉

---

## Verify Installation

### Test 1: Homepage Loads
- Go to `http://localhost:3000`
- Should redirect to `/auth/login`
- ✅ If you see the login page, Next.js is working!

### Test 2: Database Connection
```bash
npm run prisma:studio
```
- Opens at `http://localhost:5555`
- ✅ If you see the database GUI, Prisma is connected!

### Test 3: Gemini API
Create `test-gemini.js`:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

const result = await model.generateContent('Say hello!')
console.log(result.response.text())
```

Run it:
```bash
node test-gemini.js
```
✅ If you see "Hello!" response, Gemini is working!

### Test 4: Browser Automation
```bash
# Test Playwright
npx playwright test --headed
```
✅ If browser opens, Playwright is working!

---

## Quick Start Guide

### 1. Create Your Profile

1. Go to `http://localhost:3000/auth/login`
2. Enter any email/password (mock auth)
3. Navigate to `/profile`
4. Fill in your information:
   - Name, email, phone
   - Work experience
   - Education
   - Skills
5. Upload a resume (PDF)

### 2. Test the Agent

1. Go to `/auto-agent`
2. Add a test job:
   ```
   Job Title: Senior React Developer
   Company: Tech Corp
   URL: http://localhost:3000/test-form.html
   ```
3. Click "Add to Queue"
4. Click "Start Agent"
5. Watch the magic happen! 🎩✨

### 3. View Results

1. Check `/applications` for completed applications
2. View screenshots in the `screenshots/` folder
3. Check analytics at `/analytics`

---

## Troubleshooting

### Issue: "Cannot find module '@google/generative-ai'"

**Solution:**
```bash
npm install @google/generative-ai
```

### Issue: "Playwright browser not found"

**Solution:**
```bash
npx playwright install chromium
```

### Issue: "Database connection failed"

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
npm run prisma:studio
```

### Issue: "Gemini API error: Invalid API key"

**Solution:**
1. Verify your API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Make sure it's correctly set in `.env`
3. Restart the dev server

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue: Screenshots not saving

**Solution:**
```bash
# Create screenshots directory
mkdir -p screenshots
chmod 755 screenshots
```

---

## Development Workflow

### Running the App

```bash
# Development mode (hot reload)
npm run dev

# Production build
npm run build
npm start

# Run agent standalone
npm run agent
```

### Database Management

```bash
# Open Prisma Studio (GUI)
npm run prisma:studio

# Push schema changes
npm run prisma:push

# Generate Prisma Client
npm run prisma:generate

# Reset database (careful!)
npm run prisma:reset
```

### Testing

```bash
# Run all tests
npm test

# Test Gemini Vision
npm run test:vision

# Test browser automation
npm run test:browser

# End-to-end test
npm run test:e2e
```

---

## Project Structure

```
careerpilot-autoagent/
├── app/                      # Next.js App Router
│   ├── auto-agent/          # 🎯 Main agent UI
│   ├── api/                 # API routes
│   ├── dashboard/           # Dashboard
│   ├── profile/             # Profile management
│   └── ...
├── lib/                     # Core logic
│   ├── agent/              # 🤖 Agent implementation
│   │   ├── gemini-vision.ts        # Gemini Vision
│   │   ├── browser-automation.ts   # Playwright
│   │   └── job-application-agent.ts # Orchestrator
│   ├── db.ts               # Prisma client
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utilities
├── components/             # React components
│   ├── agent/             # Agent UI components
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── prisma/                # Database
│   └── schema.prisma      # Database schema
├── public/                # Static files
│   └── test-form.html     # Test application form
├── screenshots/           # Generated screenshots
├── .env                   # Environment variables
├── package.json           # Dependencies
└── README.md             # Documentation
```

---

## Key Files to Know

### Core Agent Files
- `lib/agent/gemini-vision.ts` - Gemini Vision integration
- `lib/agent/browser-automation.ts` - Browser automation
- `lib/agent/job-application-agent.ts` - Main orchestrator

### UI Files
- `app/auto-agent/page.tsx` - Agent dashboard
- `components/agent/` - Agent UI components

### API Files
- `app/api/agent/apply/route.ts` - Start application
- `app/api/agent/status/route.ts` - Get status

### Config Files
- `.env` - Environment variables
- `prisma/schema.prisma` - Database schema
- `next.config.mjs` - Next.js config

---

## Next Steps

### For Development
1. ✅ Complete profile setup
2. ✅ Test with local test form
3. ✅ Try real job URLs (carefully!)
4. ✅ Add error handling
5. ✅ Improve UI/UX

### For Demo
1. ✅ Prepare demo script
2. ✅ Record backup video
3. ✅ Test on demo laptop
4. ✅ Prepare slides
5. ✅ Practice presentation

### For Production
1. ✅ Deploy to Google Cloud
2. ✅ Set up monitoring
3. ✅ Configure backups
4. ✅ Add authentication
5. ✅ Implement rate limiting

---

## Getting Help

### Documentation
- [README.md](README.md) - Project overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [DEMO_SCRIPT.md](DEMO_SCRIPT.md) - Demo guide
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing guide

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Playwright Docs](https://playwright.dev)
- [Prisma Docs](https://www.prisma.io/docs)

### Support
- GitHub Issues: [Report a bug](https://github.com/yourusername/careerpilot-autoagent/issues)
- Email: team@careerpilot.ai
- Discord: [Join our community](https://discord.gg/careerpilot)

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server

# Database
npm run prisma:studio   # Open database GUI
npm run prisma:push     # Push schema changes
npm run prisma:generate # Generate Prisma client

# Testing
npm run test:vision     # Test Gemini Vision
npm run test:browser    # Test browser automation
npm run test:e2e        # End-to-end test

# Agent
npm run agent           # Run agent standalone

# Deployment
npm run deploy          # Deploy to Google Cloud
```

---

## Success Checklist

Before your demo, make sure:

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database connected and seeded
- [ ] Gemini API working
- [ ] Playwright browsers installed
- [ ] Dev server starts successfully
- [ ] Profile created and complete
- [ ] Test form works
- [ ] Agent can process applications
- [ ] Screenshots are captured
- [ ] UI looks good
- [ ] No console errors

---

**You're all set! 🎉**

Now go to `/auto-agent` and watch the magic happen!

Questions? Check the [README.md](README.md) or [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

Good luck with your demo! 🚀
