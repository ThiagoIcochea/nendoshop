import { User } from "lucide-react";

const getAvatarSrc = (profileImg) => {
  if (!profileImg) return null;
  if (typeof profileImg === "string" && profileImg.trim()) {
    return profileImg;
  }
  return null;
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
          className="break-all text-purple-600 underline"
        >
          {part}
        </a>
      );
    }

    return (
      <span key={`${part}-${index}`} className="whitespace-pre-wrap">
        {part}
      </span>
    );
  });
};

export default function MessageBubble({ user, text, time, isOwn, profileImg, displayName }) {
  const avatarSrc = getAvatarSrc(profileImg);
  const nameLabel = displayName || user || "Usuario";

  return (
    <div
      className={`w-full px-4 py-2 flex group transition-all duration-200 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex max-w-[75%] items-end gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-indigo-500 text-white shadow-md">
          {avatarSrc ? (
            <img src={avatarSrc} alt={nameLabel} className="h-full w-full object-cover" />
          ) : (
            <User className="h-5 w-5 text-white" />
          )}
        </div>

        <div className="flex flex-col">
          <div
            className={`mb-1 flex items-center gap-2 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`text-sm font-semibold tracking-wide ${
                isOwn ? "text-purple-300" : "text-purple-700"
              }`}
            >
              {nameLabel}
            </span>

            <span className="text-[11px] text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {time}
            </span>
          </div>

          <div
            className={`
              relative break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed
              shadow-sm transition-all duration-200 transform
              group-hover:scale-[1.02] group-hover:shadow-lg
              ${
                isOwn
                  ? `
                    rounded-br-md bg-gradient-to-br from-purple-600 via-purple-500 to-fuchsia-500
                    text-white
                  `
                  : `
                    rounded-bl-md border border-purple-100 bg-white text-gray-800
                  `
              }
            `}
          >
            <div className="break-words whitespace-pre-wrap">
              {renderTextWithLinks(text)}
            </div>

            <div
              className={`
                absolute bottom-0 h-3 w-3 rotate-45
                ${
                  isOwn
                    ? "right-[-6px] bg-purple-500"
                    : "left-[-6px] border-l border-b border-purple-100 bg-white"
                }
              `}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
