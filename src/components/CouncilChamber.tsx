"use client";

import { agents } from "@/lib/agents";
import type { AgentState } from "@/lib/types";
import type { AgentId, Vote } from "@/lib/agents";
import type { CouncilPhase } from "@/lib/types";
import { AgentCard } from "./AgentCard";

interface CouncilChamberProps {
  agentStates: Record<AgentId, AgentState>;
  phase: CouncilPhase;
  currentRound: number;
  verdict: Vote | null;
  tally: Record<Vote, number> | null;
}

export function CouncilChamber({
  agentStates,
  phase,
  currentRound,
  verdict,
  tally,
}: CouncilChamberProps) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Status bar */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <PhaseIndicator phase={phase} currentRound={currentRound} />
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agentStates[agent.id]}
            activeRound={currentRound}
          />
        ))}

        {/* Verdict card in the 6th slot */}
        {phase === "complete" && verdict && tally && (
          <VerdictCard verdict={verdict} tally={tally} />
        )}
      </div>
    </div>
  );
}

function PhaseIndicator({
  phase,
  currentRound,
}: {
  phase: CouncilPhase;
  currentRound: number;
}) {
  const labels: Record<CouncilPhase, string> = {
    idle: "The council awaits",
    deliberating: "Round 1 — Individual Deliberation",
    discussing: `Round ${currentRound} — Cross-Examination`,
    voting: "Final Vote",
    complete: "Council Has Spoken",
  };

  const isActive = phase !== "idle" && phase !== "complete";

  return (
    <div className="flex items-center gap-2 text-sm text-white/60">
      {isActive && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
        </span>
      )}
      <span>{labels[phase]}</span>
      {isActive && (
        <div className="flex gap-1 ml-2">
          {[1, 2].map((r) => (
            <span
              key={r}
              className="h-1.5 w-6 rounded-full transition-colors duration-500"
              style={{
                backgroundColor:
                  r < currentRound
                    ? "rgba(245,158,11,0.6)"
                    : r === currentRound
                      ? "rgba(245,158,11,0.3)"
                      : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VerdictCard({
  verdict,
  tally,
}: {
  verdict: Vote;
  tally: Record<Vote, number>;
}) {
  const bg =
    verdict === "ethical"
      ? "rgba(16,185,129,0.08)"
      : "rgba(239,68,68,0.08)";
  const border =
    verdict === "ethical"
      ? "rgba(16,185,129,0.3)"
      : "rgba(239,68,68,0.3)";
  const textColor =
    verdict === "ethical" ? "#10B981" : "#EF4444";

  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border p-6 text-center"
      style={{ backgroundColor: bg, borderColor: border }}
    >
      <span className="text-4xl mb-3">
        {verdict === "ethical" ? "✅" : "❌"}
      </span>
      <h3
        className="text-lg font-bold uppercase tracking-wider mb-2"
        style={{ color: textColor }}
      >
        {verdict}
      </h3>
      <div className="flex gap-4 text-sm text-white/50">
        <span>
          <span className="text-emerald-400">{tally.ethical}</span> ethical
        </span>
        <span>
          <span className="text-red-400">{tally.unethical}</span> unethical
        </span>
      </div>
    </div>
  );
}
