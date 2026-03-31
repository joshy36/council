import type { AgentId, Vote } from "./agents";

export interface CouncilEvent {
  type:
    | "round-start"
    | "agent-start"
    | "delta"
    | "agent-done"
    | "round-complete"
    | "vote"
    | "council-complete"
    | "error";
  agentId?: AgentId;
  round?: number;
  content?: string;
  vote?: Vote;
  justification?: string;
  verdict?: Vote;
  votes?: { agentId: AgentId; vote: Vote; justification: string }[];
  tally?: Record<Vote, number>;
  sessionId?: string;
}

export interface AgentState {
  id: AgentId;
  name: string;
  philosophy: string;
  color: string;
  icon: string;
  rounds: Record<number, string>;
  currentRound: number;
  isStreaming: boolean;
  vote?: Vote;
  justification?: string;
}

export type CouncilPhase =
  | "idle"
  | "deliberating"
  | "discussing"
  | "voting"
  | "complete";
