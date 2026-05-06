import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function getLevel(cookCount: number) {
  if (cookCount >= 100) return { name: "Culinary Artisan", min: 100 };
  if (cookCount >= 61) return { name: "Flavor Architect", min: 61 };
  if (cookCount >= 31) return { name: "Kitchen Confident", min: 31 };
  if (cookCount >= 8) return { name: "Sous Chef", min: 8 };
  return { name: "Home Cook", min: 0 };
}
