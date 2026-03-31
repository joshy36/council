import Link from "next/link";
import type { Vote } from "@/lib/agents";
import { listSessions, type SessionSummary } from "@/lib/storage";

export default async function HistoryPage() {
  let sessions: SessionSummary[] = [];
  try {
    console.log("[history] Fetching sessions...");
    sessions = await listSessions();
    console.log("[history] Found", sessions.length, "sessions");
  } catch (err) {
    console.error("[history] Failed to list sessions:", err);
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-8 md:py-12">
      <header className="text-center mb-8">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            The Council
          </h1>
        </Link>
        <p className="text-white/40 text-sm">Past deliberations</p>
      </header>

      <div className="w-full max-w-3xl mx-auto">
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm mb-4">
              No deliberations yet.
            </p>
            <Link
              href="/"
              className="text-sm text-white/50 hover:text-white/80 transition-colors underline underline-offset-4"
            >
              Convene the council
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: SessionSummary }) {
  const verdictColor =
    session.verdict === "ethical" ? "#10B981" : "#EF4444";

  const date = new Date(session.createdAt);
  const timeAgo = getTimeAgo(date);

  return (
    <Link href={`/session/${session.id}`}>
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 hover:bg-white/[0.05] hover:border-white/15 transition-all">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-white/70 line-clamp-2 flex-1">
            {session.query}
          </p>
          <span
            className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide"
            style={{
              backgroundColor: `${verdictColor}20`,
              color: verdictColor,
            }}
          >
            {session.verdict}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
          <span>{timeAgo}</span>
          <span>
            {session.tally.ethical}E / {session.tally.unethical}U
          </span>
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
