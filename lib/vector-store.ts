import fs from "fs/promises";
import path from "path";
import { getEmbeddingProvider } from "./embeddings";

export interface DocumentChunk {
  id: string;
  text: string;
  embedding: number[];
  metadata?: {
    source?: string;
    page?: number;
    chunkIndex?: number;
  };
}

const VECTOR_STORE_PATH = path.join(process.cwd(), "data", "vectors.json");

export class VectorStore {
  private chunks: DocumentChunk[] = [];
  private embeddingProvider = getEmbeddingProvider();

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(VECTOR_STORE_PATH, "utf-8");
      this.chunks = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start with empty store
      this.chunks = [];
    }
  }

  async save(): Promise<void> {
    const dir = path.dirname(VECTOR_STORE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(VECTOR_STORE_PATH, JSON.stringify(this.chunks, null, 2));
  }

  async addDocument(text: string, metadata?: DocumentChunk["metadata"]): Promise<void> {
    // Split text into chunks (simple approach - can be improved)
    const chunkSize = 500;
    const overlap = 50;
    const chunks: string[] = [];

    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    // Generate embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await this.embeddingProvider.generateEmbedding(chunks[i]);
      const chunk: DocumentChunk = {
        id: `${Date.now()}-${i}`,
        text: chunks[i],
        embedding,
        metadata: {
          ...metadata,
          chunkIndex: i,
        },
      };
      this.chunks.push(chunk);
    }

    await this.save();
  }

  async search(query: string, topK: number = 5): Promise<DocumentChunk[]> {
    if (this.chunks.length === 0) {
      return [];
    }

    // Generate embedding for query
    const queryEmbedding = await this.embeddingProvider.generateEmbedding(query);

    // Calculate cosine similarity for each chunk
    const similarities = this.chunks.map((chunk) => ({
      chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort by similarity and return top K
    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK).map((item) => item.chunk);
  }

  getAllChunks(): DocumentChunk[] {
    return this.chunks;
  }

  async clear(): Promise<void> {
    this.chunks = [];
    await this.save();
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Singleton instance
let vectorStoreInstance: VectorStore | null = null;

export async function getVectorStore(): Promise<VectorStore> {
  if (!vectorStoreInstance) {
    vectorStoreInstance = new VectorStore();
    await vectorStoreInstance.load();
  }
  return vectorStoreInstance;
}

