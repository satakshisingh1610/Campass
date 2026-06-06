"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      const params = new URLSearchParams({ search: query.trim() });
      router.push(`/?${params.toString()}`);
    }
  };

  return (
    <section
      className="relative overflow-hidden py-16 px-4 text-center"
      style={{
        background: "linear-gradient(135deg, #1A1208 0%, #2D1F0A 50%, #3D2B10 100%)",
      }}
    >
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C8963E' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 text-[#C8B896] text-xs font-medium px-4 py-2 rounded-full mb-6 border border-white/10">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          500+ colleges · Real data · Updated 2025
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
          Find Your{" "}
          <span className="text-gold">Perfect</span>
          <br />
          College
        </h1>

        <p className="text-[#C8B896] text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Search, compare, and predict admissions across IITs, NITs, IIMs and
          top private colleges — all in one place.
        </p>

        {/* Search bar */}
        <div className="bg-white rounded-2xl p-2 flex items-center gap-2 max-w-xl mx-auto shadow-2xl">
          <span className="text-muted pl-2 text-lg">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by college, city, or stream..."
            className="flex-1 bg-transparent outline-none text-ink placeholder:text-muted/50 text-sm font-sans"
          />
          <button onClick={handleSearch} className="btn-gold text-sm px-5 py-2.5 shrink-0">
            Search
          </button>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          {["IIT Bombay", "AIIMS Delhi", "IIM Ahmedabad", "NIT Trichy", "BITS Pilani"].map((name) => (
            <button
              key={name}
              onClick={() => setQuery(name)}
              className="text-xs text-[#C8B896] hover:text-white border border-white/15 hover:border-white/30 px-3 py-1.5 rounded-full transition-all"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative max-w-3xl mx-auto mt-12 grid grid-cols-3 gap-4">
        {[
          { num: "500+", label: "Colleges Listed" },
          { num: "₹24L", label: "Top Avg Package" },
          { num: "100%", label: "Free to Use" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-serif text-2xl font-bold text-gold">{stat.num}</div>
            <div className="text-[#C8B896] text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
