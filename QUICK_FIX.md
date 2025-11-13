# Quick Fix Guide

## ✅ PDF Upload - FIXED!
The PDF parsing issue is now resolved. The code uses `createRequire` to access the CJS version of pdf-parse which exports a function.

## ⚠️ API Key Error - You Need to Fix This

You're getting this error:
```
Error: No embedding provider API key found. Set OPENAI_API_KEY or GOOGLE_API_KEY
```

### Solution: Create `.env.local` file

1. **In your project root** (`C:\Users\meani\Downloads\Chatbot\`), create a file named `.env.local`

2. **Add your API keys:**
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   GOOGLE_API_KEY=your-google-key-here
   ```

3. **Get your OpenAI API key:**
   - Go to: https://platform.openai.com/api-keys
   - Sign up or log in
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)
   - Paste it in `.env.local`

4. **Get Google API key (optional - only if you want Gemini):**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with Google
   - Click "Create API Key"
   - Copy the key
   - Paste it in `.env.local`

5. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then start again:
   npm run dev
   ```

### File Location
Make sure `.env.local` is in the **root** of your project:
```
Chatbot/
├── .env.local          ← CREATE THIS FILE HERE
├── package.json
├── app/
├── components/
└── ...
```

### Important Notes:
- ✅ `.env.local` is already in `.gitignore` (won't be committed to GitHub)
- ✅ You need at least `OPENAI_API_KEY` for the app to work
- ✅ `GOOGLE_API_KEY` is optional (only needed for Gemini model)
- ✅ Restart the dev server after creating/updating `.env.local`

Once you add the API key and restart, both errors will be gone! 🎉

