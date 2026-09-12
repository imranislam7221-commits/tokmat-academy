import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // LemonSqueezy webhook - verify signature in production
  // For now, just log and return ok
  try {
    const body = await req.json();
    console.log("Webhook received", body?.meta?.event_name);
    // TODO: update DB: set user plan = premium/supreme via email
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
