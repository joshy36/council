import { streamText, generateText, gateway } from "ai";
import {
  agents,
  type AgentConfig,
  type AgentId,
  type AgentVote,
  type Vote,
  buildDeliberationPrompt,
  buildDiscussionPrompt,
  buildVotePrompt,
} from "@/lib/agents";

export const maxDuration = 120;

interface CouncilEvent {
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
  votes?: AgentVote[];
  tally?: Record<Vote, number>;
}

function encodeSSE(event: CouncilEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: Request) {
  const { query } = (await req.json()) as { query: string };

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Query is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: CouncilEvent) => {
        controller.enqueue(encoder.encode(encodeSSE(event)));
      };

      try {
        // Track each agent's full response per round
        const roundResponses: Record<number, Record<AgentId, string>> = {};

        // === ROUND 1: Individual Deliberation ===
        await runRound({
          roundNumber: 1,
          agents,
          buildPrompt: (agent) => buildDeliberationPrompt(query),
          send,
          roundResponses,
        });

        // === ROUNDS 2-3: Cross-examination ===
        for (const roundNumber of [2, 3]) {
          const previousRound = roundResponses[roundNumber - 1];
          await runRound({
            roundNumber,
            agents,
            buildPrompt: (agent) => {
              const otherPositions = agents
                .filter((a) => a.id !== agent.id)
                .map((a) => ({
                  name: a.name,
                  philosophy: a.philosophy,
                  content: previousRound[a.id],
                }));
              return buildDiscussionPrompt(query, roundNumber, otherPositions);
            },
            send,
            roundResponses,
          });
        }

        // === FINAL VOTE ===
        const deliberationHistory = buildDeliberationHistory(roundResponses);
        const votes = await collectVotes(query, deliberationHistory, send);

        // Tally and determine verdict
        const tally: Record<Vote, number> = {
          ethical: 0,
          unethical: 0,
          nuanced: 0,
        };
        for (const v of votes) {
          tally[v.vote]++;
        }
        const verdict = (
          Object.entries(tally) as [Vote, number][]
        ).sort((a, b) => b[1] - a[1])[0][0];

        send({
          type: "council-complete",
          verdict,
          votes,
          tally,
        });

        controller.close();
      } catch (err) {
        send({
          type: "error",
          content:
            err instanceof Error ? err.message : "An unknown error occurred",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function runRound({
  roundNumber,
  agents: agentConfigs,
  buildPrompt,
  send,
  roundResponses,
}: {
  roundNumber: number;
  agents: AgentConfig[];
  buildPrompt: (agent: AgentConfig) => string;
  send: (event: CouncilEvent) => void;
  roundResponses: Record<number, Record<AgentId, string>>;
}) {
  send({ type: "round-start", round: roundNumber });
  roundResponses[roundNumber] = {} as Record<AgentId, string>;

  const agentPromises = agentConfigs.map(async (agent) => {
    send({ type: "agent-start", agentId: agent.id, round: roundNumber });

    let fullText = "";
    const result = streamText({
      model: gateway(agent.model),
      system: agent.systemPrompt,
      prompt: buildPrompt(agent),
    });

    for await (const chunk of result.textStream) {
      fullText += chunk;
      send({
        type: "delta",
        agentId: agent.id,
        round: roundNumber,
        content: chunk,
      });
    }

    roundResponses[roundNumber][agent.id] = fullText;
    send({ type: "agent-done", agentId: agent.id, round: roundNumber });
  });

  await Promise.all(agentPromises);
  send({ type: "round-complete", round: roundNumber });
}

function buildDeliberationHistory(
  roundResponses: Record<number, Record<AgentId, string>>
): string {
  const parts: string[] = [];
  for (const [round, responses] of Object.entries(roundResponses)) {
    parts.push(`=== Round ${round} ===`);
    for (const agent of agents) {
      if (responses[agent.id]) {
        parts.push(`**${agent.name}** (${agent.philosophy}):`);
        parts.push(responses[agent.id]);
        parts.push("");
      }
    }
  }
  return parts.join("\n");
}

async function collectVotes(
  query: string,
  deliberationHistory: string,
  send: (event: CouncilEvent) => void
): Promise<AgentVote[]> {
  const votePromises = agents.map(async (agent) => {
    const result = await generateText({
      model: gateway(agent.model),
      system: agent.systemPrompt,
      prompt: buildVotePrompt(query, deliberationHistory),
    });

    try {
      const parsed = JSON.parse(result.text) as {
        vote: Vote;
        justification: string;
      };
      const agentVote: AgentVote = {
        agentId: agent.id,
        vote: parsed.vote,
        justification: parsed.justification,
      };
      send({
        type: "vote",
        agentId: agent.id,
        vote: parsed.vote,
        justification: parsed.justification,
      });
      return agentVote;
    } catch {
      // Fallback if JSON parsing fails
      const agentVote: AgentVote = {
        agentId: agent.id,
        vote: "nuanced",
        justification: result.text.slice(0, 200),
      };
      send({
        type: "vote",
        agentId: agent.id,
        vote: "nuanced",
        justification: agentVote.justification,
      });
      return agentVote;
    }
  });

  return Promise.all(votePromises);
}
