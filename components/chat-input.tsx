"use client";

import { useState, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Type your message...", className }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="group flex items-end gap-3 rounded-[26px] border border-slate-200 bg-white/95 px-4 py-4 shadow-sm transition-all focus-within:border-slate-900 focus-within:shadow-lg dark:border-slate-700 dark:bg-slate-900/85 dark:focus-within:border-white/70 sm:px-6 sm:py-5">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "max-h-32 min-h-[52px] w-full resize-none bg-transparent text-[15px] leading-relaxed text-[var(--chat-input-fg)] placeholder:text-[var(--chat-input-placeholder)] caret-[var(--chat-input-fg)] transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          )}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={cn(
            "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none dark:border-white/70 dark:bg-white dark:text-slate-900"
          )}
        >
          {disabled ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
      <p className="mt-3 text-center text-[11px] font-medium uppercase tracking-[0.26em] text-slate-400 dark:text-slate-500">
        Press Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
}

