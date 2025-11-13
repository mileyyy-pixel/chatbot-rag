# RAG Chatbot - Next.js + Vercel AI SDK

A production-ready Retrieval-Augmented Generation (RAG) chatbot built with Next.js 14, Vercel AI SDK, and support for both OpenAI and Google Gemini models.

![RAG Chatbot](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)

## 🎯 Features

### Core Functionality
- ✅ **RAG Implementation**: Full retrieval-augmented generation with vector embeddings
- ✅ **Dual Model Support**: Switch between OpenAI (GPT-4o-mini) and Google Gemini
- ✅ **Document Upload**: Upload PDF, DOCX, TXT, and MD files
- ✅ **Real-time Streaming**: Live chat responses with streaming text
- ✅ **Vector Store**: Local JSON-based vector store (easily upgradeable to Pinecone/Supabase)

### UI/UX Features
- ✅ **Modern Chat Interface**: Beautiful chat bubbles with smooth animations
- ✅ **Dark Mode**: Toggle between light and dark themes
- ✅ **Responsive Design**: Works seamlessly on mobile and desktop
- ✅ **Copy & Regenerate**: Copy responses or regenerate them
- ✅ **Typing Indicators**: Visual feedback during AI responses
- ✅ **Source Citations**: See which documents were used for answers

### Bonus Features
- ✅ **File Upload UI**: Drag-and-drop file upload interface
- ✅ **Model Selector**: Switch between OpenAI and Gemini on the fly
- ✅ **Clear Data**: Remove all uploaded documents
- ✅ **Error Handling**: Comprehensive error messages and toasts
- ✅ **Loading States**: Visual indicators for all async operations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key OR Google API key (or both)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Then add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   ```
   
   **Note**: You need at least one API key. For embeddings, OpenAI is recommended.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Project Structure

```
Chatbot/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat streaming endpoint
│   │   ├── upload/        # File upload endpoint
│   │   └── clear/         # Clear vector store endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main chat page
├── components/
│   ├── chat-message.tsx   # Message bubble component
│   ├── chat-input.tsx     # Input component
│   ├── typing-indicator.tsx # Loading animation
│   └── header.tsx         # Header with controls
├── lib/
│   ├── embeddings.ts      # Embedding providers
│   ├── vector-store.ts    # Vector store implementation
│   ├── llm.ts            # LLM providers (OpenAI/Gemini)
│   └── utils.ts          # Utility functions
├── data/
│   └── vectors.json      # Vector store (auto-generated)
└── README.md
```

## 🏗️ Architecture

### RAG Pipeline

1. **Document Ingestion**
   - Files are uploaded via `/api/upload`
   - Text is extracted (PDF, DOCX, TXT, MD)
   - Documents are split into chunks (500 chars with 50 char overlap)

2. **Embedding Generation**
   - Each chunk is converted to embeddings using OpenAI's `text-embedding-3-small`
   - Embeddings are 1536-dimensional vectors

3. **Vector Storage**
   - Embeddings stored in local JSON file (`data/vectors.json`)
   - Includes metadata (source file, chunk index)

4. **Retrieval**
   - User query is embedded
   - Cosine similarity search finds top 5 relevant chunks
   - Context is assembled with source citations

5. **Generation**
   - Retrieved context + user query sent to LLM
   - Response is streamed back to the client
   - Supports both OpenAI and Gemini models

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS 4.1
- **AI SDK**: Vercel AI SDK (`ai` package)
- **LLMs**: OpenAI GPT-4o-mini, Google Gemini Pro
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Store**: Local JSON (upgradeable to Pinecone/Supabase)
- **File Parsing**: `pdf-parse`, `mammoth`
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🔧 Configuration

### Model Selection

Switch between models using the toggle in the header:
- **OpenAI**: Uses GPT-4o-mini (cost-effective, fast)
- **Gemini**: Uses Gemini Pro (Google's model)

### RAG Toggle

RAG is enabled by default. When enabled:
- Queries search the vector store for relevant context
- Responses are grounded in uploaded documents
- Source citations are included

When disabled:
- Chat works as a standard LLM without retrieval
- No document context is used

### Vector Store

The default implementation uses a local JSON file. To upgrade:

1. **Pinecone**: Replace `VectorStore` class with Pinecone client
2. **Supabase**: Use `pgvector` extension with Supabase
3. **Other**: Implement the `VectorStore` interface

## 📝 API Endpoints

### `POST /api/chat`

Stream chat responses with RAG.

**Body:**
```json
{
  "messages": [
    { "role": "user", "content": "What is RAG?" }
  ],
  "model": "openai" | "gemini",
  "useRAG": true
}
```

**Response:** Server-Sent Events stream

### `POST /api/upload`

Upload and process documents.

**Body:** `FormData` with `file` field

**Response:**
```json
{
  "success": true,
  "message": "File processed successfully",
  "chunks": 10
}
```

### `POST /api/clear`

Clear all documents from vector store.

**Response:**
```json
{
  "success": true,
  "message": "Vector store cleared"
}
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `OPENAI_API_KEY`
     - `GOOGLE_API_KEY`

3. **Deploy**
   - Vercel will automatically deploy
   - Your app will be live at `your-project.vercel.app`

### Environment Variables on Vercel

Add these in your Vercel project settings:
- `OPENAI_API_KEY`: Your OpenAI API key
- `GOOGLE_API_KEY`: Your Google API key

## 📸 Screenshots

### Chat Interface
![Chat Interface](screenshots/chat.png)

### Dark Mode
![Dark Mode](screenshots/dark-mode.png)

### File Upload
![File Upload](screenshots/upload.png)

## 🎓 Learning Resources

This project demonstrates:

1. **RAG Architecture**: How to implement retrieval-augmented generation
2. **Vector Embeddings**: Converting text to numerical representations
3. **Similarity Search**: Finding relevant documents using cosine similarity
4. **Streaming Responses**: Real-time AI responses with Vercel AI SDK
5. **File Processing**: Extracting text from PDFs and DOCX files
6. **Next.js App Router**: Modern React server components and API routes
7. **TypeScript**: Type-safe development
8. **Tailwind CSS**: Utility-first styling

## 🔮 Future Enhancements

- [ ] Pinecone/Supabase integration
- [ ] Multi-file upload
- [ ] Document preview
- [ ] Chat history persistence
- [ ] Export conversations
- [ ] Advanced chunking strategies
- [ ] Hybrid search (keyword + semantic)
- [ ] User authentication
- [ ] Rate limiting
- [ ] Analytics dashboard

## 📄 License

MIT License - feel free to use this project for your portfolio or learning!

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) for the excellent streaming API
- [Next.js](https://nextjs.org/) for the amazing framework
- [OpenAI](https://openai.com/) and [Google](https://ai.google.dev/) for the AI models

## 📞 Support

If you encounter any issues:

1. Check that your API keys are set correctly
2. Ensure Node.js 18+ is installed
3. Check the browser console for errors
4. Review the server logs in your terminal

---

**Built with ❤️ for learning and winning internships! 🚀**

