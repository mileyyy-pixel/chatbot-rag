import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ModelProvider = "openai" | "gemini";

export interface LLMProvider {
  streamChat(messages: Array<{ role: "user" | "assistant"; content: string }>, context?: string): AsyncGenerator<string, void, unknown>;
}

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async *streamChat(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    context?: string
  ): AsyncGenerator<string, void, unknown> {
    const systemMessage = context
      ? `You are a helpful assistant. Use the following context to answer questions accurately. If the context doesn't contain relevant information, say so.\n\nContext:\n${context}`
      : "You are a helpful assistant.";

    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    ];

    const stream = await this.client.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for cost efficiency, can be changed to gpt-4
      messages: formattedMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  }
}

export class GeminiProvider implements LLMProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async *streamChat(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    context?: string
  ): AsyncGenerator<string, void, unknown> {
    let prompt = "";

    if (context) {
      prompt += `Context:\n${context}\n\n`;
    }

    // Format conversation history
    for (const msg of messages) {
      if (msg.role === "user") {
        prompt += `User: ${msg.content}\n`;
      } else {
        prompt += `Assistant: ${msg.content}\n`;
      }
    }

    prompt += "Assistant: ";

    const result = await this.model.generateContentStream(prompt);
    const stream = result.stream;

    for await (const chunk of stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }
}

export function getLLMProvider(provider: ModelProvider): LLMProvider {
  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not found in environment variables");
    }
    return new OpenAIProvider(apiKey);
  } else if (provider === "gemini") {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY not found in environment variables");
    }
    return new GeminiProvider(apiKey);
  }
  throw new Error(`Unknown provider: ${provider}`);
}

