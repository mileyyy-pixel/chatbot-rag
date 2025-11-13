import { NextRequest } from "next/server";
import { getVectorStore } from "@/lib/vector-store";
import mammoth from "mammoth";
import PDFParser from "pdf2json";

async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);
    
    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(new Error(errData.parserError));
    });
    
    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        let text = "";
        for (const page of pdfData.Pages) {
          for (const textItem of page.Texts) {
            for (const item of textItem.R) {
              if (item.T) {
                text += decodeURIComponent(item.T) + " ";
              }
            }
          }
          text += "\n";
        }
        resolve(text.trim());
      } catch (error: any) {
        reject(error);
      }
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name;
    const fileExtension = fileName.toLowerCase().split('.').pop();

    // Check file size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 10MB." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let text = "";

    // Extract text based on file type
    try {
      if (fileExtension === "pdf") {
        text = await extractPdfText(buffer);
      } else if (fileExtension === "docx") {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } else if (fileExtension === "txt" || fileExtension === "md") {
        text = buffer.toString("utf-8");
      } else {
        return new Response(
          JSON.stringify({ error: "Unsupported file type. Please upload PDF, DOCX, TXT, or MD files." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (parseError: any) {
      console.error("File parsing error:", parseError);
      return new Response(
        JSON.stringify({ 
          error: `Failed to parse ${fileExtension?.toUpperCase()} file. The file might be corrupted or in an unsupported format.` 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: "No text content found in file. The file appears to be empty or contains only images." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Add to vector store
    const vectorStore = await getVectorStore();
    await vectorStore.addDocument(text, {
      source: fileName,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `File "${fileName}" uploaded and processed successfully`,
        chunks: vectorStore.getAllChunks().length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Upload API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred while processing the file" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

