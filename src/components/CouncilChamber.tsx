"use client";

import { useEffect, useRef, useCallback } from "react";
import { agents } from "@/lib/agents";
import type { AgentState } from "@/lib/types";
import type { AgentId, Vote } from "@/lib/agents";
import type { CouncilPhase } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { RoundDivider } from "./RoundDivider";
import { VoteMessage } from "./VoteMessage";
import { VerdictBanner } from "./VerdictBanner";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    userScrolledUp.current = !atBottom;
  }, []);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (!userScrolledUp.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agentStates, phase, verdict]);

  const hasRound2 = currentRound >= 2 || agents.some((a) => agentStates[a.id].rounds[2]);
  const hasVotes = agents.some((a) => agentStates[a.id].vote);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Phase indicator */}
      <PhaseIndicator phase={phase} currentRound={currentRound} />

      {/* Chat thread */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-col gap-3 mt-4 max-h-[70vh] overflow-y-auto pr-1"
      >
        {/* Round 1 */}
        <RoundDivider label="Round 1 — Individual Deliberation" />
        {agents.map((agent) => (
          <ChatMessage
            key={`r1-${agent.id}`}
            agent={agentStates[agent.id]}
            round={1}
            isActiveRound={currentRound === 1}
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
                isActiveRound={currentRound === 2}
              />
            ))}
          </>
        )}

        {/* Votes */}
        {hasVotes && (
          <>
            <RoundDivider label="Final Vote" />
            {agents.map((agent) => (
              <VoteMessage key={`vote-${agent.id}`} agent={agentStates[agent.id]} />
            ))}
          </>
        )}

        {/* Verdict */}
        {verdict && tally && <VerdictBanner verdict={verdict} tally={tally} />}
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
    <div className="flex items-center justify-center gap-2 text-sm text-white/60">
      {isActive && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
        </span>
      )}
      <span>{labels[phase]}</span>
    </div>
  );
}
