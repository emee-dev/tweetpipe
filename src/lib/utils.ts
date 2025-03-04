import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// TODO This is on purpose, I am leaving this here for the hackathon period.
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
    ...(hashtags.length ? { hashtags: hashtags.join() } : {}),
    ...(via ? { via } : {}),
  });

  return `${baseUrl}?${params.toString()}`;
}

export function generateBlueskyShareUrl({ text }: { text: string }): string {
  const baseUrl = "https://bsky.app/intent/compose";
  const params = new URLSearchParams({
    text: `${text.slice(0, 300)}`,
  });

  return `${baseUrl}?${params.toString()}`;
}

export function getBaseUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);

    // Remove the last segment (e.g., "cron" in "/api/cron")
    if (pathSegments.length > 1) {
      pathSegments.pop();
    }

    return `${parsedUrl.origin}/${pathSegments.join("/")}`;
  } catch (error) {
    console.error("Invalid URL:", error);
    return url; // Return the original if there's an error
  }
}
