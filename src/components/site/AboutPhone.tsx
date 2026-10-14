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
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const count = slides.length;
  const active = count === 0 ? 0 : index % count;
  const trackSlides = count > 1 ? [...slides, slides[0]!] : slides;

  useEffect(() => {
    const playingSlot = index >= count ? count : active;
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === playingSlot) {
        if (video.paused) {
          video.currentTime = 0;
          void video.play().catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, [active, count, index]);

  useEffect(() => {
    if (paused || count < 2 || index >= count) return;
    const id = window.setInterval(() => {
      setAnimate(true);
      setIndex((current) => current + 1);
    }, 6000);
    return () => window.clearInterval(id);
  }, [paused, index, count]);

  function goTo(target: number) {
    if (count < 2) return;
    setAnimate(true);
    setIndex(target);
  }

  function onTrackTransitionEnd() {
    if (count < 2 || index < count) return;
    setAnimate(false);
    setIndex(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true));
    });
  }

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
        <div
          className="flex h-full w-full will-change-transform"
          style={{
            transform: `translate3d(-${index * 100}%, 0, 0)`,
            transition: animate ? "transform 550ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
          }}
          onTransitionEnd={onTrackTransitionEnd}
        >
          {trackSlides.map((slide, i) => {
            const sourceIndex = i % count;
            const isClone = i >= count;
            return (
              <div key={isClone ? `${slide.id}-clone` : slide.id} className="relative h-full w-full shrink-0 grow-0 basis-full">
                <video
                  ref={(el) => {
                    videoRefs.current[isClone ? count : sourceIndex] = el;
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay={sourceIndex === active}
                  preload={
                    sourceIndex === active || sourceIndex === (active + 1) % count || isClone
                      ? "auto"
                      : "metadata"
                  }
                  poster={slide.poster}
                  aria-label={`${slide.title}, ${slide.category}`}
                  aria-hidden={sourceIndex !== active}
                >
                  <source src={slide.src} type="video/mp4" />
                </video>
              </div>
            );
          })}
        </div>
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
          const selected = i === active;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`Show ${slide.title}, ${slide.category}`}
              onClick={() => goTo(i)}
              className={`w-2.5 rounded-full transition-all duration-300 ${
                selected
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
