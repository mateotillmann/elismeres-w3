import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Employee } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to calculate expiration date based on employment type
export function calculateExpirationDate(employmentType: Employee["employmentType"]): number {
  const now = Date.now()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

  // Return 30 days from now regardless of employment type
  return now + thirtyDays
}
