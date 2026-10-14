"use client";

import { useRef, useState } from "react";

export function BlogPlayer({
  src,
  poster,
  title,
}: {
  src: string;
  poster: string;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function play() {
    setPlaying(true);
    void videoRef.current?.play().catch(() => {});
  }

  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-[18px] border border-line bg-elevated">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        poster={poster}
        playsInline
        controls={playing}
        preload="none"
        aria-label={title}
        onPlay={() => setPlaying(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      {playing ? null : (
        <button
          type="button"
          onClick={play}
          aria-label={`Play ${title}`}
          className="absolute inset-0 cursor-pointer"
        >
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas/70 px-2.5 py-1 text-[11px] font-bold tracking-wide text-ink uppercase backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta shadow-[0_0_8px_rgba(255,60,172,.8)]" />
            Play
          </span>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-canvas/70 text-lime backdrop-blur-sm">
              ▶
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
