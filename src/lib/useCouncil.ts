"use client";

import { useState, useCallback, useRef } from "react";
import { agents } from "./agents";
import type { AgentId, Vote } from "./agents";
import type { AgentState, CouncilEvent, CouncilPhase } from "./types";

function createInitialAgentStates(): Record<AgentId, AgentState> {
  const states: Partial<Record<AgentId, AgentState>> = {};
  for (const agent of agents) {
    states[agent.id] = {
      id: agent.id,
      name: agent.name,
      philosophy: agent.philosophy,
      color: agent.color,
      icon: agent.icon,
      rounds: {},
      currentRound: 0,
      isStreaming: false,
    };
  }
  return states as Record<AgentId, AgentState>;
}

export function useCouncil() {
  const [agentStates, setAgentStates] = useState<Record<AgentId, AgentState>>(
    createInitialAgentStates
  );
  const [phase, setPhase] = useState<CouncilPhase>("idle");
  const [currentRound, setCurrentRound] = useState(0);
  const [verdict, setVerdict] = useState<Vote | null>(null);
  const [tally, setTally] = useState<Record<Vote, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setAgentStates(createInitialAgentStates());
    setPhase("idle");
    setCurrentRound(0);
    setVerdict(null);
    setTally(null);
    setError(null);
  }, []);

  const submitQuery = useCallback(async (query: string) => {
    reset();
    setPhase("deliberating");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/council", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);
          if (!jsonStr) continue;

          try {
            const event: CouncilEvent = JSON.parse(jsonStr);
            handleEvent(event);
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setPhase("idle");
    }
  }, [reset]);

  function handleEvent(event: CouncilEvent) {
    switch (event.type) {
      case "round-start":
        setCurrentRound(event.round!);
        if (event.round === 1) setPhase("deliberating");
        else setPhase("discussing");
        break;

      case "agent-start":
        setAgentStates((prev) => ({
          ...prev,
          [event.agentId!]: {
            ...prev[event.agentId!],
            isStreaming: true,
            currentRound: event.round!,
            rounds: {
              ...prev[event.agentId!].rounds,
              [event.round!]: "",
            },
          },
        }));
        break;

      case "delta":
        setAgentStates((prev) => ({
          ...prev,
          [event.agentId!]: {
            ...prev[event.agentId!],
            rounds: {
              ...prev[event.agentId!].rounds,
              [event.round!]:
                (prev[event.agentId!].rounds[event.round!] || "") +
                event.content,
            },
          },
        }));
        break;

      case "agent-done":
        setAgentStates((prev) => ({
          ...prev,
          [event.agentId!]: {
            ...prev[event.agentId!],
            isStreaming: false,
          },
        }));
        break;

      case "round-complete":
        break;

      case "vote":
        setPhase("voting");
        setAgentStates((prev) => ({
          ...prev,
          [event.agentId!]: {
            ...prev[event.agentId!],
            vote: event.vote,
            justification: event.justification,
          },
        }));
        break;

      case "council-complete":
        setPhase("complete");
        setVerdict(event.verdict!);
        setTally(event.tally!);
        break;

      case "error":
        setError(event.content || "An unknown error occurred");
        setPhase("idle");
        break;
    }
  }

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setPhase("idle");
  }, []);

  return {
    agentStates,
    phase,
    currentRound,
    verdict,
    tally,
    error,
    submitQuery,
    cancel,
    reset,
  };
}
