import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export function formatRating(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "0.0";
  }

  return value.toFixed(1);
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getDateRangeFromPreset(preset: string) {
  const today = new Date();
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const start = new Date(end);

  switch (preset) {
    case "7d":
      start.setUTCDate(end.getUTCDate() - 6);
      break;
    case "90d":
      start.setUTCDate(end.getUTCDate() - 89);
      break;
    case "custom":
      return null;
    case "30d":
    default:
      start.setUTCDate(end.getUTCDate() - 29);
      break;
  }

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
}
