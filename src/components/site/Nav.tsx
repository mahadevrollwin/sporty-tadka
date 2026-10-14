"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks, verticals } from "@/content/home";
import { LeadForm, StartProjectButton } from "./LeadForm";
import { Logo } from "./ui";

const linkClass =
  "rounded-md px-4 py-[13px] text-[15px] font-medium text-dim transition-colors hover:text-ink min-[641px]:px-3.5 min-[641px]:py-2";

export function Nav({
  links = navLinks,
  audiences = verticals,
}: {
  links?: readonly { href: string; label: string }[];
  audiences?: readonly { label: string; dot: string; hover: string }[];
} = {}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function close() {
    setOpen(false);
  }

  return (
    <nav className="sticky top-0 z-[60] border-b border-line bg-canvas/78 pt-[env(safe-area-inset-top)] backdrop-blur-[12px]">
      <div className="mx-auto flex h-16 w-full max-w-[1160px] items-center gap-2 px-[22px]">
        <Link href="/" onClick={close} aria-label="Sporty Tadka">
          <Logo />
        </Link>
        <div className="ml-auto hidden items-center gap-1 min-[641px]:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                (pathname.startsWith("/blog") && link.href === "/blog") ||
                (pathname.startsWith("/gallery") && link.href === "/gallery")
                  ? "page"
                  : undefined
              }
              className={`${linkClass} ${
                (pathname.startsWith("/blog") && link.href === "/blog") ||
                (pathname.startsWith("/gallery") && link.href === "/gallery")
                  ? "text-ink"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          <StartProjectButton className="rounded-md bg-lime px-3.5 py-2 text-[15px] font-bold text-pitch shadow-[0_0_20px_rgba(198,255,61,.35)] hover:bg-[#d4ff5c]">
            Start a project
          </StartProjectButton>
        </div>
        <button
          type="button"
          className="ml-auto h-[42px] w-[42px] cursor-pointer rounded-lg border border-line bg-transparent text-xl text-ink min-[641px]:hidden"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          ☰
        </button>
      </div>
      {open && (
        <div className="flex flex-col border-b border-line bg-panel px-2.5 py-2.5 min-[641px]:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={close} className={linkClass}>
              {link.label}
            </Link>
          ))}
          <StartProjectButton
            onOpen={close}
            className="rounded-md bg-lime px-4 py-[13px] text-left text-[15px] font-bold text-pitch"
          >
            Start a project
          </StartProjectButton>
        </div>
      )}
      <LeadForm options={audiences} />
    </nav>
  );
}
