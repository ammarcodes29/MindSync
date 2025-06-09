import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single class string using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or Date object to a human-readable format
 */
export function formatDate(date: Date | string, format: string = "MMM dd, yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(d.getTime())) {
    return "Invalid date";
  }
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const year = d.getFullYear();
  const month = months[d.getMonth()];
  const day = d.getDate();
  const dayOfWeek = days[d.getDay()];
  
  // Basic formatting options
  const formatMap: Record<string, string> = {
    "MMM dd, yyyy": `${month} ${day}, ${year}`,
    "MMMM dd, yyyy": `${months[d.getMonth()]} ${day}, ${year}`,
    "dd/MM/yyyy": `${day.toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${year}`,
    "yyyy-MM-dd": `${year}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    "EEEE, MMMM dd, yyyy": `${dayOfWeek}, ${months[d.getMonth()]} ${day}, ${year}`,
  };
  
  return formatMap[format] || formatMap["MMM dd, yyyy"];
}

/**
 * Gets the user's initials from their full name
 */
export function getInitials(name: string): string {
  if (!name) return "";
  
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Calculates the contrast color (black or white) for a given background color
 */
export function getContrastColor(hexColor: string): string {
  // Default to black if invalid hex
  if (!hexColor || !hexColor.startsWith("#") || hexColor.length !== 7) {
    return "#000000";
  }
  
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark colors and black for light colors
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Truncates text to a specific length and adds an ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
