export default function TypingIndicator({ typingUser }) {
  if (!typingUser) return null;

  return (
    <div className="px-5 py-2 animate-fadeIn">
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-purple-100 shadow-sm">

        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-[10px] font-bold">
          {typingUser?.[0]?.toUpperCase()}
        </div>

        {/* dots */}
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:120ms]"></span>
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:240ms]"></span>
        </div>

        <span className="text-xs text-purple-700 font-medium">
          {typingUser} está escribiendo...
        </span>

      </div>
    </div>
  );
}