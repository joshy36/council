"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizonal } from "lucide-react";

interface QueryInputProps {
  onSubmit: (query: string) => void;
  disabled: boolean;
}

export function QueryInput({ onSubmit, disabled }: QueryInputProps) {
  const [query, setQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 150)}px`;
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSubmit(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus-within:border-white/20 focus-within:bg-white/[0.07]">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the council an ethical dilemma..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none resize-none leading-relaxed max-h-[150px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className="shrink-0 size-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 transition-all hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:hover:bg-white/10"
        >
          <SendHorizonal className="size-4" />
        </button>
      </div>
    </form>
  );
}
