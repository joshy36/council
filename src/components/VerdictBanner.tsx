import type { Vote } from "@/lib/agents";
import { CircleCheck, CircleX } from "lucide-react";

interface VerdictBannerProps {
  verdict: Vote;
  tally: Record<Vote, number>;
}

export function VerdictBanner({ verdict, tally }: VerdictBannerProps) {
  const isEthical = verdict === "ethical";
  const bg = isEthical ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)";
  const border = isEthical ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)";
  const color = isEthical ? "#10B981" : "#EF4444";

  return (
    <div className="flex justify-center my-2">
      <div
        className="inline-flex items-center gap-3 rounded-full border px-5 py-2.5"
        style={{ backgroundColor: bg, borderColor: border }}
      >
        <span style={{ color }}>
          {isEthical ? (
            <CircleCheck className="size-5" />
          ) : (
            <CircleX className="size-5" />
          )}
        </span>
        <span
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {verdict}
        </span>
        <span className="text-xs text-white/40">
          <span className="text-emerald-400">{tally.ethical}</span>
          {" – "}
          <span className="text-red-400">{tally.unethical}</span>
        </span>
      </div>
    </div>
  );
}
