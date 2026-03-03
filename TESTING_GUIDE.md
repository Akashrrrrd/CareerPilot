# 🧪 Testing Guide - CareerPilot AutoAgent

## Quick Start Testing

### 1. Test Gemini Vision Integration

```bash
# Create a test script
npm run test:vision
```

Create `scripts/test-vision.ts`:
```typescript
import { geminiAgent } from './lib/agent/gemini-vision'
import path from 'path'

async function testVision() {
  console.log('🧪 Testing Gemini Vision...\n')
  
  // Test with a sample screenshot
  const screenshotPath = path.join(__dirname, 'test-screenshots', 'linkedin-apply.png')
  
  const analysis = await geminiAgent.analyzeScreenshot(screenshotPath)
  
  console.log('✅ Analysis Results:')
  console.log(JSON.stringify(analysis, null, 2))
}

testVision()
```

### 2. Test Browser Automation

```bash
npm run test:browser
```

Create `scripts/test-browser.ts`:
```typescript
import { BrowserAutomationEngine } from './lib/agent/browser-automation'

async function testBrowser() {
  console.log('🧪 Testing Browser Automation...\n')
  
  const browser = new BrowserAutomationEngine()
  
  try {
    await browser.initialize()
    console.log('✅ Browser initialized')
    
    const screenshot = await browser.navigateAndCapture('https://www.linkedin.com/jobs')
    console.log('✅ Screenshot captured:', screenshot)
    
    await browser.close()
    console.log('✅ Browser closed')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testBrowser()
```

### 3. End-to-End Test

```bash
npm run test:e2e
```

## Test Job URLs

Use these safe test URLs that won't actually submit applications:

### Test Sites (No Real Submission)
```
1. LinkedIn (requires login):
   https://www.linkedin.com/jobs/view/3234567890

2. Indeed Sample:
   https://www.indeed.com/viewjob?jk=test123

3. Test Form (Safe):
   https://httpbin.org/forms/post
```

### Create Your Own Test Page

Create `public/test-form.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Job Application Form</title>
  <style>
    body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; }
    input, textarea, select { width: 100%; padding: 10px; margin: 10px 0; }
    button { background: #0066cc; color: white; padding: 15px 30px; border: none; cursor: pointer; }
    label { font-weight: bold; display: block; margin-top: 15px; }
  </style>
</head>
<body>
  <h1>Senior Developer Position</h1>
  <h2>Tech Corp</h2>
  
  <form id="applicationForm">
    <label>First Name *</label>
    <input type="text" name="firstName" required placeholder="Enter your first name">
    
    <label>Last Name *</label>
    <input type="text" name="lastName" required placeholder="Enter your last name">
    
    <label>Email *</label>
    <input type="email" name="email" required placeholder="your.email@example.com">
    
    <label>Phone *</label>
    <input type="tel" name="phone" required placeholder="(555) 123-4567">
    
    <label>LinkedIn URL</label>
    <input type="url" name="linkedin" placeholder="https://linkedin.com/in/yourprofile">
    
    <label>Resume *</label>
    <input type="file" name="resume" required accept=".pdf,.doc,.docx">
    
    <label>Why do you want to work here? *</label>
    <textarea name="why" required rows="4" placeholder="Tell us why you're interested..."></textarea>
    
    <label>Years of Experience *</label>
    <select name="experience" required>
      <option value="">Select...</option>
      <option value="0-2">0-2 years</option>
      <option value="3-5">3-5 years</option>
      <option value="6-10">6-10 years</option>
      <option value="10+">10+ years</option>
    </select>
    
    <button type="submit">Submit Application</button>
  </form>
  
  <script>
    document.getElementById('applicationForm').addEventListener('submit', function(e) {
      e.preventDefault();
      document.body.innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <h1 style="color: green;">✓ Application Submitted!</h1>
          <p>Confirmation Number: TEST-${Date.now()}</p>
          <p>Thank you for applying! We'll review your application and get back to you soon.</p>
        </div>
      `;
    });
  </script>
</body>
</html>
```

Test with: `http://localhost:3000/test-form.html`

## Manual Testing Checklist

### Pre-Demo Testing

- [ ] **Profile Setup**
  - [ ] Fill complete profile
  - [ ] Upload resume (PDF)
  - [ ] Add work experience
  - [ ] Add education
  - [ ] Add skills

- [ ] **Browser Automation**
  - [ ] Browser launches successfully
  - [ ] Screenshots capture correctly
  - [ ] Navigation works
  - [ ] Form filling works
  - [ ] File upload works
  - [ ] Button clicking works

- [ ] **Gemini Vision**
  - [ ] API key is valid
  - [ ] Screenshot analysis works
  - [ ] Field detection accurate
  - [ ] Button detection accurate
  - [ ] Confidence scores reasonable

- [ ] **End-to-End Flow**
  - [ ] Add job to queue
  - [ ] Start agent
  - [ ] Watch automation
  - [ ] Verify completion
  - [ ] Check screenshots
  - [ ] Confirm database entry

### Test Scenarios

#### Scenario 1: Simple Single-Page Form
```
URL: http://localhost:3000/test-form.html
Expected: Fill all fields and submit
Time: ~30 seconds
Success Criteria: Confirmation page appears
```

#### Scenario 2: Multi-Step Form
```
URL: [Multi-step test form]
Expected: Navigate through all steps
Time: ~2 minutes
Success Criteria: All steps completed
```

#### Scenario 3: File Upload
```
URL: [Form with file upload]
Expected: Upload resume successfully
Time: ~45 seconds
Success Criteria: File uploaded, form submitted
```

