interface UserMessageProps {
  text: string;
}

export function UserMessage({ text }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-600/20 border border-blue-500/20 px-4 py-3">
        <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      </div>
    </div>
  );
}
