"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { agents } from "@/lib/agents";
import type { AgentId } from "@/lib/agents";
import type { SessionData } from "@/lib/storage";
import type { AgentState } from "@/lib/types";
import { ChatMessage } from "@/components/ChatMessage";
import { RoundDivider } from "@/components/RoundDivider";
import { VoteMessage } from "@/components/VoteMessage";
import { VerdictBanner } from "@/components/VerdictBanner";
import { UserMessage } from "@/components/UserMessage";

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

  const hasRound2 = maxRound >= 2;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Chat thread */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-4 py-4">
          {/* Timestamp */}
          <div className="text-center">
            <span className="text-xs text-white/30">
              {new Date(session.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* User query */}
          <UserMessage text={session.query} />

          {/* Round 1 */}
          <RoundDivider label="Round 1 — Individual Deliberation" />
          {agents.map((agent) => (
            <ChatMessage
              key={`r1-${agent.id}`}
              agent={agentStates[agent.id]}
              round={1}
              isActiveRound={false}
            />
          ))}

          {/* Round 2 */}
          {hasRound2 && (
            <>
              <RoundDivider label="Round 2 — Cross-Examination" />
              {agents.map((agent) => (
                <ChatMessage
                  key={`r2-${agent.id}`}
                  agent={agentStates[agent.id]}
                  round={2}
                  isActiveRound={false}
                />
              ))}
            </>
          )}

          {/* Votes */}
          {session.votes.length > 0 && (
            <>
              <RoundDivider label="Final Vote" />
              {agents.map((agent) => (
                <VoteMessage key={`vote-${agent.id}`} agent={agentStates[agent.id]} />
              ))}
            </>
          )}

          {/* Verdict */}
          {session.verdict && session.tally && (
            <VerdictBanner verdict={session.verdict} tally={session.tally} />
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="shrink-0 border-t border-white/[0.06] px-4 py-3">
        <div className="flex justify-center gap-6">
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
    </div>
  );
}
