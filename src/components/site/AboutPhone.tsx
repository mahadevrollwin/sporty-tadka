"use client";

import { useEffect, useRef, useState } from "react";
import { galleryVideos } from "@/content/gallery";

const phoneVideoIds = [
  "cr7-last-dance-vertical",
  "born-from-fire-vertical",
  "forever-thalapathy-vertical",
  "john-cena-retirement",
  "born-from-fire-wide",
] as const;

function filmsFor(videos: typeof galleryVideos, ids: readonly string[]) {
  return ids.flatMap((id) => {
    const video = videos.find((item) => item.id === id);
    return video ? [video] : [];
  });
}

const defaultSlides = filmsFor(galleryVideos, phoneVideoIds);

/** Screen hole of phone-frame.png (523×1024), tucked under the gold bezel. */
const screenInset = "inset-[1.56%_2.68%_1.76%_2.68%]";

export function AboutPhone({ videos }: { videos?: { id: string; src: string; poster: string; title: string; category: string }[] } = {}) {
  const slides = videos?.length ? videos : defaultSlides;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === index) {
        video.currentTime = 0;
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [index]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [paused, index]);

  return (
    <div
      className="relative aspect-[523/1024] w-[min(100%,260px)] min-[901px]:h-0 min-[901px]:min-h-full min-[901px]:w-auto min-[901px]:max-h-full min-[901px]:justify-self-end"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        className={`absolute ${screenInset} z-0 overflow-hidden bg-transparent`}
        style={{ borderRadius: "10% / 4%" }}
        aria-live="polite"
        aria-atomic="true"
      >
        {slides.map((slide, i) =>
          i === index ? (
            <video
              key={slide.id}
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              poster={slide.poster}
              aria-label={`${slide.title}, ${slide.category}`}
            >
              <source src={slide.src} type="video/mp4" />
            </video>
          ) : null,
        )}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- decorative frame overlay */}
      <img
        src="/images/phone-frame.png?v=2"
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none object-contain"
      />

      <div
        className="absolute top-1/2 right-full z-20 mr-3 flex -translate-y-1/2 flex-col items-center gap-2.5"
        role="tablist"
        aria-label="About videos"
      >
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`Show ${slide.title}, ${slide.category}`}
              onClick={() => setIndex(i)}
              className={`w-2.5 rounded-full transition-all duration-300 ${
                active
                  ? "h-7 bg-magenta shadow-[0_0_14px_rgba(255,60,172,.7)]"
                  : "h-2.5 bg-line hover:bg-dim"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
