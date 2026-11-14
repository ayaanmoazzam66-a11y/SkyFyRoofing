import { useState } from "react";
import { ShieldCheck } from "lucide-react";

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  loading?: "eager" | "lazy";
}

export function ResilientImage({
  src,
  alt,
  className = "",
  fallbackTitle,
  loading = "lazy",
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0B1F3A] via-[#152E52] to-[#0E3A5F] text-white/90 p-6 ${className}`}
      >
        <ShieldCheck className="w-10 h-10 text-[#38BDF8] mb-3" aria-hidden="true" />
        <p className="font-display text-sm font-semibold text-center text-white">
          {fallbackTitle || alt}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
