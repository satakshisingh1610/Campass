"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCompareStore } from "@/hooks/useCompareStore";
import type { CollegeWithTags } from "@/types";
import { cn } from "@/lib/utils";

const COMPARE_ROWS = [
  { label: "Location", icon: "📍", key: "location", best: null },
  { label: "Annual Fees", icon: "💰", key: "feeDisplay", numKey: "annualFees", best: "min" as const },
  { label: "Rating", icon: "⭐", key: "rating", best: "max" as const, suffix: " / 5" },
  { label: "Avg Package", icon: "💼", key: "avgPackage", best: "max" as const, suffix: " LPA" },
  { label: "Placement Rate", icon: "📊", key: "placementRate", best: "max" as const, suffix: "%" },
  { label: "NIRF Rank", icon: "🏆", key: "nirfRank", best: "min" as const, prefix: "#" },
  { label: "Established", icon: "📅", key: "established", best: null },
  { label: "Annual Intake", icon: "👥", key: "intake", best: "max" as const },
  { label: "Type", icon: "🏛️", key: "type", best: null },
  { label: "Stream", icon: "📚", key: "stream", best: null },
];

function getBestIdx(
  colleges: CollegeWithTags[],
  row: (typeof COMPARE_ROWS)[number]
): number {
  if (!row.best || colleges.length < 2) return -1;
  const numKey = "numKey" in row && row.numKey ? row.numKey : row.key;
  const vals = colleges.map((c) => Number((c as Record<string, unknown>)[numKey] ?? 0));
  if (row.best === "max") return vals.indexOf(Math.max(...vals));
  if (row.best === "min") return vals.indexOf(Math.min(...vals.filter((v) => v > 0)));
  return -1;
}

function CellValue({
  college,
  row,
  isBest,
}: {
  college: CollegeWithTags;
  row: (typeof COMPARE_ROWS)[number];
  isBest: boolean;
}) {
  const raw = (college as Record<string, unknown>)[row.key];
  const prefix = "prefix" in row ? row.prefix ?? "" : "";
  const suffix = "suffix" in row ? row.suffix ?? "" : "";
  const display = raw != null ? `${prefix}${raw}${suffix}` : "—";

  return (
    <div
      className={cn(
        "border-b border-l border-border p-4 flex flex-col items-center justify-center text-center text-sm min-h-[56px]",
        isBest ? "bg-sage-light" : "bg-white"
      )}
    >
      <span className={cn("font-semibold", isBest ? "text-sage" : "text-ink")}>{display}</span>
      {isBest && (
        <span className="mt-1 text-[10px] font-bold text-sage bg-sage/10 px-2 py-0.5 rounded-full">
          Best
        </span>
      )}
    </div>
  );
}

export function ComparePage() {
  const { colleges, remove, clear } = useCompareStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const colCount = colleges.length;
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `200px repeat(${Math.max(colCount, 1)}, 1fr)`,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-ink mb-2">Compare Colleges</h1>
          <p className="text-muted text-base">Side-by-side comparison to help you make the right choice</p>
        </div>

        {colCount === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⚖️</div>
            <h2 className="font-serif text-xl font-semibold mb-3">No colleges added yet</h2>
            <p className="text-muted text-sm mb-6">Browse colleges and click "+ Compare" to add them here</p>
            <Link href="/" className="btn-gold inline-block">Browse Colleges</Link>
          </div>
        ) : (
          <>
            {/* Action bar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted">
                Comparing <strong className="text-ink">{colCount}</strong> college{colCount > 1 ? "s" : ""}
                {colCount < 3 && (
                  <Link href="/" className="text-gold ml-2 hover:underline">+ Add more</Link>
                )}
              </p>
              <button onClick={clear} className="text-xs text-rust hover:underline">Clear all</button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-border shadow-card">
              <div style={gridStyle} className="min-w-[580px]">
                {/* Column headers */}
                <div className="bg-cream border-b border-border p-4 flex items-end">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Metric</span>
                </div>
                {colleges.map((college) => (
                  <div
                    key={college.id}
                    className="border-b border-l border-border p-4 flex flex-col items-center text-center bg-cream relative"
                  >
                    <button
                      onClick={() => remove(college.id)}
                      className="absolute top-2 right-2 text-muted hover:text-rust text-lg leading-none w-6 h-6 flex items-center justify-center"
                      title="Remove"
                    >
                      ×
                    </button>
                    <span className="text-3xl mb-2">{college.emoji}</span>
                    <h3 className="font-serif text-sm font-semibold text-ink leading-snug mb-1 pr-4">
                      {college.name}
                    </h3>
                    <p className="text-xs text-muted">{college.city}</p>
                    <div className="mt-2">
                      <span className="tag text-[10px]">{college.type}</span>
                    </div>
                  </div>
                ))}

                {/* Data rows */}
                {COMPARE_ROWS.map((row) => {
                  const bestIdx = getBestIdx(colleges, row);
                  return (
                    <>
                      <div
                        key={`label-${row.key}`}
                        className="border-b border-border p-4 flex items-center gap-2 bg-[#FDFAF4]"
                      >
                        <span className="text-sm">{row.icon}</span>
                        <span className="text-xs font-semibold text-muted">{row.label}</span>
                      </div>
                      {colleges.map((college, ci) => (
                        <CellValue
                          key={`${row.key}-${college.id}`}
                          college={college}
                          row={row}
                          isBest={bestIdx === ci}
                        />
                      ))}
                    </>
                  );
                })}
              </div>
            </div>

            {/* View detail links */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted mb-3">Want detailed info on any college?</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {colleges.map((c) => (
                  <Link key={c.id} href={`/colleges/${c.slug}`} className="btn-outline text-sm">
                    View {c.name.split(" ").slice(0, 2).join(" ")} →
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
