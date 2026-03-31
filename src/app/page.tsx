"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useCouncil } from "@/lib/useCouncil";
import { DEFAULT_MODEL, MODEL_OPTIONS } from "@/lib/agents";
import { QueryInput } from "@/components/QueryInput";
import { CouncilChamber } from "@/components/CouncilChamber";

export default function Home() {
  const {
    agentStates,
    phase,
    currentRound,
    verdict,
    tally,
    sessionId,
    error,
    submitQuery,
    cancel,
    reset,
  } = useCouncil();

  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const isActive = phase !== "idle" && phase !== "complete";

  const handleSubmit = (query: string) => {
    setSubmittedQuery(query);
    submitQuery(query, selectedModel);
  };

  const handleReset = () => {
    setSubmittedQuery("");
    reset();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages area */}
      {phase === "idle" ? (
        /* Empty state */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              The Council
            </h1>
            <p className="text-white/30 text-sm max-w-md">
              Five philosophical perspectives deliberate on your ethical dilemma
              through multi-round debate.
            </p>
          </div>
        </div>
      ) : (
        /* Chat thread */
        <CouncilChamber
          query={submittedQuery}
          agentStates={agentStates}
          phase={phase}
          currentRound={currentRound}
          verdict={verdict}
          tally={tally}
        />
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2">
          <div className="max-w-3xl mx-auto rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="shrink-0 border-t border-white/[0.06] bg-[#0a0a0f] px-4 py-3">
        {/* Action buttons above input when active/complete */}
        {(isActive || phase === "complete") && (
          <div className="flex justify-center gap-4 mb-2">
            {isActive && (
              <button
                onClick={cancel}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
            )}
            {phase === "complete" && (
              <>
                <button
                  onClick={handleReset}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  New query
                </button>
                {sessionId && (
                  <Link
                    href={`/session/${sessionId}`}
                    className="text-xs text-white/30 hover:text-white/60 transition-colors"
                  >
                    Permalink
                  </Link>
                )}
              </>
            )}
          </div>
        )}

        <QueryInput onSubmit={handleSubmit} disabled={isActive} />

        {/* Model selector */}
        {!isActive && phase !== "complete" && (
          <div className="flex justify-center mt-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white/40 outline-none focus:border-white/25 cursor-pointer"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#0a0a0f]">
                  {m.name} ({m.cost})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
