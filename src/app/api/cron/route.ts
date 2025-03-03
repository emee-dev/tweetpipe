import { latestOCR } from "@/hooks/use-ocr-data";
import { storeCronData } from "@/lib/cron_config";
import { pipe } from "@screenpipe/js";

const BASE_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : "";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = async (req: Request) => {
  try {
    const latest_ocr = await latestOCR({ pageIndex: 0, pageSize: 5 });

    if (!latest_ocr.data) {
      return Response.json(
        {
          message:
            "There was a problem connecting to screenpipe or fetching OCR.",
        },
        { status: 500 }
      );
    }

    const chunks = latest_ocr.data.map((item) => ({ text: item.text }));

    console.log("Chunks length: ", chunks.length);

    const req = await fetch(`${BASE_URL}/api/tweet`, {
      method: "POST",
      body: JSON.stringify(chunks),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!req.ok) {
      console.log(await req.text());
      return Response.json(
        { message: "Error generating tweets." },
        { status: 500 }
      );
    }

    const res = (await req.json()) as { id: string; tweet: string }[];

    if (!res || res.length === 0) {
      return Response.json(
        { message: "Error generating tweets." },
        { status: 500 }
      );
    }

    console.log("Tweets: ", res);

    await storeCronData(res);

    await pipe.sendDesktopNotification({
      title: "Cron results:",
      body: "New tweets generated, next batch in 30mins.",
    });

    return Response.json({ message: "Cron successful tweets were generated." });
  } catch (error) {
    console.log(error);
    return Response.json({ message: "Internal error" }, { status: 500 });
  }
};
