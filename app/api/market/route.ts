import { NextResponse } from "next/server";

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

// Stock symbols (Finnhub free tier supports US stocks)
const STOCK_SYMBOLS = [
  { symbol: "TSLA", label: "TSLA", type: "stock" },
  { symbol: "NVDA", label: "NVDA", type: "stock" },
  { symbol: "AAPL", label: "AAPL", type: "stock" },
  { symbol: "GOOGL", label: "GOOGL", type: "stock" },
  { symbol: "AMZN", label: "AMZN", type: "stock" },
  { symbol: "MSFT", label: "MSFT", type: "stock" },
];

// Crypto symbols (Finnhub Binance format)
const CRYPTO_SYMBOLS = [
  { symbol: "BINANCE:BTCUSDT", label: "BTC/USD", type: "crypto" },
  { symbol: "BINANCE:ETHUSDT", label: "ETH/USD", type: "crypto" },
];

// Forex symbols - using Frankfurter API (free, no key)
const FOREX_PAIRS = [
  { base: "USD", quote: "EUR", label: "EUR/USD", decimals: 5 },
  { base: "USD", quote: "GBP", label: "GBP/USD", decimals: 5 },
  { base: "USD", quote: "JPY", label: "USD/JPY", decimals: 3 },
  { base: "USD", quote: "CHF", label: "USD/CHF", decimals: 5 },
  { base: "USD", quote: "AUD", label: "AUD/USD", decimals: 5 },
];

// Gold price - free gold-api.com with fallback
async function fetchGoldPrice() {
  try {
    const res = await fetch("https://api.gold-api.com/price/XAU", { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.price) return Number(data.price);
    }
  } catch {}
  return null;
}

// Gold previous close (Yahoo Gold Futures GC=F) — REAL change% er jonno
async function fetchGoldPrevClose(): Promise<number | null> {
  try {
    const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=5d&interval=1d", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const d = await res.json();
      const meta = d?.chart?.result?.[0]?.meta;
      if (meta?.chartPreviousClose) return Number(meta.chartPreviousClose);
    }
  } catch {}
  return null;
}

// Percentage change helper
function pctChange(current: number, prev: number | null | undefined): number {
  if (!prev || !isFinite(prev) || prev === 0 || !isFinite(current)) return 0;
  return ((current - prev) / prev) * 100;
}

async function fetchForexRates() {
  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,CHF,AUD`,
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const data = await res.json();
      return data; // { rates, date }
    }
  } catch {}
  return null;
}

// Historical rates (previous business day) — REAL change% er jonno
async function fetchForexHistorical(dateStr: string) {
  try {
    const res = await fetch(
      `https://api.frankfurter.app/${dateStr}?from=USD&to=EUR,GBP,JPY,CHF,AUD`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      return data.rates || null;
    }
  } catch {}
  return null;
}

async function fetchFinnhubQuote(symbol: string) {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.c && data.c !== 0) {
      return {
        price: data.c,
        previousClose: data.pc || data.c,
        change: data.d || 0,
        changePercent: data.dp || 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function getPersistedSignals(): Promise<any[] | null> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const file = path.join(process.cwd(), "data", "signals.json");
    const raw = await fs.readFile(file, "utf-8");
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length > 0) return arr.slice(0, 6);
  } catch {}
  return null;
}

