import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

/**
 * Format seconds to MM:SS format
 * @param seconds - The number of seconds to format
 * @returns Formatted time string (e.g., "5:30")
 */
export function formatTime(seconds: number): string {
  if (!seconds) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Format seconds to HH:MM:SS format
 * @param seconds - The number of seconds to format
 * @returns Formatted time string (e.g., "1:05:30")
 */
export function formatLongTime(seconds: number): string {
  if (!seconds) return "0:00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Format file size in bytes to human-readable format
 * @param bytes - The file size in bytes
 * @returns Formatted file size (e.g., "5.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format a date to a human-readable string
 * @param date - The date to format
 * @returns Formatted date string (e.g., "March 15, 2024")
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}
