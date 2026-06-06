"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CollegeCard } from "./CollegeCard";
import type {
  CollegeFilters,
  PaginatedColleges,
  CollegeWithTags,
} from "@/types";
import { cn } from "@/lib/utils";

const TYPE_FILTERS = [
  "All",
  "IIT",
  "NIT",
  "PRIVATE",
  "DEEMED",
  "CENTRAL",
];

const STREAM_OPTIONS = [
  "All",
  "Engineering",
  "Management",
  "Medical",
  "Law",
  "Design",
];

const FEE_OPTIONS = [
  { value: "All", label: "Any Fees" },
  { value: "low", label: "Under ₹2L/yr" },
  { value: "mid", label: "₹2L–₹8L/yr" },
  { value: "high", label: "Above ₹8L/yr" },
];

const SORT_OPTIONS = [
  { value: "rating", label: "Best Rated" },
  { value: "nirf", label: "NIRF Rank" },
  { value: "placement", label: "Top Placement" },
  { value: "fees_asc", label: "Fees: Low–High" },
  { value: "fees_desc", label: "Fees: High–Low" },
];

export function CollegeListingSection() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<CollegeFilters>({
    search: searchParams.get("search") || "",
    type: "All",
    stream: "All",
    fees: "All",
    sortBy: "rating",
    page: 1,
  });

  const [colleges, setColleges] = useState<CollegeWithTags[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchColleges = useCallback(
    async (f: CollegeFilters, append = false) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        search: f.search,
        type: f.type,
        stream: f.stream,
        fees: f.fees,
        sortBy: f.sortBy,
        page: String(f.page),
        limit: "12",
      });

      try {
        const res = await fetch(`/api/colleges?${params}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch colleges (${res.status})`);
        }

        const data: Partial<PaginatedColleges> = await res.json();

        const collegesData = Array.isArray(data?.colleges)
          ? data.colleges
          : [];

        setColleges((prev) =>
          append ? [...prev, ...collegesData] : collegesData
        );

        setPagination({
          total: data?.pagination?.total ?? 0,
          pages: data?.pagination?.pages ?? 1,
        });
      } catch (error) {
        console.error("COLLEGE FETCH ERROR:", error);

        if (!append) {
          setColleges([]);
        }

        setPagination({
          total: 0,
          pages: 1,
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    const updatedFilters = {
      ...filters,
      page: 1,
    };

    fetchColleges(updatedFilters);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.type,
    filters.stream,
    filters.fees,
    filters.sortBy,
  ]);

  useEffect(() => {
    const search = searchParams.get("search") || "";

    if (search !== filters.search) {
      setFilters((prev) => ({
        ...prev,
        search,
      }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateFilter = (
    key: keyof CollegeFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const loadMore = () => {
    const nextPage = filters.page + 1;

    const newFilters = {
      ...filters,
      page: nextPage,
    };

    setFilters(newFilters);
    fetchColleges(newFilters, true);
  };

  const hasMore = filters.page < pagination.pages;

  return (
    <section>
      {/* Filters */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2 sticky top-16 z-40">
        <span className="text-xs font-semibold text-muted uppercase tracking-wide mr-1">
          Type:
        </span>

        {TYPE_FILTERS.map((type) => (
          <button
            key={type}
            onClick={() => updateFilter("type", type)}
            className={cn(
              "filter-chip text-xs px-3 py-1.5",
              filters.type === type && "filter-chip-active"
            )}
          >
            {type}
          </button>
        ))}

        <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

        <select
          value={filters.stream}
          onChange={(e) => updateFilter("stream", e.target.value)}
          className="border border-border bg-white text-muted text-xs px-3 py-1.5 rounded-full"
        >
          {STREAM_OPTIONS.map((stream) => (
            <option key={stream} value={stream}>
              {stream === "All" ? "All Streams" : stream}
            </option>
          ))}
        </select>

        <select
          value={filters.fees}
          onChange={(e) => updateFilter("fees", e.target.value)}
          className="border border-border bg-white text-muted text-xs px-3 py-1.5 rounded-full"
        >
          {FEE_OPTIONS.map((fee) => (
            <option key={fee.value} value={fee.value}>
              {fee.label}
            </option>
          ))}
        </select>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <p className="text-sm text-muted">
          {loading
            ? "Loading..."
            : `${pagination.total} college${
                pagination.total !== 1 ? "s" : ""
              } found`}
        </p>

        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter("sortBy", e.target.value)}
          className="border border-border bg-white text-sm px-3 py-1.5 rounded-xl"
        >
          {SORT_OPTIONS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="card h-64 animate-pulse bg-[#F5EDD8]"
              />
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>

            <h3 className="font-serif text-xl font-semibold mb-2">
              No colleges found
            </h3>

            <p className="text-muted text-sm">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {colleges.map((college) => (
                <CollegeCard
                  key={college.id}
                  college={college}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-outline px-8 py-3 text-sm"
                >
                  {loadingMore
                    ? "Loading..."
                    : `Load more colleges (${
                        pagination.total - colleges.length
                      } remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}