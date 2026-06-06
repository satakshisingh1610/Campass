"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useCompareStore } from "@/hooks/useCompareStore";
import type { CollegeWithTags } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  college: CollegeWithTags;
}

export function CollegeCard({ college }: Props) {
  const { data: session } = useSession();
  const { add, remove, has } = useCompareStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const inCompare = has(college.id);

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCompare) {
      remove(college.id);
    } else {
      const ok = add(college);
      if (!ok) alert("You can compare up to 3 colleges at a time");
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) return;
    setSaving(true);
    try {
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId: college.id }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link href={`/colleges/${college.slug}`} className="block">
      <div className={cn("card card-hover h-full flex flex-col", inCompare && "border-gold shadow-card")}>
        {/* Banner */}
        <div
          className="h-24 flex items-center justify-center relative overflow-hidden rounded-t-2xl"
          style={{ background: college.bgGradient }}
        >
          <span className="text-4xl">{college.emoji}</span>

          {/* Compare btn */}
          <button
            onClick={handleCompare}
            className={cn(
              "absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full transition-all flex items-center gap-1",
              inCompare
                ? "bg-gold text-white"
                : "bg-white/90 text-muted hover:bg-gold-pale hover:text-gold"
            )}
          >
            {inCompare ? "✓ Added" : "+ Compare"}
          </button>

          {/* NIRF badge */}
          {college.nirfRank && college.nirfRank <= 20 && (
            <div className="absolute top-2 left-2 bg-gold/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              NIRF #{college.nirfRank}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-1 text-xs text-muted">
            <span>📍</span>
            <span className="truncate">{college.location}</span>
          </div>

          <h3 className="font-serif font-semibold text-base text-ink leading-snug line-clamp-2">
            {college.name}
          </h3>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 text-muted">
              <span>💰</span>
              <strong className="text-ink">{college.feeDisplay}</strong>
            </span>
            <span className="flex items-center gap-1 text-muted">
              <span>💼</span>
              <strong className="text-ink">₹{college.avgPackage}L avg</strong>
            </span>
            <span
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold",
                college.rating >= 4.5
                  ? "bg-sage-light text-sage"
                  : "bg-gold-pale text-gold"
              )}
            >
              ★ {college.rating}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-1">
            {college.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="tag">{tag.label}</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-muted">{college.type} · {college.stream}</span>
          {session && (
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="text-xs text-muted hover:text-gold transition-colors"
            >
              {saved ? "✓ Saved" : saving ? "..." : "🔖 Save"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
