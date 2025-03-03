import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const UNSAFE_GEMINI_API_KEY = "AIzaSyB-g8D5gE85mzBZW_gyIx7xsp5S0Nq8mZo";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const randomGradient = () => {
  const hue = Math.floor(Math.random() * 360);
  return `linear-gradient(135deg, hsl(${hue}, 80%, 90%) 0%, hsl(${
    (hue + 60) % 360
  }, 80%, 90%) 100%)`;
};

export function generateTwitterShareUrl({
  text,
  hashtags = [],
  via,
}: {
  text: string;
  hashtags?: string[];
  via?: string;
}): string {
  const baseUrl = "https://x.com/intent/tweet";
  const params = new URLSearchParams({
    text,
    // url,
    ...(hashtags.length ? { hashtags: hashtags.join() } : {}),
    ...(via ? { via } : {}),
  });

  return `${baseUrl}?${params.toString()}`;
}

export function generateBlueskyShareUrl({
  text,
}: // url,
{
  text: string;
}): string {
  const baseUrl = "https://bsky.app/compose";
  const params = new URLSearchParams({
    text: `${text}`,
  });

  return `${baseUrl}?${params.toString()}`;
}
