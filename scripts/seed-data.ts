/**
 * Script to seed initial data into the vector store
 * Run with: npx tsx scripts/seed-data.ts
 */

import { getVectorStore } from "../lib/vector-store";
import fs from "fs/promises";
import path from "path";

async function seedData() {
  try {
    console.log("Loading sample documents...");
    
    const sampleDocPath = path.join(process.cwd(), "data", "sample-docs.txt");
    const sampleText = await fs.readFile(sampleDocPath, "utf-8");
    
    console.log("Initializing vector store...");
    const vectorStore = await getVectorStore();
    
    console.log("Adding sample document to vector store...");
    await vectorStore.addDocument(sampleText, {
      source: "sample-docs.txt",
    });
    
    console.log("✅ Sample data seeded successfully!");
    console.log(`Total chunks: ${vectorStore.getAllChunks().length}`);
  } catch (error: any) {
    console.error("❌ Error seeding data:", error.message);
    process.exit(1);
  }
}

seedData();

