# ⚡ Quick Setup Guide - What YOU Need to Do

## ✅ Step 1: Get Your Gemini API Key (2 minutes)

1. Go to: **https://aistudio.google.com/apikey**
2. Click **"Create API Key"**
3. Copy the key (starts with `AIza...`)
4. Paste it in `.env.local`:

```env
GEMINI_API_KEY="AIzaSy..."
```

**That's it for development!** ✨

---

## ✅ Step 2: Install Dependencies (1 minute)

```bash
npm install
```

This installs the new `@google/genai` SDK (already done!)

---

## ✅ Step 3: Test It Works (30 seconds)

```bash
npm run dev
```

Visit: **http://localhost:3000/demo**

Click **"Start Agent"** and watch it work!

---

## 🎯 What's Already Done

✅ Installed `@google/genai` package  
✅ Updated Gemini client to use new SDK  
✅ Configured environment variables  
✅ Set up for both API Key and Vertex AI  
✅ Ready for development and production  

---

## 🚀 For Production (Google Cloud)

When you deploy to Google Cloud, just set:

```env
GOOGLE_GENAI_USE_VERTEXAI="true"
GOOGLE_CLOUD_PROJECT="careerpilot-ai-489008"
GOOGLE_CLOUD_LOCATION="us-central1"
```

The code automatically switches to Vertex AI! 🎉

---

## 📋 Your Current Configuration

### Development (Local)
- ✅ Using: **API Key** (`GEMINI_API_KEY`)
- ✅ Model: **gemini-2.0-flash**
- ✅ SDK: **@google/genai** (official)

### Production (Google Cloud)
- ✅ Using: **Vertex AI** (when `GOOGLE_GENAI_USE_VERTEXAI=true`)
- ✅ Project: **careerpilot-ai-489008**
- ✅ Location: **us-central1**

---

## 🔍 How to Verify It's Working

### Test 1: Check Environment Variables

```bash
# Windows PowerShell
echo $env:GEMINI_API_KEY

# Should show: AIzaSy...
```

### Test 2: Run the Demo

```bash
npm run dev
# Visit http://localhost:3000/demo
# Click "Start Agent"
```

If you see the agent working, you're good! ✅

### Test 3: Check Console Logs

When you start the demo, you should see:
```
🟢 Using Gemini API Key
```

---

## ❓ Troubleshooting

### Error: "GEMINI_API_KEY is required"

**Fix:** Make sure `.env.local` has:
```env
GEMINI_API_KEY="your_actual_key_here"
```

### Error: "Module not found: @google/genai"

**Fix:** Run:
```bash
npm install @google/genai
```

### Demo doesn't work

**Fix:** 
1. Check your API key is valid
2. Restart the dev server (`npm run dev`)
3. Clear browser cache

---

## 🎉 You're Ready!

That's literally all you need to do:

1. ✅ Get API key from https://aistudio.google.com/apikey
2. ✅ Put it in `.env.local`
3. ✅ Run `npm run dev`
4. ✅ Test at `/demo`

**Everything else is already configured!** 🚀

---

## 📚 Additional Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **Get API Key:** https://aistudio.google.com/apikey
- **@google/genai SDK:** https://www.npmjs.com/package/@google/genai
- **Vertex AI Docs:** https://cloud.google.com/vertex-ai/docs

---

## 🏆 For the Hackathon

You're using the **official Google SDK** (`@google/genai`) which is:
- ✅ Recommended by Google
- ✅ Supports both API Key and Vertex AI
- ✅ Production-ready
- ✅ Meets all hackathon requirements

**You're all set to win!** 🎯
