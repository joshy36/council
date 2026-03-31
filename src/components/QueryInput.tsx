"use client";

import { useState } from "react";

interface QueryInputProps {
  onSubmit: (query: string) => void;
  disabled: boolean;
}

export function QueryInput({ onSubmit, disabled }: QueryInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSubmit(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Present an ethical dilemma to the council..."
          disabled={disabled}
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white placeholder-white/30 outline-none transition-all focus:border-white/25 focus:bg-white/[0.07] focus:ring-1 focus:ring-white/25 disabled:opacity-50 resize-none"
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
          className="absolute right-3 bottom-3 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10"
        >
          Convene Council
        </button>
      </div>
    </form>
  );
}
