"use client";

import { useState, useEffect } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: input.trim() }),
      });

      if (res.ok) {
        setAuthenticated(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return null;

  if (authenticated) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
        The Council
      </h1>
      <p className="text-white/40 text-sm mb-8">Enter the passphrase</p>
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          placeholder="Passphrase"
          autoFocus
          disabled={submitting}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/25 disabled:opacity-50"
        />
        {error && (
          <p className="text-red-400 text-xs mt-2">Incorrect passphrase</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-3 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