#### Scenario 4: Screening Questions
```
URL: [Form with text questions]
Expected: AI generates contextual answers
Time: ~1 minute
Success Criteria: Answers are relevant and professional
```

#### Scenario 5: Error Handling
```
URL: [Invalid URL]
Expected: Graceful error handling
Time: ~10 seconds
Success Criteria: Error message displayed, no crash
```

## Performance Testing

### Load Test
```bash
# Test with multiple concurrent applications
npm run test:load
```

Create `scripts/test-load.ts`:
```typescript
import { jobAgent } from './lib/agent/job-application-agent'

async function loadTest() {
  const tasks = Array.from({ length: 10 }, (_, i) => ({
    id: `task_${i}`,
    userId: '1',
    jobUrl: 'http://localhost:3000/test-form.html',
    jobTitle: `Test Job ${i}`,
    company: `Company ${i}`,
    status: 'queued' as const,
    profileId: '1'
  }))
  
  console.log('🧪 Starting load test with 10 concurrent applications...\n')
  
  const startTime = Date.now()
  await jobAgent.processQueue(tasks)
  const endTime = Date.now()
  
  console.log(`\n✅ Load test completed in ${(endTime - startTime) / 1000}s`)
}

loadTest()
```

### Metrics to Track
- Average application time
- Success rate
- Error rate
- Memory usage
- API call count
- Screenshot storage size

## Integration Testing

### Test Gemini API
```typescript
// Test API connectivity and response
async function testGeminiAPI() {
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${process.env.GOOGLE_AI_API_KEY}`
    }
  })
  
  if (response.ok) {
    console.log('✅ Gemini API connected')
  } else {
    console.error('❌ Gemini API error:', await response.text())
  }
}
```

### Test Database
```typescript
// Test Prisma connection
async function testDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')
    
    const userCount = await prisma.user.count()
    console.log(`   Users: ${userCount}`)
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Database error:', error)
  }
}
```

### Test Cloud Storage
```typescript
// Test screenshot upload
async function testStorage() {
  // Upload test screenshot
  // Verify it's accessible
  // Clean up
}
```

## Debugging Tips

### Enable Verbose Logging
```typescript
// In gemini-vision.ts
console.log('📸 Screenshot path:', screenshotPath)
console.log('🤖 Gemini prompt:', prompt)
console.log('📊 Gemini response:', response)
```

### Save Debug Screenshots
```typescript
// In browser-automation.ts
await this.page.screenshot({ 
  path: `debug_${Date.now()}.png`,
  fullPage: true 
})
```

### Monitor API Calls
```typescript
// Track Gemini API usage
let apiCallCount = 0
let totalTokens = 0

// Log after each call
console.log(`API Calls: ${apiCallCount}, Tokens: ${totalTokens}`)
```

## Common Issues & Solutions

### Issue: Browser won't launch
```bash
# Solution: Install Playwright browsers
npx playwright install chromium
```

### Issue: Gemini API errors
```bash
# Solution: Check API key
echo $GOOGLE_AI_API_KEY

# Verify quota
# Go to: https://makersuite.google.com/app/apikey
```

### Issue: Screenshots not saving
```bash
# Solution: Check permissions
mkdir -p screenshots
chmod 755 screenshots
```

### Issue: Form fields not filling
```bash
# Solution: Increase wait times
await this.page.waitForTimeout(2000)

# Or use better selectors
await this.page.waitForSelector('input[name="firstName"]')
```

### Issue: Database connection fails
```bash
# Solution: Check DATABASE_URL
echo $DATABASE_URL

# Test connection
npx prisma db push
```

## Pre-Hackathon Testing Protocol

### 1 Week Before
- [ ] Full end-to-end test
- [ ] Test on 10 different job sites
- [ ] Load testing
- [ ] Error handling verification
- [ ] Performance optimization

### 1 Day Before
- [ ] Fresh deployment test
- [ ] Demo script dry run
- [ ] Backup video recording
- [ ] Test on demo laptop
- [ ] Internet connection test

### 1 Hour Before
- [ ] Final smoke test
- [ ] Clear browser cache
- [ ] Restart services
- [ ] Verify API keys
- [ ] Test backup laptop

### During Demo
- [ ] Have backup video ready
- [ ] Monitor console for errors
- [ ] Keep test URLs handy
- [ ] Have fallback demo ready

## Success Criteria

### Must Pass
✅ Browser launches
✅ Screenshots captured
✅ Gemini analyzes correctly
✅ Forms fill automatically
✅ Applications submit
✅ Confirmations detected

### Nice to Have
✅ Fast performance (<2 min/app)
✅ High accuracy (>95%)
✅ Graceful error handling
✅ Beautiful UI updates
✅ Real-time progress

## Test Data

### Sample Profile
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "(555) 123-4567",
  "location": "San Francisco, CA",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "portfolioUrl": "https://johndoe.dev",
  "resumePath": "/path/to/resume.pdf",
  "summary": "Experienced software engineer with 8+ years...",
  "experience": [...],
  "education": [...],
  "skills": ["React", "Node.js", "TypeScript"]
}
```

### Sample Jobs
```json
[
  {
    "title": "Senior React Developer",
    "company": "Tech Corp",
    "url": "http://localhost:3000/test-form.html"
  },
  {
    "title": "Full Stack Engineer",
    "company": "StartupXYZ",
    "url": "http://localhost:3000/test-form.html"
  }
]
```

## Monitoring During Demo

### Watch These Metrics
- Browser status
- API response times
- Screenshot quality
- Form fill accuracy
- Success rate
- Error count

### Have These Ready
- Console logs visible
- Network tab open
- Performance metrics
- Screenshot folder
- Database viewer

---

**Remember**: Test early, test often, test everything!

The demo is only as good as your testing. 🧪
