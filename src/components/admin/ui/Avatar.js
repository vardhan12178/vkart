import React, { useState, useEffect } from "react";
import { avatarInitial } from "./avatarInitial";

export default function Avatar({
  src,
  name = "",
  email = "",
  className = "h-9 w-9 rounded-xl",
  textClassName = "text-xs font-bold",
  bgClassName = "bg-gradient-to-br from-slate-800 to-slate-900 text-white",
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initial = avatarInitial(name, email);

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name || email || "User"}
        onError={() => setHasError(true)}
        referrerPolicy="no-referrer"
        className={`${className} object-cover shadow-xs`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${className} ${bgClassName} flex items-center justify-center shrink-0 shadow-xs select-none`}
    >
      <span className={textClassName}>{initial}</span>
    </div>
  );
}
