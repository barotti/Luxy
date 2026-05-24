import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function calculateBookingAmounts(
  stayAmount: number,
  cleaningAmount: number,
  feePercent = 0
) {
  const ownerAmount = stayAmount + cleaningAmount;
  const feeAmount = Math.round(ownerAmount * feePercent) / 100;
  const totalAmount = ownerAmount + feeAmount;
  return { ownerAmount, feeAmount, totalAmount };
}
