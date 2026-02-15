"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";

const navItems = [
  { href: "/swipe", label: "Swipe", icon: "\u{1F525}" },
  { href: "/explore", label: "Explore", icon: "\u{1F50D}" },
  { href: "/matches", label: "Matches", icon: "\u{1F49C}" },
  { href: "/profile", label: "Profile", icon: "\u{1F43E}" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/swipe" className="text-2xl font-black text-neon-purple" aria-label="Roarr home">
            Roarr
          </Link>
          <NotificationBell />
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border" aria-label="Main navigation">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-neon-purple"
                    : "text-foreground/40 hover:text-foreground/70"
                }`}
              >
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                <span className="text-xs mt-0.5">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-neon-purple mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
