"use client";

import type { AgentState } from "@/lib/types";
import { AgentIcon } from "@/components/AgentIcon";

interface ChatMessageProps {
  agent: AgentState;
  round: number;
  isActiveRound: boolean;
}

export function ChatMessage({ agent, round, isActiveRound }: ChatMessageProps) {
  const text = agent.rounds[round] || "";
  if (!text) return null;

  return (
    <div className="flex items-start gap-3 max-w-[85%]">
      {/* Avatar */}
      <div
        className="shrink-0 size-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${agent.color}20` }}
      >
        <AgentIcon
          name={agent.icon}
          className="size-4"
          style={{ color: agent.color }}
        />
      </div>

      {/* Bubble */}
      <div className="min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold text-white">{agent.name}</span>
          {agent.isStreaming && isActiveRound && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: agent.color }}
            />
          )}
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] border border-white/[0.06] px-4 py-3">
          <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
            {text}
            {agent.isStreaming && isActiveRound && (
              <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse bg-white/50 align-text-bottom" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
