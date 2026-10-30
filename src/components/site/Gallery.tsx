"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  galleryImages,
  galleryVideos,
  type GalleryImage,
  type GalleryItem,
  type GallerySpan,
  type GalleryVideo,
} from "@/content/gallery";
import {
  REACTION_OPTIONS,
  applyOptimisticState,
  displayReaction,
  emptyState,
  formatCount,
  getVoterId,
  likesTotal,
  normalizeState,
  reactionEmoji,
  readLocalCounts,
  readLocalPicks,
  writeLocalCounts,
  writeLocalPick,
  type ItemReactionState,
  type ReactionCounts,
  type ReactionType,
  type ReactionsMap,
} from "@/lib/gallery-reactions";

type Tab = "images" | "videos";

function parseGalleryTab(value: string | null): Tab {
  return value === "videos" ? "videos" : "images";
}

type MasonryInstance = {
  layout?: () => void;
  destroy?: () => void;
};

type ReactionsApi = {
  stateFor: (itemId: string) => ItemReactionState;
  countsFor: (itemId: string) => ReactionCounts;
  pickFor: (itemId: string) => ReactionType | null;
  likesFor: (itemId: string) => number;
  displayFor: (itemId: string) => ReactionType | null;
  react: (itemId: string, reaction: ReactionType) => void;
};

function spanClass(span: GallerySpan) {
  if (span === 3) return "gallery-card gallery-card--width3";
  if (span === 2) return "gallery-card gallery-card--width2";
  return "gallery-card";
}

