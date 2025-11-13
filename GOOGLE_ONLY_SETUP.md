# Using Only Google/Gemini (No OpenAI)

If you want to use **only Google/Gemini** and avoid OpenAI quota issues:

## Setup Steps

1. **Get your Google API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Sign in with Google
   - Create a new project if prompted
   - Click "Create API Key"
   - Copy the key (looks like `AIza...`)

2. **Create `.env.local` with ONLY Google key:**
   ```env
   GOOGLE_API_KEY=AIza-your-actual-key-here
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

4. **In the app UI:**
   - Click the **"Gemini"** button in the header (model selector)
   - Now all chat and embeddings use Google/Gemini
   - Upload files and chat normally

## What Uses What:

- **Embeddings (for RAG/vector search):** Now uses Gemini `text-embedding-004`
- **Chat responses:** Uses whichever model you select in the UI
  - **OpenAI** button → Uses OpenAI GPT-4o-mini (requires OpenAI key)
  - **Gemini** button → Uses Gemini 1.5 Flash (requires Google key)

## Important Notes:

- ✅ You can run the entire app with ONLY `GOOGLE_API_KEY`
- ✅ The system now prefers Gemini for embeddings
- ⚠️ Make sure to select "Gemini" in the UI header
- ⚠️ If you click "OpenAI" without an OpenAI key, you'll get quota errors

## Current Status:

- ✅ PDF upload works
- ✅ Gemini embeddings work
- ✅ Gemini chat works
- ✅ Build passes

Just restart your server and **make sure to click the "Gemini" button in the header!**

