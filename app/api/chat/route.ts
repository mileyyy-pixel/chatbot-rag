import { NextRequest } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getVectorStore } from "@/lib/vector-store";

export const runtime = "nodejs";
export const maxDuration = 30;

const escapeForStream = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");

function createStreamFromText(text: string, finishReason: "stop" | "error" = "stop") {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      if (text.trim()) {
        controller.enqueue(encoder.encode(`0:"${escapeForStream(text)}"\n`));
      }
      controller.enqueue(encoder.encode("d:" + JSON.stringify({ finishReason }) + "\n"));
      controller.close();
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model = "openai", useRAG = true } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response("No messages provided", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("Last message must be from user", { status: 400 });
    }

    let context = "";
    if (useRAG) {
      const vectorStore = await getVectorStore();
      const relevantChunks = await vectorStore.search(lastMessage.content, 5);

      if (relevantChunks.length > 0) {
        context = relevantChunks
          .map(
            (chunk, idx) =>
              `[Source ${idx + 1}${chunk.metadata?.source ? `: ${chunk.metadata.source}` : ""}]\n${chunk.text}`
          )
          .join("\n\n");
      }
    }

    const systemMessage = context
      ? `You are a helpful assistant. Use the following context to answer questions accurately. If the context doesn't contain relevant information, say so.\n\nContext:\n${context}`
      : "You are a helpful assistant.";

    const formattedMessages = [
      { role: "system" as const, content: systemMessage },
      ...messages.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    if (model === "openai") {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY not found");
      }

      const openaiClient = new OpenAI({ apiKey });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const stream = await openaiClient.chat.completions.create({
              model: "gpt-4o-mini",
              messages: formattedMessages as any,
              max_tokens: 1000,
              stream: true,
            });

            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(encoder.encode(`0:"${escapeForStream(content)}"\n`));
              }
            }
            controller.enqueue(encoder.encode("d:" + JSON.stringify({ finishReason: "stop" }) + "\n"));
            controller.close();
          } catch (error) {
            console.error("OpenAI stream error:", error);
            controller.enqueue(
              encoder.encode(
                `0:"${escapeForStream("I ran into an issue completing that request. Please try again.")}"\n`
              )
            );
            controller.enqueue(encoder.encode("d:" + JSON.stringify({ finishReason: "error" }) + "\n"));
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Vercel-AI-Data-Stream": "v1",
        },
      });
    } else if (model === "gemini") {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error("GOOGLE_API_KEY not found");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt =
        formattedMessages
          .filter((m) => m.role !== "system")
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
          .join("\n") + `\nAssistant: `;

      const fullPrompt = systemMessage + "\n\n" + prompt;
      const encoder = new TextEncoder();

      try {
        const geminiStream = await geminiModel.generateContentStream(fullPrompt);

        const readable = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of geminiStream.stream) {
                const text = chunk.text();
                if (!text) continue;
                controller.enqueue(encoder.encode(`0:"${escapeForStream(text)}"\n`));
              }
              controller.enqueue(encoder.encode("d:" + JSON.stringify({ finishReason: "stop" }) + "\n"));
              controller.close();
            } catch (streamError) {
              console.error("Gemini stream iteration error:", streamError);
              controller.enqueue(
                encoder.encode(
                  `0:"${escapeForStream(
                    "I hit a snag while streaming from Gemini. Let me try finishing that another way."
                  )}"\n`
                )
              );
              controller.enqueue(encoder.encode("d:" + JSON.stringify({ finishReason: "error" }) + "\n"));
              controller.close();
            }
          },
        });

        return new Response(readable, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "X-Vercel-AI-Data-Stream": "v1",
          },
        });
      } catch (error: any) {
        console.error("Gemini stream setup error:", error);

        const message =
          error?.status === 503 || error?.message?.includes("503")
            ? "Gemini service is temporarily overloaded. Please try again in a few seconds."
            : error?.message || "Failed to generate a response with Gemini.";

        if (error?.status === 503 || error?.message?.includes("503")) {
          return new Response(JSON.stringify({ error: message }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const completion = await geminiModel.generateContent(fullPrompt);
          const text = completion.response.text() || "I couldn't find anything relevant in the uploaded files.";
          const readable = createStreamFromText(text);

          return new Response(readable, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "X-Vercel-AI-Data-Stream": "v1",
            },
          });
        } catch (fallbackError: any) {
          console.error("Gemini fallback error:", fallbackError);
          return new Response(
            JSON.stringify({ error: fallbackError.message || message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

