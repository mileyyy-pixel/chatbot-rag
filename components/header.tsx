"use client";

import { Moon, Sun, Upload, Trash2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  onFileUpload: (file: File) => void;
  onClearData: () => void;
}

export function Header({ onFileUpload, onClearData }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = "";
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.1)] backdrop-blur-lg transition-colors dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_60px_rgba(15,23,42,0.45)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-white/10 dark:text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">
                Live workspace
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">AI Assistant</span>
            </div>
            <span className="hidden rounded-full border border-slate-200/70 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:border-white/15 dark:text-slate-300 sm:inline-flex">
              Beta
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Add files</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              onClick={onClearData}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
              title="Clear all uploaded documents"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