function generateSignal(label: string, price: number) {
  const isBuy = Math.random() > 0.35;
  const tpPercent = 0.005 + Math.random() * 0.008;
  const slPercent = 0.003 + Math.random() * 0.005;
  const entry = price;
  const tp = isBuy ? entry * (1 + tpPercent) : entry * (1 - tpPercent);
  const sl = isBuy ? entry * (1 - slPercent) : entry * (1 + slPercent);
  const profitPercent = 0.2 + Math.random() * 2.0;
  const status = profitPercent > 1.0 ? "TP Hit" : "Running";
  // JPY pairs 3 decimals, gold 2, onnano 5
  const decimals = label.includes("JPY") ? 3 : label.includes("XAU") || label.includes("GOLD") ? 2 : 5;
  return {
    pair: label,
    direction: isBuy ? "BUY" : "SELL",
    entry: entry.toFixed(decimals),
    tp: tp.toFixed(decimals),
    sl: sl.toFixed(decimals),
    profit: `+${profitPercent.toFixed(2)}%`,
    status,
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

export async function GET() {
  try {
    // Fetch stocks + crypto from Finnhub
    const stockResults = await Promise.all(
      STOCK_SYMBOLS.map(async (item) => ({
        ...item,
        data: await fetchFinnhubQuote(item.symbol),
      }))
    );

    const cryptoResults = await Promise.all(
      CRYPTO_SYMBOLS.map(async (item) => ({
        ...item,
        data: await fetchFinnhubQuote(item.symbol),
      }))
    );

    // Fetch forex from Frankfurter (latest + previous day for real change)
    const forexData = await fetchForexRates();
    const forexRates = forexData ? forexData.rates : null;

    // Previous business day rate for real change%
    let prevRates: any = null;
    if (forexData?.date) {
      const [y, m, d] = String(forexData.date).split("-").map(Number);
      const prevDate = new Date(Date.UTC(y, m - 1, d));
      prevDate.setUTCDate(prevDate.getUTCDate() - 1);
      // Skip weekend (Sat/Sun)
      const day = prevDate.getUTCDay();
      if (day === 0) prevDate.setUTCDate(prevDate.getUTCDate() - 2);
      else if (day === 6) prevDate.setUTCDate(prevDate.getUTCDate() - 1);
      prevRates = await fetchForexHistorical(
        `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, "0")}-${String(prevDate.getUTCDate()).padStart(2, "0")}`
      );
    }

    // Fetch gold (price + prev close for real change)
    const [goldPrice, goldPrev] = await Promise.all([fetchGoldPrice(), fetchGoldPrevClose()]);

    // Build ticker
    const ticker = [];

    // Gold — real price + real change from Yahoo prev close
    const gold = goldPrice ?? 0;
    const goldPct = pctChange(gold, goldPrev);
    ticker.push({
      symbol: "GOLD",
      price: gold ? gold.toFixed(2) : "N/A",
      change: `${goldPct >= 0 ? "+" : ""}${goldPct.toFixed(2)}%`,
      up: goldPct >= 0,
    });

    // Stocks
    for (const item of stockResults) {
      if (item.data) {
        ticker.push({
          symbol: item.label,
          price: item.data.price.toFixed(2),
          change: `${item.data.changePercent >= 0 ? "+" : ""}${item.data.changePercent.toFixed(2)}%`,
          up: item.data.changePercent >= 0,
        });
      } else {
        ticker.push({ symbol: item.label, price: "0.00", change: "0.00%", up: true });
      }
    }

    // Forex — real price + real change (vs previous business day)
    if (forexRates) {
      const pairs = [
        { symbol: "EUR/USD", rate: forexRates.EUR, prev: prevRates?.EUR, inv: true, decimals: 5 },
        { symbol: "GBP/USD", rate: forexRates.GBP, prev: prevRates?.GBP, inv: true, decimals: 5 },
        { symbol: "USD/JPY", rate: forexRates.JPY, prev: prevRates?.JPY, inv: false, decimals: 3 },
        { symbol: "USD/CHF", rate: forexRates.CHF, prev: prevRates?.CHF, inv: false, decimals: 5 },
        { symbol: "AUD/USD", rate: forexRates.AUD, prev: prevRates?.AUD, inv: true, decimals: 5 },
      ];
      for (const p of pairs) {
        if (!p.rate) continue;
        // inv=true mane USD-base rate ke price-base e ulte hobe (EUR/USD = 1/EUR rate)
        const cur = p.inv ? 1 / p.rate : p.rate;
        const prev = p.prev ? (p.inv ? 1 / p.prev : p.prev) : null;
        const chg = pctChange(cur, prev);
        ticker.push({
          symbol: p.symbol,
          price: cur.toFixed(p.decimals),
          change: `${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`,
          up: chg >= 0,
        });
      }
    }

    // Crypto
    for (const item of cryptoResults) {
      if (item.data) {
        ticker.push({
          symbol: item.label,
          price: item.data.price.toFixed(2),
          change: `${item.data.changePercent >= 0 ? "+" : ""}${item.data.changePercent.toFixed(2)}%`,
          up: item.data.changePercent >= 0,
        });
      } else {
        ticker.push({ symbol: item.label, price: "0.00", change: "0.00%", up: true });
      }
    }

    // Admin-posted signals prefer hoy (data/signals.json); na thakle live price theke fresh generate
    const persisted = await getPersistedSignals();
    let signals: any[];
    if (persisted) {
      signals = persisted;
    } else {
      const liveSignals: any[] = [];
      if (gold) liveSignals.push(generateSignal("XAU/USD", gold));
      if (forexRates?.EUR) liveSignals.push(generateSignal("EUR/USD", 1 / forexRates.EUR));
      if (forexRates?.JPY && forexRates?.GBP) liveSignals.push(generateSignal("GBP/JPY", forexRates.JPY / forexRates.GBP));
      signals = liveSignals;
    }

    return NextResponse.json({ fallback: false, signals, ticker, source: "finnhub+frankfurter" }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } });
  } catch {
    return NextResponse.json({ fallback: true, signals: [], ticker: [], source: "mock" }, { headers: { "Cache-Control": "no-store" } });
  }
}