function useGalleryReactions(): ReactionsApi {
  const [states, setStates] = useState<ReactionsMap>(() => readLocalCounts());
  const [picks, setPicks] = useState<Record<string, ReactionType>>(() => readLocalPicks());

  useEffect(() => {
    let cancelled = false;
    const voterId = getVoterId();

    void fetch("/api/gallery-reactions")
      .then((res) => (res.ok ? res.json() : null))
      .then(async (data: unknown) => {
        if (cancelled || !data || typeof data !== "object") return;
        const payload = data as { counts?: Record<string, unknown> };
        if (!payload.counts || typeof payload.counts !== "object") return;

        const next: ReactionsMap = {};
        for (const [id, value] of Object.entries(payload.counts)) {
          next[id] = normalizeState(value);
        }

        // Re-sync any local picks the server is missing so unique counts stay accurate.
        const localPicks = readLocalPicks();
        await Promise.all(
          Object.entries(localPicks).map(async ([itemId, reaction]) => {
            if (cancelled || !voterId) return;
            const serverLikes = likesTotal(next[itemId]);
            // Always upsert local pick so this person is counted once server-side.
            try {
              const res = await fetch("/api/gallery-reactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId, voterId, reaction }),
              });
              if (!res.ok) return;
              const body: unknown = await res.json();
              if (!body || typeof body !== "object") return;
              const row = body as { state?: unknown; counts?: unknown; likes?: number };
              next[itemId] = normalizeState(
                row.state ?? { counts: row.counts, likes: row.likes ?? serverLikes },
              );
            } catch {
              // Keep optimistic local state if sync fails.
            }
          }),
        );

        if (cancelled) return;
        writeLocalCounts(next);
        setStates(next);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const react = useCallback((itemId: string, reaction: ReactionType) => {
    const voterId = getVoterId();
    if (!voterId) return;

    const previous = readLocalPicks()[itemId] ?? null;
    const nextPick = previous === reaction ? null : reaction;

    writeLocalPick(itemId, nextPick);
    setPicks((prev) => {
      if (!nextPick) {
        const rest = { ...prev };
        delete rest[itemId];
        return rest;
      }
      return { ...prev, [itemId]: nextPick };
    });

    setStates((prevStates) => {
      const updated = {
        ...prevStates,
        [itemId]: applyOptimisticState(prevStates[itemId] ?? emptyState(), previous, nextPick),
      };
      writeLocalCounts(updated);
      return updated;
    });

    void fetch("/api/gallery-reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, voterId, reaction: nextPick }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        if (!data || typeof data !== "object") return;
        const payload = data as { state?: unknown; counts?: unknown; likes?: number };
        const state = normalizeState(
          payload.state ?? {
            counts: payload.counts,
            likes: payload.likes,
          },
        );
        setStates((prev) => {
          const next = { ...prev, [itemId]: state };
          writeLocalCounts(next);
          return next;
        });
      })
      .catch(() => {});
  }, []);

  return {
    stateFor: (itemId) => states[itemId] ?? emptyState(),
    countsFor: (itemId) => {
      const counts = { ...(states[itemId] ?? emptyState()).counts };
      const pick = picks[itemId];
      // Same as likesFor: the viewer's own pick counts even before the server catches up.
      if (pick && counts[pick] < 1) counts[pick] = 1;
      return counts;
    },
    pickFor: (itemId) => picks[itemId] ?? null,
    likesFor: (itemId) => {
      const likes = likesTotal(states[itemId]);
      // If this person already reacted but server count hasn't caught up yet, show at least 1.
      if (picks[itemId] && likes < 1) return 1;
      return likes;
    },
    displayFor: (itemId) => displayReaction(states[itemId]?.counts, picks[itemId] ?? null),
    react,
  };
}

export function Gallery({
  images = galleryImages,
  videos = galleryVideos,
}: {
  images?: GalleryImage[];
  videos?: GalleryVideo[];
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = parseGalleryTab(searchParams.get("tab"));
  const [active, setActive] = useState<GalleryItem | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const reactions = useGalleryReactions();
  const items = tab === "images" ? images : videos;
  const tabs = [
    { id: "images" as const, label: "Images", count: images.length },
    { id: "videos" as const, label: "Videos", count: videos.length },
  ];

  const setTab = useCallback(
    (next: Tab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

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
              reactions={reactions}
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

      {active ? (
        <Lightbox item={active} onClose={() => setActive(null)} reactions={reactions} />
      ) : null}
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

function ReactionButtons({
  selected,
  onReact,
}: {
  selected: ReactionType | null;
  onReact: (reaction: ReactionType) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-line bg-canvas/80 px-1.5 py-1 shadow-[0_8px_24px_rgba(0,0,0,.35)] backdrop-blur-md sm:gap-1"
      role="group"
      aria-label="Reactions"
    >
      {REACTION_OPTIONS.map((option) => {
        const active = selected === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-label={option.label}
            aria-pressed={active}
            title={option.label}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onReact(option.id);
            }}
            className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[21px] leading-none transition hover:scale-110 hover:bg-elevated/80 sm:h-10 sm:w-10 sm:text-[24px] ${
              active ? "bg-elevated scale-110 ring-1 ring-lime/50" : ""
            }`}
          >
            <span aria-hidden="true">{option.emoji}</span>
          </button>
        );
      })}
    </div>
  );
}

function ReactionBar({
  selected,
  onReact,
  visible,
  positionClass = "bottom-3",
}: {
  selected: ReactionType | null;
  onReact: (reaction: ReactionType) => void;
  visible: boolean;
  positionClass?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-[5] flex justify-center px-3 transition duration-200 ${positionClass} ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className={visible ? "pointer-events-auto" : "pointer-events-none"}>
        <ReactionButtons selected={selected} onReact={onReact} />
      </div>
    </div>
  );
}

function ReactionSummary({
  likes,
  counts,
  reaction,
  className,
  openUp = false,
}: {
  likes: number;
  counts: ReactionCounts;
  reaction?: ReactionType | null;
  className: string;
  openUp?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const breakdownId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (likes <= 0) return null;
  const used = REACTION_OPTIONS.filter((option) => counts[option.id] > 0);

  return (
    <div ref={rootRef} className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={breakdownId}
        title="See reactions"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border bg-canvas/75 px-3 py-1 text-[13px] font-bold tracking-wide text-ink backdrop-blur-sm transition hover:border-lime ${
          open ? "border-lime" : "border-line"
        }`}
      >
        <span aria-hidden="true" className="text-[20px] leading-none">
          {reactionEmoji(reaction)}
        </span>
        <span>{formatCount(likes)}</span>
        <span className="sr-only">{likes === 1 ? "reaction" : "reactions"}, show breakdown</span>
      </button>
      {open ? (
        <ul
          id={breakdownId}
          className={`absolute left-0 z-20 m-0 min-w-[170px] ${openUp ? "bottom-full mb-2" : "top-full mt-2"} list-none rounded-xl border border-line bg-panel/95 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,.45)] backdrop-blur-md`}
          onClick={(event) => event.stopPropagation()}
        >
          {used.map((option) => (
            <li key={option.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
              <span aria-hidden="true" className="text-[22px] leading-none">
                {option.emoji}
              </span>
              <span className="flex-1 text-[13px] font-semibold whitespace-nowrap text-soft">{option.label}</span>
              <span className="text-[14px] font-bold text-ink">{formatCount(counts[option.id])}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ImageCard({
  item,
  onOpen,
  feature = false,
  reactions,
}: {
  item: GalleryImage;
  onOpen: () => void;
  feature?: boolean;
  reactions: ReactionsApi;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`${spanClass(item.span)} ${feature ? "gallery-card--feature" : ""} group relative h-full`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-full overflow-hidden rounded-[14px] border border-line bg-elevated transition hover:border-lime/45 hover:shadow-[0_0_28px_rgba(198,255,61,.12)]">
        <button
          type="button"
          onClick={onOpen}
          className="relative block h-full w-full cursor-pointer text-left"
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
        <ReactionBar
          visible={hovered}
          selected={reactions.pickFor(item.id)}
          onReact={(reaction) => reactions.react(item.id, reaction)}
          positionClass="bottom-[4.5rem]"
        />
      </div>
      <ReactionSummary
        likes={reactions.likesFor(item.id)}
        counts={reactions.countsFor(item.id)}
        reaction={reactions.displayFor(item.id)}
        className="absolute top-3 left-3 z-10"
      />
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

function Lightbox({
  item,
  onClose,
  reactions,
}: {
  item: GalleryItem;
  onClose: () => void;
  reactions: ReactionsApi;
}) {
  const titleId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const wide = item.width > item.height;
  const likes = reactions.likesFor(item.id);

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
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 id={titleId} className="m-0 font-display text-[28px] leading-none font-black uppercase">
              {item.title}
            </h2>
            {item.type === "video" ? (
              <div className="flex flex-wrap items-center gap-2">
                <ReactionSummary
                  likes={likes}
                  counts={reactions.countsFor(item.id)}
                  reaction={reactions.displayFor(item.id)}
                  className="relative"
                  openUp
                />
                <ReactionButtons
                  selected={reactions.pickFor(item.id)}
                  onReact={(reaction) => reactions.react(item.id, reaction)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
