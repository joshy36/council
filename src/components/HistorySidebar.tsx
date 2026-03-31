"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Vote } from "@/lib/agents";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

interface SessionSummary {
  id: string;
  query: string;
  verdict: Vote;
  tally: Record<Vote, number>;
  createdAt: string;
}

export function HistorySidebar() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const { open } = useSidebar();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => (res.ok ? res.json() : []))
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  // Refresh sessions when sidebar opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/sessions")
      .then((res) => (res.ok ? res.json() : []))
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [open]);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="px-3 py-3">
        <button
          onClick={() => router.push("/")}
          className="text-sm font-semibold text-sidebar-foreground truncate group-data-[collapsible=icon]:hidden"
        >
          The Council
        </button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Past Deliberations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sessions.length === 0 ? (
                <p className="px-2 py-4 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                  No deliberations yet.
                </p>
              ) : (
                sessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton
                      tooltip={session.query.slice(0, 80)}
                      onClick={() => router.push(`/session/${session.id}`)}
                      className="h-auto py-2"
                    >
                      <VerdictDot verdict={session.verdict} />
                      <span className="flex flex-col gap-0.5 min-w-0">
                        <span className="truncate text-xs">
                          {session.query}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {getTimeAgo(new Date(session.createdAt))}
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function VerdictDot({ verdict }: { verdict: Vote }) {
  const color = verdict === "ethical" ? "#10B981" : "#EF4444";
  return (
    <span
      className="size-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
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
