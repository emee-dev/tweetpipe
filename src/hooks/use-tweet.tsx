import { useMutation } from "@tanstack/react-query";

type OcrResults = {
  app_name: string;
  focused: number;
  frame_id: number;
  ocr_engine: string;
  text: string;
  text_json: string;
  window_name: string;
};

type Tweets = { id: string; tweet: string };

const generateTweets = async (data: OcrResults[]) => {
  const chunks = data.map((item) => ({
    text: item.text,
  }));

  const req = await fetch("/api/tweet", {
    method: "POST",
    body: JSON.stringify(chunks),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!req.ok) {
    console.error(await req.text());
    throw new Error("Failed to fetch tweets.");
  }

  const res = (await req.json()) as Tweets[];

  return Promise.resolve(res);
};

const useTweet = () => {
  return useMutation({
    mutationKey: ["tweet_data"],
    mutationFn: (args: OcrResults[]) => generateTweets(args),
  });
};

export default useTweet;
