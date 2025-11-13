import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }
}

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }
}

export function getEmbeddingProvider(): EmbeddingProvider {
  const geminiKey = process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Prefer Gemini if available, fallback to OpenAI
  if (geminiKey) {
    return new GeminiEmbeddingProvider(geminiKey);
  }

  if (openaiKey) {
    return new OpenAIEmbeddingProvider(openaiKey);
  }

  throw new Error("No embedding provider API key found. Set OPENAI_API_KEY or GOOGLE_API_KEY");
}

