# CareerPilot AI - UI Navigator Agent

An AI-powered job application automation platform that uses **Gemini Vision** to visually understand and navigate job application forms across any website.

## 🎯 Hackathon Category: UI Navigator ☸️

This project demonstrates a next-generation AI agent that:
- **Visually interprets** job application pages using Gemini's multimodal capabilities
- **Navigates UI elements** without relying on DOM access or APIs
- **Executes actions** based on visual understanding (click, type, submit)
- **Works universally** across LinkedIn, Indeed, Glassdoor, and custom career portals

## 🚀 Key Features

### 1. Visual UI Understanding
- Uses **Gemini 2.0 Flash** to analyze screenshots of web pages
- Identifies form fields, buttons, inputs, and interactive elements
- Understands page types (job listing, application form, multi-step, confirmation)
- Detects CAPTCHAs and authentication requirements

### 2. Intelligent Form Filling
- Maps form fields to user profile data automatically
- Handles text inputs, dropdowns, file uploads, checkboxes
- Adapts to different UI designs and layouts
- Supports multi-step application processes

### 3. Browser Automation
- Uses Playwright for realistic browser control
- Stealth mode to avoid bot detection
- Screenshot capture at each step for verification
- Action verification using before/after image comparison

### 4. Application Tracking
- Queue system for batch processing
- Real-time status updates (queued, in_progress, completed, failed)
- Screenshot history of each application
- Detailed logs of agent actions

## 🛠️ Tech Stack

### Required (Hackathon Compliance)
- ✅ **Gemini 2.0 Flash** - Multimodal vision and text generation
- ✅ **Google GenAI SDK** - Official Google Generative AI SDK
- ✅ **Google Cloud** - Ready for Cloud Run deployment

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components

### Backend
- Node.js
- Playwright (Browser automation)
- Sharp (Image processing)
- Prisma (Database ORM)

## 📁 Project Structure

```
├── app/
│   ├── agent-queue/          # Agent queue UI
│   ├── api/
│   │   └── agent/            # Agent API routes
│   │       ├── queue/        # Job queue management
│   │       ├── analyze/      # Screenshot analysis
│   │       └── apply/        # Application processing
│   └── ...
├── lib/
│   └── agent/
│       ├── types.ts          # TypeScript definitions
│       ├── gemini-client.ts  # Gemini API client
│       ├── vision-analyzer.ts # Vision analysis logic
│       ├── browser-controller.ts # Browser automation
│       └── application-agent.ts  # Main agent orchestrator
├── components/
│   └── agent/
│       ├── agent-queue.tsx   # Queue display
│       └── add-job-dialog.tsx # Add job form
└── prisma/
    └── schema.prisma         # Database schema
```

## 🔧 Setup Instructions

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Gemini API key

### 2. Installation

```bash
# Clone repository
git clone <repo-url>
cd careerpilot-ai

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### 3. Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/careerpilot"

# Google Gemini API (REQUIRED)
GOOGLE_GEMINI_API_KEY="your_gemini_api_key_here"

# Optional: Google Cloud
GOOGLE_CLOUD_PROJECT_ID="your_project_id"
GOOGLE_CLOUD_STORAGE_BUCKET="careerpilot-screenshots"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🎮 How to Use

### 1. Create Profile
- Navigate to `/profile`
- Fill in your personal information, experience, education, skills
- This data will be used to auto-fill applications

### 2. Add Jobs to Queue
- Go to `/agent-queue`
- Click "Add Job to Queue"
- Enter job URL, title, and company name
- Job is added to the queue

### 3. Start Agent
- Click "Start" on any queued job
- Agent will:
  1. Navigate to the job URL
  2. Take screenshot and analyze with Gemini Vision
  3. Identify form fields and buttons
  4. Fill form with your profile data
  5. Submit application
  6. Verify submission success

### 4. Monitor Progress
- View real-time status updates
- See screenshots at each step
- Review logs and actions taken
- Check for errors or failures

## 🧠 How It Works

### Vision Analysis Pipeline

```
1. Screenshot Capture
   ↓
2. Gemini Vision Analysis
   - Identify page type
   - Extract form fields
   - Map to profile data
   - Determine next actions
   ↓
3. Action Planning
   - Generate executable actions
   - Prioritize required fields
   - Handle multi-step flows
   ↓
4. Browser Automation
   - Execute clicks, typing, uploads
   - Navigate between pages
   - Submit forms
   ↓
5. Verification
   - Compare before/after screenshots
   - Confirm submission success
   - Log results
```

### Example Gemini Prompt

```typescript
const prompt = `You are a UI analysis expert. Analyze this screenshot of a web page.

Identify:
1. Page type (job_listing, application_form, login, multi_step, confirmation)
2. All interactive elements (buttons, inputs, selects, textareas)
3. Form fields with labels, types, and requirements
4. Next steps the user should take

Return JSON with elements, formFields, and nextSteps.`
```

## 🌐 Google Cloud Deployment

### Deploy to Cloud Run

```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/careerpilot-agent

# Deploy to Cloud Run
gcloud run deploy careerpilot-agent \
  --image gcr.io/PROJECT_ID/careerpilot-agent \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_GEMINI_API_KEY=your_key
```

### Required Google Cloud Services
- **Cloud Run** - Host the application
- **Cloud Storage** - Store screenshots and documents
- **Cloud SQL** - PostgreSQL database (optional)
- **Secret Manager** - Secure API keys

## 📊 API Endpoints

### Queue Management
- `GET /api/agent/queue?userId=1` - Get user's job queue
- `POST /api/agent/queue` - Add job to queue
- `DELETE /api/agent/queue?id=job_123` - Remove job

### Agent Operations
- `POST /api/agent/analyze` - Analyze screenshot with Gemini
- `POST /api/agent/apply` - Process job application

## 🎯 Hackathon Requirements Checklist

- ✅ Uses Gemini model (Gemini 2.0 Flash)
- ✅ Built with Google GenAI SDK
- ✅ Uses Google Cloud services (Cloud Run ready)
- ✅ Multimodal input (screenshots/images)
- ✅ Visual UI interpretation without DOM/API access
- ✅ Outputs executable actions (browser automation)
- ✅ Solves real-world problem (job application automation)
- ✅ Beyond simple text-in/text-out interaction

## 🔮 Future Enhancements

- [ ] Real-time streaming of agent actions
- [ ] Support for video recording of application process
- [ ] AI-powered resume tailoring per job
- [ ] Cover letter generation using Gemini
- [ ] Interview scheduling automation
- [ ] Success rate analytics and optimization
- [ ] Multi-language support
- [ ] Mobile app for monitoring

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📧 Contact

For questions or support, contact: [your-email]

---

Built with ❤️ using Gemini AI and Google Cloud
