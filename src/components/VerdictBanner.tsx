import type { Vote } from "@/lib/agents";
import { CircleCheck, CircleX } from "lucide-react";

interface VerdictBannerProps {
  verdict: Vote;
  tally: Record<Vote, number>;
}

export function VerdictBanner({ verdict, tally }: VerdictBannerProps) {
  const isEthical = verdict === "ethical";
  const bg = isEthical ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)";
  const border = isEthical ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)";
  const color = isEthical ? "#10B981" : "#EF4444";

  return (
    <div
      className="flex items-center justify-center gap-4 rounded-lg border py-4 px-6 mt-2"
      style={{ backgroundColor: bg, borderColor: border }}
    >
      <span style={{ color }}>
        {isEthical ? (
          <CircleCheck className="size-6" />
        ) : (
          <CircleX className="size-6" />
        )}
      </span>
      <span
        className="text-base font-bold uppercase tracking-wider"
        style={{ color }}
      >
        {verdict}
      </span>
      <div className="flex gap-3 text-sm text-white/50">
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
