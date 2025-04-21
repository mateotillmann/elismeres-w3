import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Employee } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to calculate expiration date based on employment type
export function calculateExpirationDate(employmentType: Employee["employmentType"]): number {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000

  switch (employmentType) {
    case "full-time":
      return now + 7 * oneDay // 1 week for full-time employees
    case "part-time":
    case "student":
      return now + 14 * oneDay // 2 weeks for part-time and student employees
    default:
      return now + 7 * oneDay
  }
}
