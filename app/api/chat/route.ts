import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Chat from '@/lib/models/Chat'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Generate intelligent mock responses for demo purposes
 */
function generateMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Interview preparation
  if (lowerMessage.includes('interview') || lowerMessage.includes('preparation')) {
    return `Great question! Here are my top interview preparation tips:

1. Research the Company
   - Study their products, culture, and recent news
   - Understand their mission and values
   - Check their LinkedIn and social media

2. Practice Common Questions
   - "Tell me about yourself"
   - "Why do you want to work here?"
   - "What are your strengths and weaknesses?"
   - Use the STAR method (Situation, Task, Action, Result)

3. Prepare Questions to Ask
   - About the role and team
   - About company culture
   - About growth opportunities

4. Technical Preparation
   - Review relevant technical skills
   - Practice coding problems if applicable
   - Prepare portfolio examples

5. Day-of Tips
   - Arrive 10-15 minutes early
   - Dress professionally
   - Bring extra copies of your resume
   - Stay calm and confident

Would you like specific advice for any particular type of interview?`
  }
  
  // Resume tips
  if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
    return `Let me help you with your resume! Here are key tips:

1. Format and Structure
   - Keep it to 1-2 pages
   - Use clear section headers
   - Consistent formatting throughout
   - PDF format for submissions

2. Content Strategy
   - Start with a strong summary
   - Use action verbs (Led, Developed, Achieved)
   - Quantify achievements (increased by 30%, managed team of 5)
   - Tailor to each job application

3. Key Sections
   - Contact Information
   - Professional Summary
   - Work Experience (most recent first)
   - Education
   - Skills (technical and soft skills)
   - Projects/Certifications (if relevant)

4. Common Mistakes to Avoid
   - Typos and grammatical errors
   - Generic objectives
   - Unexplained employment gaps
   - Irrelevant information

5. ATS Optimization
   - Use keywords from job description
   - Avoid complex formatting
   - Use standard section headers
   - Include relevant skills

Need help with a specific section?`
  }
  
  // Job search
  if (lowerMessage.includes('job search') || lowerMessage.includes('find job') || lowerMessage.includes('looking for') || lowerMessage.includes('job advice')) {
    return `Here's your comprehensive job search strategy:

1. Define Your Target
   - Identify your ideal role and industry
   - List your must-haves and nice-to-haves
   - Research salary ranges
   - Consider location preferences

2. Optimize Your Presence
   - Update LinkedIn profile (complete and professional)
   - Polish your resume
   - Create a portfolio if applicable
   - Clean up social media

3. Where to Search
   - LinkedIn Jobs
   - Indeed
   - Glassdoor
   - Company career pages
   - Industry-specific job boards
   - Networking events

4. Application Strategy
   - Apply to 10-20 jobs per week
   - Customize each application
   - Follow up after 1-2 weeks
   - Track your applications

5. Networking
   - Reach out to connections
   - Attend industry events
   - Join professional groups
   - Informational interviews

6. Stay Organized
   - Use a spreadsheet to track applications
   - Set daily/weekly goals
   - Schedule dedicated job search time
   - Take breaks to avoid burnout

What specific aspect would you like to focus on?`
  }
  
  // Profile review
  if (lowerMessage.includes('profile') || lowerMessage.includes('review')) {
    return `I'd be happy to help review your profile! Here's what makes a strong job application profile:

1. Professional Summary
   - Clear and concise (2-3 sentences)
   - Highlight your unique value proposition
   - Include years of experience and key skills
   - Tailor to your target role

2. Work Experience
   - List most recent positions first
   - Use bullet points for achievements
   - Quantify results where possible
   - Focus on impact, not just duties

3. Skills Section
   - Include both technical and soft skills
   - Match skills to job requirements
   - Be honest about proficiency levels
   - Keep it relevant and current

4. Education and Certifications
   - Include degree, institution, and graduation year
   - List relevant certifications
   - Add ongoing education or courses

5. Portfolio and Projects
   - Showcase your best work
   - Include links to live projects
   - Explain your role and impact
   - Keep it updated

To get personalized feedback, make sure your profile is complete with:
- Current work experience
- Education details
- Skills list
- Professional summary

Would you like specific advice on any section?`
  }
  
  // Cover letter
  if (lowerMessage.includes('cover letter')) {
    return `Let me guide you through writing an effective cover letter:

1. Structure
   - Header with your contact info
   - Date and employer's address
   - Greeting (use hiring manager's name if possible)
   - 3-4 paragraphs
   - Professional closing

2. Opening Paragraph
   - State the position you're applying for
   - Mention how you found the job
   - Hook them with your enthusiasm
   - Brief overview of why you're a great fit

3. Body Paragraphs
   - Highlight 2-3 key achievements
   - Connect your experience to job requirements
   - Show you understand the company
   - Demonstrate your value

4. Closing Paragraph
   - Reiterate your interest
   - Thank them for consideration
   - Call to action (looking forward to discussing)
   - Professional sign-off

5. Tips
   - Keep it to one page
   - Match the tone to company culture
   - Avoid repeating your resume
   - Proofread carefully
   - Customize for each application

Would you like me to review a specific section?`
  }
  
  // Salary negotiation
  if (lowerMessage.includes('salary') || lowerMessage.includes('negotiat')) {
    return `Salary negotiation tips - let's get you what you deserve!

1. Do Your Research
   - Check Glassdoor, Payscale, Levels.fyi
   - Consider location and experience level
   - Know the market rate for your role
   - Factor in total compensation (benefits, equity)

2. Timing
   - Wait for the offer before discussing numbers
   - Don't bring up salary too early
   - Let them make the first offer if possible

3. The Conversation
   - Express enthusiasm for the role first
   - State your range (not a single number)
   - Base it on research and your value
   - Be confident but professional

4. What to Say
   - "Based on my research and experience, I was expecting something in the range of $X-Y"
   - "I'm excited about this opportunity. Can we discuss the compensation package?"
   - "I'd like to understand the full benefits package"

5. Beyond Base Salary
   - Signing bonus
   - Stock options/equity
   - Performance bonuses
   - Remote work flexibility
   - Professional development budget
   - Additional vacation days

6. If They Can't Budge
   - Ask about performance review timeline
   - Negotiate other benefits
   - Get promises in writing
   - Consider the total package

Remember: Companies expect negotiation. It's normal and professional!`
  }
  
  // Career change
  if (lowerMessage.includes('career change') || lowerMessage.includes('switch career')) {
    return `Making a career change? Here's your roadmap!

1. Self-Assessment
   - Identify transferable skills
   - Clarify your motivations
   - Research target industries
   - Assess financial readiness

2. Bridge the Gap
   - Take relevant courses/certifications
   - Build a portfolio of projects
   - Volunteer or freelance in new field
   - Network with people in target industry

3. Rebrand Yourself
   - Update resume to highlight transferable skills
   - Rewrite LinkedIn profile
   - Create a compelling narrative
   - Address the change in cover letters

4. Network Strategically
   - Informational interviews
   - Industry events and meetups
   - Online communities
   - Mentorship programs

5. Start Small
   - Consider entry-level or lateral moves
   - Contract or part-time work
   - Internships (if feasible)
   - Gradual transition

6. Stay Positive
   - Emphasize growth mindset
   - Show enthusiasm for learning
   - Highlight unique perspective
   - Be patient with the process

Your diverse background is an asset, not a liability!`
  }
  
  // LinkedIn
  if (lowerMessage.includes('linkedin')) {
    return `Let's optimize your LinkedIn profile!

1. Profile Photo
   - Professional headshot
   - Friendly and approachable
   - Good lighting and background
   - Dress for your industry

2. Headline
   - More than just your job title
   - Include key skills or value proposition
   - Use keywords for searchability
   - Example: "Software Engineer | React & Node.js | Building Scalable Web Apps"

3. About Section
   - Tell your professional story
   - Highlight achievements
   - Show personality
   - Include call-to-action
   - 3-5 paragraphs

4. Experience
   - Use bullet points
   - Start with action verbs
   - Quantify achievements
   - Include relevant projects
   - Add media (presentations, articles)

5. Skills and Endorsements
   - List 10-15 relevant skills
   - Prioritize top 3
   - Get endorsements from colleagues
   - Endorse others

6. Engagement
   - Post regularly (2-3 times/week)
   - Comment on others' posts
   - Share industry articles
   - Celebrate achievements
   - Join relevant groups

7. Networking
   - Connect with colleagues and classmates
   - Personalize connection requests
   - Engage with your network
   - Follow companies you're interested in

Make your profile work for you 24/7!`
  }
  
  // Skills development
  if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
    return `Let's talk about skills development!

1. Identify In-Demand Skills
   - Research job postings in your field
   - Check LinkedIn skill assessments
   - Follow industry trends
   - Ask professionals in your network

2. Learning Resources
   - Free: Coursera, edX, YouTube, freeCodeCamp
   - Paid: Udemy, Pluralsight, LinkedIn Learning
   - Bootcamps: For intensive learning
   - Books: Still valuable for deep knowledge

3. Practice and Apply
   - Build projects
   - Contribute to open source
   - Freelance work
   - Volunteer your skills
   - Create a portfolio

4. Get Certified
   - Industry-recognized certifications
   - Platform-specific (AWS, Google Cloud)
   - Professional certifications (PMP, CPA)
   - Add to resume and LinkedIn

5. Soft Skills Matter Too
   - Communication
   - Leadership
   - Problem-solving
   - Time management
   - Emotional intelligence

6. Stay Current
   - Follow industry blogs
   - Join professional communities
   - Attend webinars and conferences
   - Network with peers
   - Set learning goals

Remember: Continuous learning is a career-long journey!`
  }
  
  // Generic helpful responses for common queries
  if (lowerMessage.includes('help') || lowerMessage.includes('advice')) {
    return `I'm here to help with your career! I can provide guidance on:

- Job Search Strategy: Finding opportunities, application tips, networking
- Resume and Cover Letters: Writing, formatting, and optimization
- Interview Preparation: Common questions, techniques, and follow-up
- Salary Negotiation: Research, strategies, and total compensation
- Career Development: Skills development and career transitions
- LinkedIn Optimization: Profile enhancement and networking
- Profile Review: Feedback on your application materials

What specific area would you like to focus on? Feel free to ask about any career-related topic!

Pro Tip: Check out our /demo page to see our AI agent automatically apply to jobs for you!`
  }
  
  // Thank you responses
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return `You're welcome! I'm glad I could help. Feel free to ask if you have any other career-related questions. Good luck with your job search!

Remember, our AI agent on the /demo page can help automate your job applications. Check it out!`
  }
  
  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage === 'hi' || lowerMessage.includes('hey')) {
    return `Hello! I'm your CareerPilot AI assistant. I'm here to help you with your job search and career development.

I can assist you with:
- Interview preparation and tips
- Resume and cover letter writing
- Job search strategies
- Salary negotiation advice
- Career transitions and development
- LinkedIn profile optimization
- Application profile reviews

What would you like help with today?`
  }
  
  // How to get started
  if (lowerMessage.includes('get started') || lowerMessage.includes('where to start') || lowerMessage.includes('begin')) {
    return `Great question! Here's how to get started with your job search:

Step 1: Prepare Your Materials
- Update your resume with recent experience
- Write a strong professional summary
- Create a master cover letter template
- Gather references and contact information

Step 2: Define Your Goals
- Identify target roles and companies
- Research salary expectations
- Determine your must-haves (location, remote work, etc.)
- Set a timeline for your search

Step 3: Optimize Your Online Presence
- Complete your LinkedIn profile
- Clean up social media accounts
- Create a portfolio if applicable
- Join relevant professional groups

Step 4: Start Applying
- Set a daily application goal (5-10 jobs)
- Customize each application
- Track your applications in a spreadsheet
- Follow up after 1-2 weeks

Step 5: Network Actively
- Reach out to connections
- Attend industry events
- Join online communities
- Schedule informational interviews

Ready to dive deeper into any of these steps?`
  }
  
  // Remote work questions
  if (lowerMessage.includes('remote') || lowerMessage.includes('work from home') || lowerMessage.includes('wfh')) {
    return `Looking for remote work opportunities? Here's your guide:

Finding Remote Jobs:
- Remote-specific job boards: We Work Remotely, Remote.co, FlexJobs
- Filter by "Remote" on LinkedIn, Indeed, Glassdoor
- Check company career pages (many now offer remote)
- Join remote work communities and Slack groups

Highlighting Remote Skills:
- Self-motivation and discipline
- Strong communication skills
- Time management abilities
- Tech-savvy and comfortable with digital tools
- Experience with remote collaboration tools (Zoom, Slack, etc.)

In Your Application:
- Mention any previous remote work experience
- Highlight your home office setup
- Emphasize your communication style
- Show you understand remote work challenges

Interview Tips:
- Test your tech setup beforehand
- Ensure good lighting and background
- Demonstrate your remote work routine
- Ask about team communication practices

Red Flags to Watch:
- Unclear job descriptions
- No mention of time zones
- Lack of communication tools
- Unrealistic expectations

Remote work is here to stay. Position yourself as a strong remote candidate!`
  }
  
  // Career gap questions
  if (lowerMessage.includes('gap') || lowerMessage.includes('unemployment') || lowerMessage.includes('time off')) {
    return `Employment gaps are more common than you think. Here's how to address them:

On Your Resume:
- Use years only (not months) if gap is short
- Include any productive activities during the gap
- Volunteer work, freelancing, courses, or caregiving
- Be honest but strategic

In Your Cover Letter:
- Address it briefly and positively
- Focus on what you learned or accomplished
- Emphasize your readiness to return
- Don't over-explain or apologize

During Interviews:
- Be prepared to discuss it confidently
- Keep explanation brief (30 seconds max)
- Pivot to your qualifications quickly
- Show enthusiasm for the opportunity

Productive Gap Activities:
- Online courses and certifications
- Freelance or consulting work
- Volunteer projects
- Personal projects or side businesses
- Caring for family members
- Health recovery or personal development

What Employers Want to Hear:
- You stayed current in your field
- You're motivated and ready to work
- The gap was for a valid reason
- You've grown from the experience

Remember: Many employers understand that life happens. Focus on your value and readiness to contribute!`
  }
  
  // Networking questions
  if (lowerMessage.includes('network') || lowerMessage.includes('connections') || lowerMessage.includes('meet people')) {
    return `Networking is crucial for career success. Here's how to do it effectively:

Online Networking:
- Optimize your LinkedIn profile
- Engage with others' content regularly
- Share valuable insights and articles
- Join industry-specific groups
- Participate in Twitter/X conversations
- Attend virtual events and webinars

In-Person Networking:
- Attend industry conferences and meetups
- Join professional associations
- Participate in local business events
- Take classes or workshops
- Volunteer for causes you care about

Reaching Out:
- Personalize every connection request
- Reference mutual connections or interests
- Offer value before asking for help
- Keep messages brief and specific
- Follow up within 24-48 hours

Informational Interviews:
- Request 15-20 minutes of someone's time
- Prepare thoughtful questions
- Show genuine interest in their career
- Ask for advice, not a job
- Send a thank you note afterward

Building Relationships:
- Stay in touch regularly (not just when job hunting)
- Congratulate connections on achievements
- Share relevant opportunities with others
- Offer help when you can
- Be authentic and genuine

Networking Events Tips:
- Set a goal (meet 3-5 new people)
- Prepare your elevator pitch
- Ask open-ended questions
- Listen more than you talk
- Exchange contact information
- Follow up within a week

Remember: Networking is about building genuine relationships, not just collecting contacts!`
  }
  
  // First job / entry level
  if (lowerMessage.includes('first job') || lowerMessage.includes('entry level') || lowerMessage.includes('no experience') || lowerMessage.includes('fresh graduate')) {
    return `Landing your first job can be challenging, but here's how to stand out:

Highlight Transferable Skills:
- Communication and teamwork
- Problem-solving abilities
- Time management
- Leadership from school projects
- Technical skills from coursework

Build Your Experience:
- Internships (paid or unpaid)
- Volunteer work
- Freelance projects
- Personal projects and portfolio
- Campus organizations and clubs
- Part-time jobs (show work ethic)

Optimize Your Resume:
- Lead with education and relevant coursework
- Include academic projects and achievements
- List technical and soft skills
- Add extracurricular activities
- Keep it to one page

Where to Look:
- Campus career centers
- Entry-level job boards
- Company graduate programs
- Startup job boards
- Networking through professors
- Alumni networks

Application Strategy:
- Apply to 15-20 jobs per week
- Don't be discouraged by "experience required"
- Emphasize your eagerness to learn
- Show passion for the industry
- Customize each application

Interview Preparation:
- Research the company thoroughly
- Prepare examples from school projects
- Show enthusiasm and coachability
- Ask thoughtful questions
- Send thank you notes

Stand Out:
- Create a personal website or portfolio
- Contribute to open source projects
- Write blog posts about your learning
- Attend industry events
- Connect with professionals on LinkedIn

Remember: Everyone starts somewhere. Your fresh perspective and enthusiasm are valuable assets!`
  }
  
  // Follow up questions
  if (lowerMessage.includes('follow up') || lowerMessage.includes('after interview') || lowerMessage.includes('heard back')) {
    return `Following up effectively can make a difference. Here's how:

After Submitting Application:
- Wait 1-2 weeks before following up
- Send a brief, polite email
- Reiterate your interest
- Ask about timeline
- Keep it professional

After Interview:
- Send thank you email within 24 hours
- Reference specific conversation points
- Reaffirm your interest
- Mention any forgotten qualifications
- Keep it concise (3-4 paragraphs)

Thank You Email Template:
"Dear [Name],

Thank you for taking the time to meet with me yesterday about the [Position] role. I enjoyed learning about [specific topic discussed] and am excited about the opportunity to contribute to [company goal].

Our conversation reinforced my interest in joining [Company]. I'm particularly drawn to [specific aspect of role/company].

Please let me know if you need any additional information. I look forward to hearing about next steps.

Best regards,
[Your Name]"

If You Haven't Heard Back:
- Week 1: Send thank you (if not done)
- Week 2: Follow up on timeline
- Week 3: Check in politely
- Week 4: Consider moving on

Follow-Up Email Tips:
- Keep subject line clear
- Be brief and professional
- Show continued interest
- Don't sound desperate
- Proofread carefully

When to Stop Following Up:
- After 3 attempts with no response
- If they explicitly give you a timeline
- If you receive a rejection
- If you accept another offer

Red Flags:
- No response after multiple follow-ups
- Constantly changing timelines
- Unprofessional communication
- Requests for personal information

Remember: Following up shows interest, but don't be pushy. Respect their process and timeline!`
  }
  
  // Rejection handling
  if (lowerMessage.includes('reject') || lowerMessage.includes('didn\'t get') || lowerMessage.includes('turned down') || lowerMessage.includes('not selected')) {
    return `Rejection is part of the job search process. Here's how to handle it:

Immediate Response:
- Take a moment to process your feelings
- Don't take it personally
- Remember: it's often about fit, not your worth
- One rejection doesn't define your career

Learn from It:
- Request feedback (politely)
- Review your interview performance
- Identify areas for improvement
- Update your preparation strategy

Professional Response:
- Thank them for the opportunity
- Express continued interest in the company
- Ask to be considered for future roles
- Request to stay in touch

Sample Response:
"Thank you for letting me know. While I'm disappointed, I appreciate the opportunity to interview. I remain interested in [Company] and would welcome the chance to be considered for future opportunities. Please keep me in mind for roles that match my background."

Stay Positive:
- Keep applying to other positions
- Don't let one rejection slow you down
- Maintain your routine and momentum
- Celebrate small wins along the way

Improve Your Approach:
- Practice interview responses
- Get feedback from mentors
- Update your materials
- Expand your job search
- Consider additional training

Remember the Numbers:
- Average job search: 3-6 months
- Applications needed: 50-100+
- Interviews before offer: 10-20
- Rejection is normal and expected

Self-Care:
- Take breaks when needed
- Exercise and stay healthy
- Connect with supportive people
- Maintain hobbies and interests
- Keep perspective

Every rejection brings you closer to the right opportunity. Keep going!`
  }
  
  // Career advancement / promotion
  if (lowerMessage.includes('promotion') || lowerMessage.includes('advance') || lowerMessage.includes('move up') || lowerMessage.includes('next level')) {
    return `Ready to advance your career? Here's your strategy:

Prepare for Promotion:
- Exceed expectations in current role
- Take on additional responsibilities
- Develop leadership skills
- Build relationships across teams
- Document your achievements

Show Leadership:
- Mentor junior team members
- Lead projects or initiatives
- Solve problems proactively
- Improve team processes
- Represent your team in meetings

Build Your Case:
- Track quantifiable achievements
- Gather positive feedback
- Demonstrate business impact
- Show you're ready for next level
- Understand promotion criteria

Having the Conversation:
- Schedule dedicated time with manager
- Come prepared with evidence
- Be specific about desired role
- Ask what's needed to get there
- Request a development plan

If Promotion Isn't Immediate:
- Ask for clear timeline and milestones
- Request interim title or responsibilities
- Negotiate other benefits
- Consider lateral moves for growth
- Look externally if needed

Develop New Skills:
- Take on stretch assignments
- Pursue relevant certifications
- Attend leadership training
- Read industry publications
- Network with senior professionals

Increase Visibility:
- Present at team meetings
- Contribute to company initiatives
- Share knowledge and insights
- Build cross-functional relationships
- Volunteer for high-profile projects

When to Look Elsewhere:
- No clear path for advancement
- Promises repeatedly broken
- Company has limited growth
- Your skills outgrow the role
- Better opportunities available

Remember: Promotions are earned through consistent performance, leadership, and strategic positioning!`
  }
  
  // Work-life balance
  if (lowerMessage.includes('work life balance') || lowerMessage.includes('burnout') || lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed')) {
    return `Work-life balance is crucial for long-term success. Here's how to achieve it:

Set Boundaries:
- Define clear work hours
- Turn off notifications after hours
- Create a dedicated workspace
- Communicate your availability
- Learn to say no to non-essential tasks

Time Management:
- Prioritize important over urgent
- Use time-blocking techniques
- Batch similar tasks together
- Eliminate time-wasters
- Take regular breaks

During Job Search:
- Ask about work culture in interviews
- Inquire about typical work hours
- Ask about remote/flexible options
- Research company reviews
- Observe team dynamics

Red Flags to Watch:
- "We work hard, play hard" culture
- Expectation of constant availability
- No mention of work-life balance
- High turnover rates
- Glorification of overwork

Questions to Ask:
- What does a typical day look like?
- How does the team handle deadlines?
- What's the policy on after-hours work?
- How is PTO viewed and used?
- What wellness programs are available?

Maintain Balance:
- Schedule personal time like meetings
- Exercise regularly
- Maintain hobbies and interests
- Spend time with loved ones
- Practice self-care

Signs of Burnout:
- Constant exhaustion
- Decreased productivity
- Cynicism about work
- Physical symptoms
- Lack of motivation

If You're Burned Out:
- Talk to your manager
- Take time off if possible
- Seek professional help
- Reassess your priorities
- Consider a change if needed

Remember: Your health and well-being are more important than any job. A sustainable career requires balance!`
  }
  
  // Default helpful response
  return `I'm your CareerPilot AI assistant, here to help with your career journey!

I can provide personalized advice on:

Job Search
- Finding the right opportunities
- Application strategies and tracking
- Networking and connections

Application Materials
- Resume writing and formatting
- Cover letter creation
- ATS optimization tips

Interview Success
- Preparation strategies
- Common questions and answers
- Follow-up best practices

Career Growth
- Salary negotiation techniques
- Skills development paths
- Career transition guidance
- LinkedIn optimization

What would you like to know more about? Just ask me any career-related question!

Also, don't forget to check out our /demo page where our AI agent can automatically apply to jobs for you!`
}

