"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex w-full gap-4 px-4 py-3 sm:px-2 sm:py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/70 bg-white text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5 rounded-[26px] border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-white/10 dark:bg-white/10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-500"
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

