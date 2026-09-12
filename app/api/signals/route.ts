import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "signals.json");

async function readSignals() {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
async function writeSignals(data: any) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const signals = await readSignals();
  return NextResponse.json({ signals });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pair, direction, entry, tp, sl, status, profit } = body;
    if (!pair || !entry) return NextResponse.json({ error: "pair and entry required" }, { status: 400 });
    const signals = await readSignals();
    const newSignal = {
      pair,
      direction: direction || "BUY",
      entry: String(entry),
      tp: String(tp || entry),
      sl: String(sl || entry),
      profit: profit || "+0.00%",
      status: status || "Running",
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      id: Date.now(),
    };
    signals.unshift(newSignal);
    await writeSignals(signals.slice(0, 50));
    return NextResponse.json({ ok: true, signal: newSignal });
  } catch (e) {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const pair = searchParams.get("pair");
    let signals = await readSignals();
    const before = signals.length;
    if (id) signals = signals.filter((s:any) => String(s.id) !== String(id) && s.pair !== pair);
    else if (pair) signals = signals.filter((s:any) => s.pair !== pair);
    else signals = [];
    await writeSignals(signals);
    return NextResponse.json({ ok: true, removed: before - signals.length });
  } catch {
    return NextResponse.json({ error: "delete failed" }, { status: 500 });
  }
}
