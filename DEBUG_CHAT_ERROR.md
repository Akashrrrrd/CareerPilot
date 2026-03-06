# 🔍 Debug Chat Error

## What to Do

### Step 1: Restart Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 2: Try the Chat Again
1. Go to http://localhost:3000/agent
2. Look at your **terminal** (where npm run dev is running)
3. You should see detailed logs like:

```
[Chat API GET] Request for userId: aakashrajendran2004@gmail.com
[Chat API GET] Connecting to database...
[Chat API GET] Database connected
[Chat API GET] Finding chat for user: aakashrajendran2004@gmail.com
[Chat API GET] Chat found: false
[Chat API GET] Creating new chat...
[Chat API GET] New chat created
```

### Step 3: Share the Error
If you see an error in the terminal, copy the **entire error message** including:
- The error type
- The error message
- The stack trace

---

## Common Issues & Fixes

### Issue 1: MongoDB Connection Error
**Error:** `MongooseError: Operation 'chats.findOne()' buffering timed out`

**Fix:** Check your MongoDB connection string in `.env.local`:
```env
MONGODB_URI="mongodb+srv://..."
```

Make sure:
- The connection string is correct
- Your IP is whitelisted in MongoDB Atlas
- The database user has proper permissions

### Issue 2: Chat Model Not Found
**Error:** `Cannot read property 'findOne' of undefined`

**Fix:** The Chat model import might be wrong. Already fixed in the code.

### Issue 3: Gemini API Error
**Error:** `AI model not found`

**Fix:** Make sure `.env.local` has:
```env
GEMINI_API_KEY="AIzaSy..."
```

---

## Quick Test Without Chat

If chat is still broken, test the demo instead:

1. Go to: **http://localhost:3000/demo**
2. Click "Start Agent"
3. This doesn't use MongoDB, so it should work

---

## Alternative: Skip Chat, Use Demo

For the hackathon, you can focus on the **demo page** which is more impressive anyway:

- `/demo` - Live streaming agent (THIS IS WHAT JUDGES WANT TO SEE)
- `/agent` - Chat interface (nice to have, but not critical)

The demo page is your winning feature! 🏆

---

## What I Added

I added detailed logging to `app/api/chat/route.ts` so we can see exactly where it fails:

```typescript
console.log('[Chat API GET] Request for userId:', userId)
console.log('[Chat API GET] Connecting to database...')
console.log('[Chat API GET] Database connected')
console.log('[Chat API GET] Finding chat for user:', userId)
console.log('[Chat API GET] Chat found:', !!chat)
```

This will help us debug the issue.

---

## Next Steps

1. Restart server
2. Try chat again
3. Look at terminal output
4. Share the error message if it still fails

OR

Just focus on `/demo` which is working and more impressive! 🚀
