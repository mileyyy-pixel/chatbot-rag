"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, FileText, Layers, MessageSquare, ShieldCheck } from "lucide-react";
import { Header } from "@/components/header";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { TypingIndicator } from "@/components/typing-indicator";
import { useChat } from "@/lib/use-chat";

// Simple toast implementation
function showToast(message: string, type: "success" | "error" = "success") {
  const toastEl = document.createElement("div");
  toastEl.className = `fixed bottom-4 right-4 z-50 rounded-lg px-4 py-2 text-sm font-medium shadow-lg ${
    type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
  }`;
  toastEl.textContent = message;
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 3000);
}

const quickPrompts = [
  "Summarise what changed between the latest files",
  "Highlight action items I should follow up on",
  "Explain the terminology that keeps appearing",
  "Find supporting data points for the conclusions",
];

const features = [
  {
    title: "Cited responses",
    description: "Every answer links back to the exact snippet I referenced.",
    icon: FileText,
  },
  {
    title: "Cross-document reasoning",
    description: "Blend insights across research decks, transcripts, and notes instantly.",
    icon: Layers,
  },
  {
    title: "Private by design",
    description: "Processed within your workspace and never logged for training.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, reload, append } = useChat({
    api: "/api/chat",
    body: {
      model: "gemini",
      useRAG: true,
    },
    onError: (error) => {
      showToast(`Error: ${error.message}`, "error");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`File "${file.name}" uploaded successfully!`, "success");
      } else {
        showToast(`Upload failed: ${data.error}`, "error");
      }
    } catch (error: any) {
      showToast(`Upload error: ${error.message}`, "error");
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all uploaded documents?")) {
      return;
    }

    try {
      const response = await fetch("/api/clear", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        showToast("All documents cleared successfully!", "success");
      } else {
        showToast(`Clear failed: ${data.error}`, "error");
      }
    } catch (error: any) {
      showToast(`Clear error: ${error.message}`, "error");
    }
  };

  const handleSend = (message: string) => {
    if (!message.trim()) return;
    append({
      role: "user",
      content: message,
    });
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_60%)] transition-colors dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_65%)]" />
        <div className="absolute inset-y-0 right-[-35%] h-[120%] w-[60%] rotate-[18deg] bg-gradient-to-b from-[#818cf826] via-[#c084fc1f] to-transparent blur-3xl dark:from-[#312e811f] dark:via-[#8b5cf61f]" />
      </div>

      <Header onFileUpload={handleFileUpload} onClearData={handleClearData} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 pb-10 pt-32 sm:px-6 lg:gap-12">
        <aside className="hidden w-72 flex-col justify-between lg:flex">
          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">
                Workspace
              </p>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">
                Conversations designed around the files you trust.
              </h2>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Drop in research, transcripts, or notes. I’ll anchor every response in the passages that matter.
              </p>
            </div>

            <div className="space-y-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                        <Icon className="h-4 w-4" />
                      </span>
                      {feature.title}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-200">Pro tip</p>
            <p className="mt-1 leading-relaxed">
              Upload multiple versions of the same deck to pinpoint what changed instantly.
            </p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col">
          <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-md transition-colors dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_90px_rgba(15,23,42,0.45)]">
            <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="w-full max-w-xl space-y-8 text-center">
                    <div className="space-y-3">
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                        Start here
                      </span>
                      <h2 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Ask once. Get the exact passage you need.
                      </h2>
                      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        Share the documents that matter and I’ll surface the quotes, numbers, and explanations worth
                        reading.
                      </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSend(prompt)}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                        >
                          <span className="max-w-[80%]">{prompt}</span>
                          <ArrowUpRight className="h-4 w-4 text-slate-400" />
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Answers stay grounded in your uploaded sources.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                      onRegenerate={message.role === "assistant" ? () => reload() : undefined}
                    />
                  ))}
                  {isLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="border-t border-slate-200/70 bg-gradient-to-b from-white/40 to-white/70 px-3 py-4 dark:border-white/10 dark:from-white/5 dark:to-white/10 sm:px-6">
              <ChatInput
                onSend={handleSend}
                disabled={isLoading}
                placeholder="Ask about anything inside your documents…"
                className="mx-auto max-w-3xl"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

