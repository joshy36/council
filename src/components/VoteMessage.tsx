import type { AgentState } from "@/lib/types";
import { AgentIcon } from "@/components/AgentIcon";

interface VoteMessageProps {
  agent: AgentState;
}

export function VoteMessage({ agent }: VoteMessageProps) {
  if (!agent.vote) return null;

  const isEthical = agent.vote === "ethical";
  const badgeBg = isEthical ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)";
  const badgeColor = isEthical ? "#10B981" : "#EF4444";

  return (
    <div className="flex items-start gap-3 py-2">
      <AgentIcon
        name={agent.icon}
        className="size-4 mt-0.5 shrink-0"
        style={{ color: agent.color }}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-white">{agent.name}</span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: badgeBg, color: badgeColor }}
        >
          {agent.vote}
        </span>
        {agent.justification && (
          <span className="text-xs text-white/40">{agent.justification}</span>
        )}
      </div>
    </div>
  );
}
