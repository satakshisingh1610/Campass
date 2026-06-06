"use client";

import { useState } from "react";
import Link from "next/link";
import { useCompareStore } from "@/hooks/useCompareStore";
import type { CollegeWithDetails } from "@/types";
import { cn } from "@/lib/utils";

const TABS = ["Overview", "Courses", "Placements", "Reviews"] as const;
type Tab = (typeof TABS)[number];

interface Props {
  college: CollegeWithDetails;
}

export function CollegeDetailClient({ college }: Props) {
  const [tab, setTab] = useState<Tab>("Overview");
  const { add, remove, has } = useCompareStore();
  const inCompare = has(college.id);

  return (
    <div className="page-wrapper">
      {/* Back */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-3">
        <Link href="/" className="text-sm text-muted hover:text-gold flex items-center gap-1.5 w-fit transition-colors">
          ← Back to results
        </Link>
      </div>

      {/* Hero */}
      <div
        className="py-10 px-4"
        style={{ background: college.bgGradient }}
      >
        <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border-2 border-white/20 bg-white/10 shrink-0">
            {college.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
              {college.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#C8B896]">
              <span>📍 {college.location}</span>
              <span>📅 Est. {college.established}</span>
              {college.nirfRank && (
                <span className="bg-gold/25 text-gold px-3 py-0.5 rounded-full text-xs font-semibold">
                  NIRF #{college.nirfRank}
                </span>
              )}
              <span className="bg-white/15 text-white px-3 py-0.5 rounded-full text-xs font-semibold">
                {college.type}
              </span>
            </div>
          </div>
          <button
            onClick={() => inCompare ? remove(college.id) : add(college as CollegeWithDetails)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              inCompare ? "bg-gold text-white" : "bg-white/15 text-white hover:bg-white/25 border border-white/20"
            )}
          >
            {inCompare ? "✓ In Compare" : "+ Add to Compare"}
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Annual Fees", value: college.feeDisplay },
            { label: "Avg Package", value: `₹${college.avgPackage} LPA` },
            { label: "Rating", value: `${college.rating} / 5` },
            { label: "Placement Rate", value: `${college.placementRate}%` },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 bg-cream rounded-xl border border-border">
              <div className="font-serif text-xl font-bold text-gold">{s.value}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 flex overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2",
                tab === t
                  ? "text-gold border-gold"
                  : "text-muted border-transparent hover:text-ink"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {tab === "Overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="section-title">About {college.name}</h2>
              <p className="text-[15px] text-muted leading-relaxed">{college.overview}</p>
            </div>

            <div>
              <h2 className="section-title">Key Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Type", value: `${college.type} · ${college.stream}` },
                  { label: "Location", value: college.location },
                  { label: "Established", value: String(college.established) },
                  { label: "Annual Intake", value: `${college.intake.toLocaleString("en-IN")} students` },
                  { label: "Annual Fees", value: college.feeDisplay },
                  { label: "Accreditation", value: college.accreditation || "N/A" },
                  ...(college.nirfRank ? [{ label: "NIRF Ranking", value: `#${college.nirfRank} in India` }] : []),
                  { label: "Reviews", value: `${college.reviewCount} student reviews` },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1 p-3.5 bg-cream border border-border rounded-xl">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">{item.label}</span>
                    <span className="text-sm font-semibold text-ink">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "Courses" && (
          <div>
            <h2 className="section-title">Programmes Offered</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {college.courses.map((course) => (
                <div key={course.id} className="card p-4">
                  <h4 className="text-sm font-semibold text-ink mb-1">{course.name}</h4>
                  <p className="text-xs text-muted">{course.stream} · {course.duration}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Placements" && (
          <div className="space-y-6">
            <div>
              <h2 className="section-title">Placement Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Placement Rate", value: `${college.placementRate}%` },
                  { label: "Average Package", value: `₹${college.avgPackage} LPA` },
                  { label: "Highest Package", value: `₹${college.maxPackage}${college.maxPackage > 50 ? " LPA" : " Cr/yr"}` },
                  { label: "Recruiters", value: `${college.topRecruiters.length}+ companies` },
                ].map((s) => (
                  <div key={s.label} className="p-4 bg-cream border border-border rounded-xl">
                    <div className="text-xs text-muted mb-1 uppercase tracking-wide font-semibold">{s.label}</div>
                    <div className="font-serif text-2xl font-bold text-gold">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Progress bars */}
              <div className="space-y-4">
                {[
                  { label: "Placement Rate", value: college.placementRate, max: 100 },
                  { label: "Student Satisfaction", value: Math.round((college.rating / 5) * 100), max: 100 },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted">{bar.label}</span>
                      <span className="font-semibold text-ink">{bar.value}%</span>
                    </div>
                    <div className="h-2.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full transition-all duration-1000"
                        style={{ width: `${bar.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="section-title" style={{ fontSize: "16px" }}>Top Recruiting Companies</h2>
              <div className="flex flex-wrap gap-2">
                {college.topRecruiters.map((r) => (
                  <span key={r.id} className="tag text-sm px-4 py-1.5">{r.name}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "Reviews" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title mb-0">Student Reviews</h2>
              <div className="flex items-center gap-2 bg-gold-pale px-4 py-2 rounded-xl">
                <span className="text-gold font-bold text-xl">★ {college.rating}</span>
                <span className="text-xs text-muted">{college.reviewCount} reviews</span>
              </div>
            </div>

            {college.reviews.length === 0 ? (
              <p className="text-muted text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {college.reviews.map((review) => (
                  <div key={review.id} className="card p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-semibold text-sm text-ink">
                          {review.user?.name || "Anonymous"}
                        </span>
                        {review.batch && (
                          <span className="text-xs text-muted ml-2">Batch {review.batch}</span>
                        )}
                      </div>
                      <div className="flex gap-0.5 text-gold text-sm">
                        {"★".repeat(Math.round(review.rating))}
                        <span className="text-muted/50">{"★".repeat(5 - Math.round(review.rating))}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
