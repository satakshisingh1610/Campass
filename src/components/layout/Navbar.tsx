"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/ui/AuthModal";
import { useCompareStore } from "@/hooks/useCompareStore";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const compareCount = useCompareStore((s) => s.colleges.length);

  const navLinks = [
    { href: "/", label: "Explore", icon: "🔍" },
    { href: "/compare", label: `Compare${compareCount ? ` (${compareCount})` : ""}`, icon: "⚖️" },
    { href: "/predictor", label: "Predictor", icon: "🎯" },
  ];

  return (
    <>
      <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-ink">
            <span className="text-2xl">🎓</span>
            Cam<span className="text-gold">pass</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5",
                  pathname === link.href
                    ? "bg-gold-pale text-gold font-semibold"
                    : "text-muted hover:bg-gold-pale hover:text-gold"
                )}
              >
                {link.label}
                {link.href === "/compare" && compareCount > 0 && (
                  <span className="bg-gold text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                    {compareCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted hidden sm:block">
                  {session.user.name?.split(" ")[0]}
                </span>
                <button
                  onClick={() => signOut()}
                  className="btn-outline text-xs px-3 py-1.5"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="btn-gold text-sm px-4 py-2"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex border-t border-border">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex-1 py-2.5 text-center text-xs font-medium transition-all",
                pathname === link.href ? "text-gold bg-gold-pale" : "text-muted"
              )}
            >
              <span className="block text-base mb-0.5">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
