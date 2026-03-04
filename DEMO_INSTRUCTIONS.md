# Live AI Agent - For Judges

## What You're About to See

This showcases our **WINNING FEATURE #1: Live Streaming AI Agent** that automatically applies to jobs on LinkedIn using:
- **Gemini Vision AI** to analyze job postings
- **Playwright Browser Automation** to fill forms
- **Real-Time Streaming** via Server-Sent Events (SSE)
- **Confidence Scoring** for each action

---

## The Flow

### Job Details
- **Company:** Stadium
- **Role:** Software Engineer
- **Link:** https://www.linkedin.com/jobs/view/4377520491

### What Happens (Step by Step)

1. **Initialize Agent**
   - Agent starts and prepares browser automation

2. **Navigate to Job**
   - Opens the LinkedIn job posting

3. **Analyze with Gemini Vision**
   - Uses Google's Gemini Vision AI to understand:
     - Page type (job listing, application form, etc.)
     - Form fields present
     - Buttons and interactive elements
     - Special requirements

4. **Confidence Scoring**
   - Scores confidence level (0-100%)
   - Shows reasoning for each action

5. **Fill Application Form**
   - Automatically fills:
     - First Name: John
     - Last Name: Doe
     - Email: john.doe@example.com
     - Phone: (555) 123-4567
     - Location: San Francisco, CA

6. **Submit Application**
   - Clicks submit button
   - Confirms successful submission

---

## Key Features Demonstrated

### Real-Time Streaming
- All actions appear live in the activity feed
- No waiting for batch processing
- Judges see the agent "thinking" in real-time

### AI-Powered Analysis
- Gemini Vision analyzes screenshots
- Understands form structure automatically
- Adapts to different job posting layouts

### Confidence Scoring
- Each action has a confidence percentage
- Shows how sure the agent is about its decisions
- Helps judges understand AI reasoning

### Personality
- Agent has a distinct voice
- Makes comments about what it's doing
- Feels alive and intelligent

### Application Result
- See confirmation when application is submitted
- Verify successful completion

---

## How to Run

1. Click **"Start Agent"** button
2. Watch the activity feed on the left
3. Monitor confidence scores
4. Watch it complete in ~30 seconds
5. See the result when application is submitted

---

## Why This Matters for Judging

- **Solves Real Problem:** Automates tedious job applications
- **Uses Required Tech:** Gemini AI (hackathon requirement)
- **Real-Time Feedback:** Judges see it working live
- **Scalable:** Can process multiple jobs in queue
- **Intelligent:** Adapts to different job posting formats
- **Transparent:** Shows reasoning and confidence scores

---

## Technical Stack

- **Frontend:** Next.js 16 + React
- **Backend:** Node.js with TypeScript
- **AI:** Google Gemini Vision API
- **Browser Automation:** Playwright
- **Real-Time:** Server-Sent Events (SSE)
- **Database:** MongoDB (for job queue)
- **Deployment:** Google Cloud Run

---

## Success Criteria

The application is successful when:
1. Agent initializes without errors
2. Gemini Vision analyzes the page
3. Form fields are identified
4. Application data is filled
5. Form is submitted successfully
6. Confidence scores are displayed
7. All happens in real-time with streaming

---

## Questions Judges Might Ask

**Q: Does this really work on real LinkedIn jobs?**
A: Yes. This uses an actual LinkedIn job posting. In production, it navigates to actual job URLs and fills real applications.

**Q: How does it know what to fill?**
A: Gemini Vision AI analyzes the screenshot to identify form fields, then maps them to user profile data.

**Q: What if the form layout changes?**
A: The AI adapts. It analyzes each page individually, so it works with different layouts.

**Q: Can it handle multi-step applications?**
A: Yes. The agent can navigate through multi-step forms and handle different page types.

**Q: Is this production-ready?**
A: This is a working prototype. Production version would include error handling, rate limiting, and job queue management.

---

## Next Steps (After Application)

- View the **Agent Queue** to see multiple jobs being processed
- Check **Analytics** for application success rates
- Review **Application Tracker** to see all submitted applications
- Explore **Settings** to customize application strategy

---

**Ready to see it in action? Click "Start Agent" and watch it work.**
