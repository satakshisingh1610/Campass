import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFees(fees: number): string {
  if (fees < 10000) return `₹${fees.toLocaleString("en-IN")}/yr`;
  if (fees < 100000) return `₹${(fees / 1000).toFixed(0)}K/yr`;
  return `₹${(fees / 100000).toFixed(1)}L/yr`;
}

export function formatPackage(lpa: number): string {
  if (lpa >= 100) return `₹${(lpa / 100).toFixed(1)} Cr`;
  return `₹${lpa}L`;
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return "text-sage bg-sage-light";
  if (rating >= 4.0) return "text-gold bg-gold-pale";
  return "text-rust bg-rust-light";
}
