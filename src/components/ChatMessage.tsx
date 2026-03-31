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
    <div
      className="border-l-2 pl-4 py-3"
      style={{
        borderColor: agent.color,
        background: `linear-gradient(90deg, ${agent.color}08, transparent 40%)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1.5">
        <AgentIcon
          name={agent.icon}
          className="size-4"
          style={{ color: agent.color }}
        />
        <span className="font-semibold text-sm text-white">{agent.name}</span>
        <span className="text-xs text-white/30">{agent.philosophy}</span>
        {agent.isStreaming && isActiveRound && (
          <span
            className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: agent.color }}
          />
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
        {text}
        {agent.isStreaming && isActiveRound && (
          <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse bg-white/50 align-text-bottom" />
        )}
      </p>
    </div>
  );
}
