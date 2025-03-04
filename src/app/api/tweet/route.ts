import { getSettings, SettingsProps } from "@/lib/settings";
import { cronHistory } from "@/lib/cron_config";
import { UNSAFE_GEMINI_API_KEY } from "@/lib/utils";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { createOllama } from "ollama-ai-provider";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = async (req: Request) => {
  try {
    const history = await cronHistory();

    return Response.json({ history });
  } catch (error) {
    return Response.json({ message: "Internal error" });
  }
};

const sample_data = [
  {
    id: "1",
    tweet:
      "Debugging TweetPipe: When 'fetch' goes wrong and your data ghosts you.👻 Is it the API, the code, or gremlins? Time to dive in! #codinglife #debugging",
  },
  {
    id: "2",
    tweet:
      "My coding journey is 90% staring at error messages and 10% feeling like a wizard when I fix them. TweetPipe, why you gotta be like this? #devhumor #programming",
  },
  {
    id: "3",
    tweet:
      "Anyone else experience 'Failed to fetch' more than they'd like to admit?  Send help (and snacks).  Working on this TweetPipe bug.   #codingproblems #softwaredevelopment",
  },
];

export const POST = async (req: Request) => {
  try {
    const default_model = "gemini-1.5-pro";
    const default_provider = "google";

    const chat = (await req.json()) as { text: string }[];

    let settings: SettingsProps | null = null;

    try {
      settings = await getSettings();
    } catch (error) {
      // ignore
      console.warn("Settings read error:", error);
    } finally {
      // Use defaults
      if (!settings || !settings.model || !settings.provider) {
        settings = {
          apiKey: UNSAFE_GEMINI_API_KEY,
          provider: default_provider,
          model: default_model,
          mood: "Funny, informative",
        } satisfies SettingsProps;
      }
    }

    const google = createGoogleGenerativeAI({
      apiKey: settings.apiKey,
    });
    const openai = createOpenAI({ apiKey: settings.apiKey });
    const ollama = createOllama({});

    const providers = {
      google,
      ollama,
      openai,
    };

    const model = providers[settings.provider](settings.model);

    if (!model) {
      console.log("Error picking a model.");
      return Response.json({ message: "Invalid model." }, { status: 500 });
    }

    const { object } = await generateObject({
      temperature: 0.8,
      output: "array",
      schema: z.object({
        tweet: z
          .string()
          .describe("The content of tweet ready to posted on Twitter."),
      }),
      model: model as any,
      system: `You are a friendly AI tweet bot.
      Your task is to summarize OCR text chunks and
      generate potential tweets for social media growth.
      If a chunk lacks sufficient context, do nothing.
      Do not add remarks or explanations.
      Assume the tweet will be posted as-is.`,
      prompt: `
      Generate an organic tweet in under 200 characters.
      Always address my intent without making things up.
      Base the tweet on my current activity or situation.
        Example:
        If I was coding and encountered a bug, craft a tweet about how debugging improves engineering skills or wastes time.*
        Context: ${JSON.stringify(chat)}
        Additional info: Provide 2 alternative tweets for variety.
        Mood: ${settings.mood}.`,
    });

    const withIds = object.map((item) => ({
      tweet: item.tweet,
      id: crypto.randomUUID(),
    }));

    return Response.json(withIds);
    // return Response.json(sample_data);
  } catch (error) {
    console.error("Tweet Error", error);
    return Response.json({ message: "Internal error." }, { status: 500 });
  }
};
