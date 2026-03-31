import { put, list, del } from "@vercel/blob";
import type { AgentId, Vote, AgentVote } from "./agents";

function fetchBlob(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    },
  });
}

export interface SessionData {
  id: string;
  query: string;
  rounds: Record<number, Record<AgentId, string>>;
  votes: AgentVote[];
  verdict: Vote;
  tally: Record<Vote, number>;
  createdAt: string;
}

export interface SessionSummary {
  id: string;
  query: string;
  verdict: Vote;
  tally: Record<Vote, number>;
  createdAt: string;
}

function sessionPath(id: string) {
  return `sessions/${id}.json`;
}

export async function saveSession(session: SessionData): Promise<string> {
  const blob = await put(sessionPath(session.id), JSON.stringify(session), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function getSession(id: string): Promise<SessionData | null> {
  const { blobs } = await list({ prefix: sessionPath(id) });
  if (blobs.length === 0) return null;

  const response = await fetchBlob(blobs[0].url);
  if (!response.ok) return null;
  return response.json();
}

export async function listSessions(): Promise<SessionSummary[]> {
  const { blobs } = await list({ prefix: "sessions/" });
  console.log("[storage] listSessions: found", blobs.length, "blobs");

  const sessions: SessionSummary[] = [];
  for (const blob of blobs) {
    try {
      console.log("[storage] Fetching blob:", blob.pathname);
      const response = await fetchBlob(blob.url);
      if (!response.ok) {
        console.error("[storage] Failed to fetch blob:", blob.pathname, response.status);
        continue;
      }
      const data: SessionData = await response.json();
      sessions.push({
        id: data.id,
        query: data.query,
        verdict: data.verdict,
        tally: data.tally,
        createdAt: data.createdAt,
      });
    } catch {
      continue;
    }
  }

  return sessions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function deleteSession(id: string): Promise<void> {
  const { blobs } = await list({ prefix: sessionPath(id) });
  for (const blob of blobs) {
    await del(blob.url);
  }
}
