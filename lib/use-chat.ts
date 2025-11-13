"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface UseChatOptions {
  api?: string;
  body?: Record<string, any>;
  onError?: (error: Error) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const { api = "/api/chat", body = {}, onError } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const append = useCallback(
    async (message: { role: "user" | "assistant"; content: string }) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: message.role,
        content: message.content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Create assistant message placeholder
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch(api, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            ...body,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          try {
            const errorBody = await response.json();
            if (errorBody?.error) {
              errorMessage = errorBody.error;
            }
          } catch {
            // ignore JSON parse errors
          }
          throw new Error(errorMessage);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        let assistantContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("0:")) {
              // Extract text from data stream format: 0:"text"
              try {
                const text = JSON.parse(line.slice(2));
                assistantContent += text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              } catch (e) {
                // Skip invalid JSON
              }
            } else if (line.startsWith("d:")) {
              // Done signal
              break;
            }
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          return;
        }
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
        if (onError) {
          onError(error);
        } else {
          console.error("Chat error:", error);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [api, body, messages, onError]
  );

  const reload = useCallback(() => {
    if (messages.length === 0) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      setMessages((prev) => prev.slice(0, -1)); // Remove last assistant message
      append({ role: "user", content: lastUserMessage.content });
    }
  }, [messages, append]);

  const handleInputChange = useCallback(
    (e: { target: { value: string } } | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      append({ role: "user", content: input });
      setInput("");
    },
    [input, isLoading, append]
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    reload,
    setInput,
  };
}

