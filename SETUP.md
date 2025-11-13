# Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   ```
   
   **Important**: You need at least one API key. For embeddings, OpenAI is required.

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Getting API Keys

### OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key and add it to `.env.local`

### Google API Key (for Gemini)

1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to `.env.local`

## Testing the Application

1. **Upload a document**
   - Click the "Upload" button in the header
   - Select a PDF, DOCX, TXT, or MD file
   - Wait for the upload confirmation

2. **Ask a question**
   - Type a question in the chat input
   - The AI will search your documents and provide an answer
   - Try asking: "What is RAG?" or "Summarize the documents"

3. **Switch models**
   - Use the model selector in the header to switch between OpenAI and Gemini
   - Compare the responses from different models

4. **Toggle dark mode**
   - Click the moon/sun icon in the header

## Troubleshooting

### "OPENAI_API_KEY not found" error
- Make sure your `.env.local` file exists in the root directory
- Check that the variable name is exactly `OPENAI_API_KEY`
- Restart the development server after adding environment variables

### "GOOGLE_API_KEY not found" error
- Same as above, but for `GOOGLE_API_KEY`
- Note: You only need this if you want to use Gemini

### File upload not working
- Check that the file is PDF, DOCX, TXT, or MD format
- Ensure the file is not corrupted
- Check the browser console for errors

### Chat not responding
- Check your API keys are valid
- Ensure you have credits/quota in your OpenAI/Google account
- Check the server logs in your terminal

## Building for Production

```bash
npm run build
npm start
```

## Deploying to Vercel

1. Push your code to GitHub
2. Import the repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `GOOGLE_API_KEY`
4. Deploy!

The app will be live at `your-project.vercel.app`

