import type { Metadata } from "next";
import { Saira_Condensed, Space_Grotesk } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
});

const saira = Saira_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-saira",
});

export const metadata: Metadata = {
  title: "SportyTadka — We speak fluent sport",
  description:
    "A playful, motion-first studio for the brands, teams and athletes who live for the game.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${space.variable} ${saira.variable} h-full scroll-smooth antialiased [scroll-padding-top:calc(env(safe-area-inset-top)+68px)]`}
    >
      <body className="relative min-h-full overflow-x-hidden bg-canvas font-sans text-[17px] leading-[1.55] text-ink antialiased">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(45%_40%_at_8%_-5%,rgba(198,255,61,.10),transparent_60%),radial-gradient(45%_45%_at_100%_0%,rgba(255,60,172,.12),transparent_60%),radial-gradient(60%_50%_at_50%_120%,rgba(51,230,255,.08),transparent_60%)]"
        />
        {children}
      </body>
    </html>
  );
}
