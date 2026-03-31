import type { AgentState } from "@/lib/types";
import { AgentIcon } from "@/components/AgentIcon";

interface VoteMessageProps {
  agent: AgentState;
}

export function VoteMessage({ agent }: VoteMessageProps) {
  if (!agent.vote) return null;

  const isEthical = agent.vote === "ethical";
  const badgeBg = isEthical ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)";
  const badgeColor = isEthical ? "#10B981" : "#EF4444";

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
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] border border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-white/60">votes</span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{ backgroundColor: badgeBg, color: badgeColor }}
            >
              {agent.vote}
            </span>
          </div>
          {agent.justification && (
            <p className="text-sm text-white/50 mt-1.5">{agent.justification}</p>
          )}
        </div>
      </div>
    </div>
  );
}
