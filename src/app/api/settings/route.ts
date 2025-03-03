import { getSettings, SettingsProps, writeSettings } from "@/lib/settings";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSettings();

    return Response.json({ ...settings });
  } catch (error) {
    console.error("Settings read error: ", error);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as SettingsProps;

    const settings = getSettings();
    await writeSettings({ ...settings, ...body });

    return NextResponse.json({ message: "Ok" });
  } catch (error) {
    console.error("Settings update:", error);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