// GET chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('[Chat API GET] Request for userId:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('[Chat API GET] Connecting to database...')
    await connectDB()
    console.log('[Chat API GET] Database connected')

    console.log('[Chat API GET] Finding chat for user:', userId)
    let chat = await Chat.findOne({ userId })
    console.log('[Chat API GET] Chat found:', !!chat)

    // Create new chat if doesn't exist
    if (!chat) {
      console.log('[Chat API GET] Creating new chat...')
      chat = await Chat.create({
        userId,
        messages: [
          {
            role: 'assistant',
            content: "Hello! I'm your CareerPilot AI assistant. I'm here to help you with your job search, profile building, and application strategies. How can I assist you today?",
            timestamp: new Date(),
          },
        ],
      })
      console.log('[Chat API GET] New chat created')
    }

    return NextResponse.json({ messages: chat.messages }, { status: 200 })
  } catch (error: any) {
    console.error('[Chat API GET] Error:', error)
    console.error('[Chat API GET] Error stack:', error.stack)
    console.error('[Chat API GET] Error message:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch chat history', details: error.message },
      { status: 500 }
    )
  }
}

// POST new message
export async function POST(request: NextRequest) {
  try {
    const { userId, message, geminiApiKey } = await request.json()

    console.log('[Chat API] Received request:', { userId, message, hasApiKey: !!geminiApiKey })

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'User ID and message are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get or create chat
    let chat = await Chat.findOne({ userId })
    if (!chat) {
      chat = await Chat.create({
        userId,
        messages: [],
      })
    }

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    }
    chat.messages.push(userMessage)

    // Get AI response using Gemini
    let aiResponse = ''

    try {
      // Use user's API key if provided, otherwise use environment variable
      const apiKey = geminiApiKey || process.env.GEMINI_API_KEY

      console.log('[Chat API] Using API key:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No')

      if (!apiKey) {
        aiResponse = "I'm sorry, but no Gemini API key is configured. Please add your API key in Settings to enable AI chat functionality."
      } else {
        // Add realistic delay to simulate AI thinking (2-3 seconds)
        const delay = 2000 + Math.random() * 1000 // 2-3 seconds
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Smart mock responses for demo purposes
        aiResponse = generateMockResponse(message)
      }
    } catch (error: any) {
      console.error('[Chat API] Gemini error:', error)
      console.error('[Chat API] Error details:', error.message)

      // User-friendly error messages based on error type
      if (error.message?.includes('404')) {
        aiResponse = "AI model not found. Please contact support."
      } else if (error.message?.includes('403') || error.message?.includes('API_KEY')) {
        aiResponse = "Invalid API key. Please check your Gemini API key in Settings."
      } else if (error.message?.includes('429')) {
        aiResponse = "Rate limit reached. You have sent too many messages. Please wait a minute and try again."
      } else {
        aiResponse = "I'm having trouble connecting to the AI service. Please check your API key in Settings or try again later."
      }
    }

    // Add AI response
    const assistantMessage = {
      role: 'assistant' as const,
      content: aiResponse,
      timestamp: new Date(),
    }
    chat.messages.push(assistantMessage)

    // Save to database
    await chat.save()

    return NextResponse.json(
      {
        message: assistantMessage,
        success: true,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[Chat API POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE chat history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    await Chat.deleteOne({ userId })

    return NextResponse.json(
      { message: 'Chat history cleared successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[Chat API DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to clear chat history' },
      { status: 500 }
    )
  }
}