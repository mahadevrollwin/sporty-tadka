"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  galleryImages,
  galleryVideos,
  type GalleryImage,
  type GalleryItem,
  type GallerySpan,
  type GalleryVideo,
} from "@/content/gallery";

type Tab = "images" | "videos";

type MasonryInstance = {
  layout?: () => void;
  destroy?: () => void;
};

function spanClass(span: GallerySpan) {
  if (span === 3) return "gallery-card gallery-card--width3";
  if (span === 2) return "gallery-card gallery-card--width2";
  return "gallery-card";
}

export function Gallery({
  images = galleryImages,
  videos = galleryVideos,
}: {
  images?: GalleryImage[];
  videos?: GalleryVideo[];
} = {}) {
  const [tab, setTab] = useState<Tab>("images");
  const [active, setActive] = useState<GalleryItem | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const items = tab === "images" ? images : videos;
  const tabs = [
    { id: "images" as const, label: "Images", count: images.length },
    { id: "videos" as const, label: "Videos", count: videos.length },
  ];

  useEffect(() => {
    if (tab !== "videos") return;
    const grid = gridRef.current;
    if (!grid) return;

    let destroyed = false;
    let msnry: MasonryInstance | null = null;

    void (async () => {
      const [masonryMod, imagesMod] = await Promise.all([
        import("masonry-layout"),
        import("imagesloaded"),
      ]);
      if (destroyed || gridRef.current !== grid) return;

      const Masonry = masonryMod.default;
      const imagesLoaded = imagesMod.default;
      const instance = new Masonry(grid, {
        itemSelector: ".gallery-card",
        columnWidth: ".gallery-sizer",
        gutter: ".gallery-gutter",
        percentPosition: true,
        stagger: 30,
      });
      msnry = instance;

      imagesLoaded(grid).on("progress", () => {
        if (!destroyed) instance.layout?.();
      });
      instance.layout?.();
      grid.classList.add("is-ready");
    })();

    return () => {
      destroyed = true;
      grid.classList.remove("is-ready");
      msnry?.destroy?.();
    };
  }, [tab, items]);

  return (
    <>
      <div
        className="mt-8 inline-flex rounded-full border border-line bg-panel p-1"
        role="tablist"
        aria-label="Gallery media type"
      >
        {tabs.map((item) => {
          const selected = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(item.id)}
              className={`cursor-pointer rounded-full px-5 py-2.5 text-[14.5px] font-semibold transition ${
                selected
                  ? "bg-lime text-pitch shadow-[0_0_18px_rgba(198,255,61,.35)]"
                  : "text-dim hover:text-ink"
              }`}
            >
              {item.label}
              <span className={`ml-2 text-[12px] ${selected ? "text-pitch/70" : "text-dimmer"}`}>
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "images" ? (
        <div key={tab} role="tabpanel" className="gallery-grid mt-8" aria-label="Image gallery">
          {images.map((item) => (
            <ImageCard
              key={item.id}
              item={item}
              feature={item.id === images.find((image) => image.span >= 2)?.id}
              onOpen={() => setActive(item)}
            />
          ))}
        </div>
      ) : (
        <div
          key={tab}
          ref={gridRef}
          role="tabpanel"
          className="gallery-masonry mt-8"
          aria-label="Video gallery"
        >
          <div className="gallery-sizer" aria-hidden />
          <div className="gallery-gutter" aria-hidden />
          {videos.map((item) => (
            <VideoCard key={item.id} item={item} onOpen={() => setActive(item)} />
          ))}
        </div>
      )}

      {active ? <Lightbox item={active} onClose={() => setActive(null)} /> : null}
    </>
  );
}

function fileName(title: string, src: string) {
  const path = src.split("?")[0] ?? "";
  const ext = path.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? "jpg";
  const base =
    title
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";
  return `${base}.${ext}`;
}

function downloadHref(src: string, filename: string) {
  if (!/^https?:\/\//i.test(src)) return src;
  try {
    const url = new URL(src);
    if (url.hostname === "cdn.sanity.io") {
      url.searchParams.set("dl", filename);
      return url.toString();
    }
  } catch {
    return src;
  }
  return src;
}

function DownloadLink({ src, title, className }: { src: string; title: string; className: string }) {
  const filename = fileName(title, src);
  return (
    <a
      href={downloadHref(src, filename)}
      download={filename}
      aria-label={`Download ${title}`}
      className={className}
      onClick={(event) => event.stopPropagation()}
    >
      <DownloadIcon />
      Download
    </a>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
      <path
        d="M7 1.5v7.2M4.2 6.4 7 9.2l2.8-2.8M2.5 11.5h9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CardMeta({ category, title }: { category: string; title: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(8,7,14,.92)_55%)] px-3.5 pt-10 pb-3.5">
      <div className="text-[11px] font-bold tracking-[0.14em] text-lime uppercase">{category}</div>
      <div className="mt-1 font-display text-[18px] leading-none font-extrabold uppercase">{title}</div>
    </div>
  );
}

function ImageCard({
  item,
  onOpen,
  feature = false,
}: {
  item: GalleryImage;
  onOpen: () => void;
  feature?: boolean;
}) {
  return (
    <div className={`${spanClass(item.span)} ${feature ? "gallery-card--feature" : ""} group relative h-full`}>
      <button
        type="button"
        onClick={onOpen}
        className="relative block h-full w-full cursor-pointer overflow-hidden rounded-[14px] border border-line bg-elevated text-left transition hover:border-lime/45 hover:shadow-[0_0_28px_rgba(198,255,61,.12)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.title}
          width={item.width}
          height={item.height}
          loading="lazy"
          className="block h-auto w-full transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <CardMeta category={item.category} title={item.title} />
      </button>
      <DownloadLink
        src={item.src}
        title={item.title}
        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas/75 px-2.5 py-1 text-[11px] font-bold tracking-wide text-ink uppercase backdrop-blur-sm transition hover:border-lime hover:text-lime"
      />
    </div>
  );
}

function VideoCard({ item, onOpen }: { item: GalleryVideo; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${spanClass(item.span)} group relative block cursor-pointer overflow-hidden rounded-[14px] border border-line bg-elevated text-left transition hover:border-magenta/45 hover:shadow-[0_0_28px_rgba(255,60,172,.14)]`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.poster}
        alt=""
        width={item.width}
        height={item.height}
        loading="lazy"
        className="block h-auto w-full transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas/70 px-2.5 py-1 text-[11px] font-bold tracking-wide text-ink uppercase backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-magenta shadow-[0_0_8px_rgba(255,60,172,.8)]" />
        Video
      </span>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-canvas/70 text-lime backdrop-blur-sm transition group-hover:scale-110">
          ▶
        </span>
      </span>
      <CardMeta category={item.category} title={item.title} />
    </button>
  );
}

function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const titleId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const wide = item.width > item.height;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (!mounted || item.type !== "video") return;
    void videoRef.current?.play().catch(() => {});
  }, [item, mounted]);

  if (!mounted || typeof document === "undefined" || !document.body) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {item.type === "image" ? (
          <DownloadLink
            src={item.src}
            title={item.title}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1.5 text-sm font-semibold text-ink hover:border-lime hover:text-lime"
          />
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-full border border-line bg-panel px-3 py-1.5 text-sm font-semibold text-ink hover:border-lime hover:text-lime"
        >
          Close
        </button>
      </div>
      <div
        className={`relative max-h-[90vh] w-full overflow-hidden rounded-[18px] border border-line bg-panel shadow-[0_0_60px_rgba(0,0,0,.45)] ${
          wide ? "max-w-[min(960px,100%)]" : "max-w-[min(480px,100%)]"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {item.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt={item.title}
            width={item.width}
            height={item.height}
            className="mx-auto max-h-[78vh] w-auto object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            className="mx-auto max-h-[78vh] w-full bg-black object-contain"
            controls
            autoPlay
            playsInline
            poster={item.poster}
          >
            <source src={item.src} type="video/mp4" />
          </video>
        )}
        <div className="border-t border-line px-5 py-4">
          <div className="text-[11px] font-bold tracking-[0.14em] text-lime uppercase">{item.category}</div>
          <h2 id={titleId} className="m-0 mt-1 font-display text-[28px] leading-none font-black uppercase">
            {item.title}
          </h2>
        </div>
      </div>
    </div>,
    document.body,
  );
}
