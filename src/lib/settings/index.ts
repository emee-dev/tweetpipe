import fs from "fs/promises";
import path from "path";
import { UNSAFE_GEMINI_API_KEY } from "../utils";

export type SettingsProps = {
  provider: "ollama" | "google" | "openai";
  model: string;
  apiKey?: string;
  mood?: string;
};

const SETTINGS_FILE = path.join(process.cwd(), "tweetpipe_settings.json");

async function ensureSettingsFile() {
  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    await writeSettings({
      provider: "google",
      model: "gemini-1.5-pro",
      apiKey: UNSAFE_GEMINI_API_KEY,
      mood: "Funny, Informative",
    });
  }
}

export async function getSettings(): Promise<SettingsProps> {
  await ensureSettingsFile();
  const data = await fs.readFile(SETTINGS_FILE, "utf-8");
  return JSON.parse(data);
}

export async function writeSettings(settings: SettingsProps): Promise<void> {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

export async function updateSettings<K extends keyof SettingsProps>(
  key: K,
  value: SettingsProps[K]
): Promise<void> {
  const settings = await getSettings();
  settings[key] = value;
  await writeSettings(settings);
}
