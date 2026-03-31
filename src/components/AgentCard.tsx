"use client";

import { useState } from "react";
import type { AgentState } from "@/lib/types";
import { AgentIcon } from "@/components/AgentIcon";

interface AgentCardProps {
  agent: AgentState;
  activeRound: number;
}

export function AgentCard({ agent, activeRound }: AgentCardProps) {
  const [viewingRound, setViewingRound] = useState<number | null>(null);
  const displayRound = viewingRound ?? activeRound;
  const text = agent.rounds[displayRound] || "";
  const hasContent = Object.keys(agent.rounds).length > 0;
  const availableRounds = Object.keys(agent.rounds)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div
      className="flex flex-col rounded-xl border transition-all duration-300 overflow-hidden"
      style={{
        borderColor: hasContent
          ? `${agent.color}40`
          : "rgba(255,255,255,0.06)",
        background: hasContent
          ? `linear-gradient(135deg, ${agent.color}08, transparent)`
          : "rgba(255,255,255,0.02)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <AgentIcon name={agent.icon} className="size-5" style={{ color: agent.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white">
              {agent.name}
            </span>
            {agent.isStreaming && (
              <span
                className="inline-block h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: agent.color }}
              />
            )}
          </div>
          <span className="text-xs text-white/40">{agent.philosophy}</span>
        </div>
        {agent.vote && (
          <VoteBadge vote={agent.vote} color={agent.color} />
        )}
      </div>

      {/* Round tabs */}
      {availableRounds.length > 1 && (
        <div className="flex gap-1 px-4 pt-2">
          {availableRounds.map((r) => (
            <button
              key={r}
              onClick={() => setViewingRound(r === activeRound ? null : r)}
              className="px-2 py-0.5 text-xs rounded transition-colors"
              style={{
                backgroundColor:
                  displayRound === r ? `${agent.color}30` : "transparent",
                color: displayRound === r ? agent.color : "rgba(255,255,255,0.4)",
              }}
            >
              R{r}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-4 py-3 overflow-y-auto max-h-64">
        {text ? (
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
            {text}
            {agent.isStreaming && displayRound === activeRound && (
              <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse bg-white/50 align-text-bottom" />
            )}
          </p>
        ) : (
          <p className="text-sm text-white/20 italic">Awaiting deliberation...</p>
        )}
      </div>

      {/* Vote justification */}
      {agent.vote && agent.justification && (
        <div
          className="px-4 py-2 border-t text-xs text-white/50"
          style={{ borderColor: `${agent.color}20` }}
        >
          {agent.justification}
        </div>
      )}
    </div>
  );
}

function VoteBadge({ vote, color }: { vote: string; color: string }) {
  const bg =
    vote === "ethical"
      ? "rgba(16,185,129,0.2)"
      : "rgba(239,68,68,0.2)";
  const textColor =
    vote === "ethical" ? "#10B981" : "#EF4444";

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide"
      style={{ backgroundColor: bg, color: textColor }}
    >
      {vote}
    </span>
  );
}
