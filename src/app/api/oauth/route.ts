import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAuthUrl } from "@/lib/analytics";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  const channelDbId = Number(new URL(req.url).searchParams.get("channelId"));
  const state = crypto.randomBytes(16).toString("hex");
  const url = getAuthUrl(channelDbId, state);
  return NextResponse.redirect(url);
}
