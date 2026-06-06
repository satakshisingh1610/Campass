"use client";

import { useState } from "react";
import Link from "next/link";
import type { PredictionResult } from "@/types";
import { cn } from "@/lib/utils";

const EXAMS = ["JEE Main", "JEE Advanced", "CAT", "NEET", "BITSAT", "GATE", "CLAT"];
const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];
const STREAMS = ["Any", "Computer Science", "Electronics", "Mechanical", "Civil", "Chemical", "Management", "Medical"];

const TYPE_COLORS = {
  Safe: { bg: "bg-sage-light", text: "text-sage", bar: "bg-sage" },
  Moderate: { bg: "bg-gold-pale", text: "text-gold", bar: "bg-gold" },
  Reach: { bg: "bg-rust-light", text: "text-rust", bar: "bg-rust" },
};

export function PredictorPage() {
  const [exam, setExam] = useState("");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("General");
  const [stream, setStream] = useState("Any");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ predictions: PredictionResult[]; summary: string } | null>(null);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    if (!exam || !rank) {
      setError("Please select an exam and enter your rank");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch("/api/predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam, rank: parseInt(rank), category, stream }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎯</div>
          <h1 className="font-serif text-3xl font-bold text-ink mb-2">College Predictor</h1>
          <p className="text-muted text-base">
            Enter your exam rank to discover where you stand the best chance of admission
          </p>
        </div>

        {/* Form */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                Entrance Exam <span className="text-rust">*</span>
              </label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="input-field w-full"
              >
                <option value="">Select exam...</option>
                {EXAMS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                Your Rank <span className="text-rust">*</span>
              </label>
              <input
                type="number"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. 5000"
                className="input-field w-full"
                min={1}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field w-full"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                Preferred Stream
              </label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="input-field w-full"
              >
                {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-rust-light border border-rust/20 text-rust text-sm px-4 py-2.5 rounded-xl mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handlePredict}
            disabled={loading}
            className="btn-primary w-full text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin text-lg">⟳</span>
                Analyzing your rank...
              </>
            ) : (
              <>🎯 Predict My Colleges</>
            )}
          </button>

          <p className="text-center text-xs text-muted mt-3">
            Based on historical cutoffs · Results are indicative, not guaranteed
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {(["Safe", "Moderate", "Reach"] as const).map((type) => (
            <div key={type} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium", TYPE_COLORS[type].bg, TYPE_COLORS[type].text)}>
              <span className={cn("w-2 h-2 rounded-full", TYPE_COLORS[type].bar)} />
              {type}: {type === "Safe" ? "70%+" : type === "Moderate" ? "40–70%" : "<40%"} chance
            </div>
          ))}
        </div>

        {/* Results */}
        {results && (
          <div>
            {/* Summary */}
            <div className="bg-gold-pale border border-gold/30 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">💡</span>
                <div>
                  <div className="font-semibold text-sm text-gold mb-1">AI Analysis</div>
                  <p className="text-sm text-ink leading-relaxed">{results.summary}</p>
                </div>
              </div>
            </div>

            <h2 className="font-serif text-xl font-semibold text-ink mb-4">
              Your Predictions ({results.predictions.length} colleges)
            </h2>

            <div className="space-y-3">
              {results.predictions.map((p, i) => {
                const colors = TYPE_COLORS[p.admissionType];
                return (
                  <Link
                    key={p.college.id}
                    href={`/colleges/${p.college.slug}`}
                    className="card card-hover flex items-center gap-4 p-4 block"
                  >
                    {/* Rank */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0",
                        i === 0 ? "bg-gold-pale text-gold" : i === 1 ? "bg-sage-light text-sage" : i === 2 ? "bg-rust-light text-rust" : "bg-cream text-muted"
                      )}
                    >
                      {i + 1}
                    </div>

                    {/* College logo */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: p.college.bgGradient }}
                    >
                      {p.college.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-serif font-semibold text-sm text-ink leading-snug mb-1">
                        {p.college.name}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted">
                        <span>📍 {p.college.city}</span>
                        <span>💰 {p.college.feeDisplay}</span>
                        <span>💼 ₹{p.college.avgPackage} LPA avg</span>
                        <span className={cn("font-semibold px-2 py-0.5 rounded-full", colors.bg, colors.text)}>
                          {p.admissionType}
                        </span>
                      </div>
                    </div>

                    {/* Chance */}
                    <div className="text-right shrink-0">
                      <div className={cn("font-bold text-xl", colors.text)}>{p.chance}%</div>
                      <div className="text-xs text-muted mb-1.5">chance</div>
                      <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", colors.bar)}
                          style={{ width: `${p.chance}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted mb-3">
                Want to compare these colleges side by side?
              </p>
              <Link href="/compare" className="btn-gold inline-block">
                Go to Compare →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
