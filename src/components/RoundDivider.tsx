interface RoundDividerProps {
  label: string;
}

export function RoundDivider({ label }: RoundDividerProps) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-white/30 font-medium tracking-wide uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}
