"use client";

import { useCouncil } from "@/lib/useCouncil";
import { QueryInput } from "@/components/QueryInput";
import { CouncilChamber } from "@/components/CouncilChamber";

export default function Home() {
  const {
    agentStates,
    phase,
    currentRound,
    verdict,
    tally,
    error,
    submitQuery,
    cancel,
    reset,
  } = useCouncil();

  const isActive = phase !== "idle" && phase !== "complete";

  return (
    <div className="flex flex-col flex-1 px-4 py-8 md:py-12">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
          The Council
        </h1>
        <p className="text-white/40 text-sm max-w-lg mx-auto">
          Five philosophical perspectives deliberate on your ethical dilemma
          through multi-round debate.
        </p>
      </header>

      {/* Query input */}
      <div className="mb-8">
        <QueryInput onSubmit={submitQuery} disabled={isActive} />
        {isActive && (
          <div className="flex justify-center mt-3">
            <button
              onClick={cancel}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Cancel deliberation
            </button>
          </div>
        )}
        {phase === "complete" && (
          <div className="flex justify-center mt-3">
            <button
              onClick={reset}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              New query
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-3xl mx-auto mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Council chamber */}
      {phase !== "idle" && (
        <CouncilChamber
          agentStates={agentStates}
          phase={phase}
          currentRound={currentRound}
          verdict={verdict}
          tally={tally}
        />
      )}
    </div>
  );
}
