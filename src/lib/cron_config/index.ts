import fs from "fs/promises";
import path from "path";

type CronIndex = string;
type Tweet = { id: string; tweet: string };
export type Storage = Record<CronIndex, Tweet[]>;

const STORAGE_FILE = path.join(process.cwd(), "tweetpipe.json");

async function ensureStorageFile() {
  try {
    await fs.access(STORAGE_FILE);
  } catch {
    await fs.writeFile(STORAGE_FILE, JSON.stringify({}), "utf-8");
  }
}

async function loadStorage() {
  await ensureStorageFile();
  const data = await fs.readFile(STORAGE_FILE, "utf-8");
  return JSON.parse(data) as Storage;
}

async function saveStorage(data: Storage) {
  await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function cronHistory() {
  let history = await loadStorage();

  return history;
}

export async function getLatest() {
  const storage = await loadStorage();
  const latestKey = Object.keys(storage).sort().pop();
  return latestKey ? storage[latestKey] : [];
}

export async function storeCronData(tweets: Tweet[]) {
  const storage = await loadStorage();
  const timestamp = new Date().toISOString();
  storage[timestamp] = tweets;
  await saveStorage(storage);
}

export async function cleanOldData(daysToKeep = 7) {
  const storage = await loadStorage();
  const cutoffDate = new Date(
    Date.now() - daysToKeep * 24 * 60 * 60 * 1000
  ).toISOString();

  for (const key of Object.keys(storage)) {
    if (key < cutoffDate) {
      delete storage[key];
    }
  }

  await saveStorage(storage);
}
