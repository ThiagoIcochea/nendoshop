import { useEffect, useState } from "react";
import { User } from "lucide-react";

export default function AvatarWithFallback({
  src,
  alt = "Usuario",
  className = "h-10 w-10",
  fallbackClassName = ""
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const avatarSrc = typeof src === "string" ? src.trim() : "";

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-sm ${className} ${fallbackClassName}`.trim()}
    >
      {avatarSrc && !imageFailed ? (
        <img
          src={avatarSrc}
          alt={alt}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <User className="h-5 w-5 text-white" />
      )}
    </div>
  );
}
