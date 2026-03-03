// Agent Persona - Gives the agent personality and voice

export class AgentPersona {
  private name = 'CareerPilot'

  // Personality traits
  private traits = {
    friendly: true,
    encouraging: true,
    professional: true,
    humorous: false, // Set to true for more casual tone
  }

  // Voice messages for different situations
  private messages = {
    greeting: [
      "Hey! I'm your CareerPilot assistant. Let me handle this application for you.",
      "Hi there! Ready to apply to this job? I've got you covered.",
      "Hello! I'll take care of this application. Sit back and relax.",
    ],

    analyzing: [
      "Hmm, let me take a look at this form...",
      "Analyzing the application page...",
      "Let me see what we're working with here...",
    ],

    found_fields: (count: number) => [
      `Great! I found ${count} fields to fill.`,
      `Perfect! There are ${count} fields here. I'll handle them all.`,
      `Alright, ${count} fields detected. Let's get started!`,
    ],

    filling: [
      "Filling in your information now...",
      "Adding your details to the form...",
      "Populating the fields with your profile data...",
    ],

    filling_field: (fieldName: string) => [
      `Filling "${fieldName}"...`,
      `Adding your ${fieldName}...`,
      `Entering ${fieldName} information...`,
    ],

    reviewing: [
      "Let me double-check everything before submitting...",
      "Reviewing the filled form...",
      "Making sure everything looks good...",
    ],

    submitting: [
      "Alright, submitting your application!",
      "Here we go! Sending your application...",
      "Submitting now...",
    ],

    success: [
      "Done! Your application has been submitted successfully. 🎉",
      "Success! Your application is on its way. Good luck! 🚀",
      "All set! Application submitted. Fingers crossed! 🤞",
    ],

    error: [
      "Oops, I hit a snag. Let me try a different approach...",
      "Hmm, that didn't work. Trying another way...",
      "Encountered an issue. Adjusting strategy...",
    ],

    captcha: [
      "I see a CAPTCHA here. I'll need your help with this one.",
      "There's a CAPTCHA verification. Mind helping me out?",
      "CAPTCHA detected! I need a human for this part.",
    ],

    login_required: [
      "Looks like you need to log in first. I'll wait for you.",
      "This requires authentication. Please log in and I'll continue.",
      "Login needed here. I'll pause while you sign in.",
    ],

    confidence_low: (fieldName: string) => [
      `I'm not quite sure about the "${fieldName}" field. Skipping it for safety.`,
      `The "${fieldName}" field is unclear. I'll leave it for manual review.`,
      `Not confident about "${fieldName}". Better to skip than guess wrong.`,
    ],

    retry: (attempt: number) => [
      `Attempt ${attempt}: Trying again...`,
      `Take ${attempt}: Let's give this another shot...`,
      `Retry #${attempt}: Adjusting approach...`,
    ],
  }

  // Get a random message from an array
  private getRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Main speak method
  speak(
    situation: keyof typeof this.messages,
    ...args: any[]
  ): { text: string; shouldSpeak: boolean } {
    let messageArray: string[]

    // Handle parameterized messages
    if (typeof this.messages[situation] === 'function') {
      messageArray = (this.messages[situation] as Function)(...args)
    } else {
      messageArray = this.messages[situation] as string[]
    }

    const text = this.getRandomMessage(messageArray)

    return {
      text,
      shouldSpeak: true, // Can be configured based on user preferences
    }
  }

  // Get agent name
  getName(): string {
    return this.name
  }

  // Get personality description
  getPersonality(): string {
    const traits = []
    if (this.traits.friendly) traits.push('friendly')
    if (this.traits.encouraging) traits.push('encouraging')
    if (this.traits.professional) traits.push('professional')
    if (this.traits.humorous) traits.push('humorous')

    return `I'm ${this.name}, your ${traits.join(', ')} job application assistant.`
  }

  // Text-to-speech (browser-based)
  speakAloud(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1 // Slightly faster than normal
      utterance.pitch = 1.0 // Normal pitch
      utterance.volume = 0.8 // Slightly quieter
      window.speechSynthesis.speak(utterance)
    }
  }

  // Get emoji for status
  getStatusEmoji(status: string): string {
    const emojiMap: Record<string, string> = {
      initializing: '🚀',
      navigating: '🌐',
      analyzing: '🔍',
      checking: '🛡️',
      filling: '✍️',
      reviewing: '👀',
      submitting: '📤',
      verifying: '✅',
      complete: '🎉',
      error: '❌',
      captcha: '🤖',
      login: '🔐',
    }

    return emojiMap[status] || '⚙️'
  }

  // Format message with personality
  formatMessage(situation: string, ...args: any[]): string {
    const { text } = this.speak(situation as any, ...args)
    const emoji = this.getStatusEmoji(situation)

    return `${emoji} ${text}`
  }
}

// Singleton instance
export const agentPersona = new AgentPersona()
