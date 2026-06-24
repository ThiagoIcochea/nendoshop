const getAvatarSrc = (profileImg, fallbackName) => {
  if (!profileImg) return null;
  if (typeof profileImg === "string" && profileImg.trim()) {
    return profileImg;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || "Usuario")}&background=7c3aed&color=ffffff`;
};

const renderTextWithLinks = (text) => {
  if (!text) return null;
  const parts = String(text).split(/(https?:\/\/\S+)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 underline break-all"
        >
          {part}
        </a>
      );
    }

    return <span key={`${part}-${index}`} className="whitespace-pre-wrap">{part}</span>;
  });
};

export default function MessageBubble({ user, text, time, isOwn, profileImg, displayName }) {
  const initials = (displayName || user || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarSrc = getAvatarSrc(profileImg, displayName || user || "Usuario");

  return (
    <div
      className={`w-full px-4 py-2 flex group transition-all duration-200 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div className={`flex gap-3 max-w-[75%] items-end`}>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-md shrink-0 overflow-hidden">
          {avatarSrc ? (
            <img src={avatarSrc} alt={displayName || user} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>

        <div className="flex flex-col">

          <div
            className={`flex items-center gap-2 mb-1 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`text-sm font-semibold tracking-wide ${
                isOwn ? "text-purple-300" : "text-purple-700"
              }`}
            >
              {displayName || (isOwn ? "Tú" : user)}
            </span>

            <span className="text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {time}
            </span>
          </div>

          {/* Bubble */}
          <div
            className={`
              relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
              shadow-sm transition-all duration-200 transform
              group-hover:scale-[1.02] group-hover:shadow-lg

              ${isOwn
                ? `
                  bg-gradient-to-br from-purple-600 via-purple-500 to-fuchsia-500
                  text-white rounded-br-md
                `
                : `
                  bg-white text-gray-800 border border-purple-100
                  rounded-bl-md
                `
              }
            `}
          >
            <div className="whitespace-pre-wrap break-words">
              {renderTextWithLinks(text)}
            </div>

            {/* “Tail” tipo chat bubble */}
            <div
              className={`
                absolute bottom-0 w-3 h-3 rotate-45
                ${isOwn
                  ? "right-[-6px] bg-purple-500"
                  : "left-[-6px] bg-white border-l border-b border-purple-100"
                }
              `}
            />
          </div>

        </div>
      </div>
    </div>
  );
}