import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CollegeWithTags } from "@/types";

interface CompareStore {
  colleges: CollegeWithTags[];
  add: (college: CollegeWithTags) => boolean; // returns false if max reached
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      colleges: [],
      add: (college) => {
        if (get().colleges.length >= 3) return false;
        if (get().has(college.id)) return true;
        set((s) => ({ colleges: [...s.colleges, college] }));
        return true;
      },
      remove: (id) =>
        set((s) => ({ colleges: s.colleges.filter((c) => c.id !== id) })),
      clear: () => set({ colleges: [] }),
      has: (id) => get().colleges.some((c) => c.id === id),
    }),
    { name: "campass-compare" }
  )
);
