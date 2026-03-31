"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { agents } from "@/lib/agents";
import type { AgentId, Vote } from "@/lib/agents";
import type { SessionData } from "@/lib/storage";
import { AgentCard } from "@/components/AgentCard";
import type { AgentState } from "@/lib/types";

export default function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Session not found");
        return res.json();
      })
      .then(setSession)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <p className="text-white/30 text-sm">Loading deliberation...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-4">
        <p className="text-white/40 text-sm">
          {error || "Session not found"}
        </p>
        <Link
          href="/history"
          className="text-sm text-white/50 hover:text-white/80 transition-colors underline underline-offset-4"
        >
          Back to history
        </Link>
      </div>
    );
  }

  const maxRound = Math.max(...Object.keys(session.rounds).map(Number));

  // Build AgentState objects from session data
  const agentStates: Record<AgentId, AgentState> = {} as Record<
    AgentId,
    AgentState
  >;
  for (const agent of agents) {
    const vote = session.votes.find((v) => v.agentId === agent.id);
    const rounds: Record<number, string> = {};
    for (const [round, responses] of Object.entries(session.rounds)) {
      if (responses[agent.id]) {
        rounds[Number(round)] = responses[agent.id];
      }
    }
    agentStates[agent.id] = {
      id: agent.id,
      name: agent.name,
      philosophy: agent.philosophy,
      color: agent.color,
      icon: agent.icon,
      rounds,
      currentRound: maxRound,
      isStreaming: false,
      vote: vote?.vote,
      justification: vote?.justification,
    };
  }

  const verdictColor =
    session.verdict === "ethical" ? "#10B981" : "#EF4444";

  const verdictBg =
    session.verdict === "ethical"
      ? "rgba(16,185,129,0.08)"
      : "rgba(239,68,68,0.08)";

  const verdictBorder =
    session.verdict === "ethical"
      ? "rgba(16,185,129,0.3)"
      : "rgba(239,68,68,0.3)";

  return (
    <div className="flex flex-col flex-1 px-4 py-8 md:py-12">
      <header className="text-center mb-8">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            The Council
          </h1>
        </Link>
        <p className="text-white/40 text-sm max-w-lg mx-auto">
          {new Date(session.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </header>

      {/* Query */}
      <div className="w-full max-w-3xl mx-auto mb-6">
        <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
          <p className="text-base text-white/70">{session.query}</p>
        </div>
      </div>

      {/* Verdict summary */}
      <div className="w-full max-w-3xl mx-auto mb-8">
        <div
          className="flex items-center justify-center gap-4 rounded-xl border p-4"
          style={{ backgroundColor: verdictBg, borderColor: verdictBorder }}
        >
          <span className="text-2xl">
            {session.verdict === "ethical" ? "✅" : "❌"}
          </span>
          <span
            className="text-lg font-bold uppercase tracking-wider"
            style={{ color: verdictColor }}
          >
            {session.verdict}
          </span>
          <div className="flex gap-3 text-sm text-white/50">
            <span>
              <span className="text-emerald-400">{session.tally.ethical}</span>{" "}
              ethical
            </span>
            <span>
              <span className="text-red-400">{session.tally.unethical}</span>{" "}
              unethical
            </span>
          </div>
        </div>
      </div>

      {/* Agent grid */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agentStates[agent.id]}
              activeRound={maxRound}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-6 mt-8">
        <Link
          href="/history"
          className="text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          All deliberations
        </Link>
        <Link
          href="/"
          className="text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          New query
        </Link>
      </div>
    </div>
  );
}
