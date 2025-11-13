import { NextRequest } from "next/server";
import { getVectorStore } from "@/lib/vector-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const vectorStore = await getVectorStore();
    await vectorStore.clear();

    return new Response(
      JSON.stringify({ success: true, message: "Vector store cleared successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Clear API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

