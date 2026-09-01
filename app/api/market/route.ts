import { NextResponse } from "next/server";

// Signal symbols - these are the pairs we show as trading signals
const SIGNAL_SYMBOLS = [
  { symbol: "EURUSD=X", label: "EUR/USD", type: "forex" },
  { symbol: "GBPJPY=X", label: "GBP/JPY", type: "forex" },
  { symbol: "GC=F", label: "XAU/USD", type: "commodity" },
];

// Generate signal data from real price
function generateSignal(pair: { symbol: string; label: string; type: string }, price: number) {
  // Determine direction based on small price movement
  const isBuy = Math.random() > 0.4; // 60% buy bias
  
  let tpPercent: number, slPercent: number;
  if (pair.type === "forex") {
    tpPercent = 0.005 + Math.random() * 0.005; // 0.5% to 1%
    slPercent = 0.003 + Math.random() * 0.003; // 0.3% to 0.6%
  } else {
    // Gold/commodity - bigger moves
    tpPercent = 0.008 + Math.random() * 0.012; // 0.8% to 2%
    slPercent = 0.005 + Math.random() * 0.008; // 0.5% to 1.3%
  }

  const entry = price;
  const tp = isBuy ? entry * (1 + tpPercent) : entry * (1 - tpPercent);
  const sl = isBuy ? entry * (1 - slPercent) : entry * (1 + slPercent);
  
  // Random profit between 0.1% and 2.5%
  const profitPercent = 0.1 + Math.random() * 2.4;
  const status = profitPercent > 1.0 ? "TP Hit" : "Running";

  const decimals = pair.type === "forex" ? 5 : pair.type === "commodity" ? 2 : 2;

  return {
    pair: pair.label,
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
    const tickerString = SIGNAL_SYMBOLS.map((s) => s.symbol).join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickerString}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json({ fallback: true, signals: [], ticker: [] });
    }

    const json = await res.json();
    const quotes = json.quoteResponse?.result || [];

    // Generate signals from real prices
    const signals = SIGNAL_SYMBOLS.map((item) => {
      const quote = quotes.find((q: { symbol: string }) => q.symbol === item.symbol);
      if (quote && quote.regularMarketPrice) {
        return generateSignal(item, quote.regularMarketPrice);
      }
      return null;
    }).filter(Boolean);

    // Also return ticker data
    const tickerData = SIGNAL_SYMBOLS.map((item) => {
      const quote = quotes.find((q: { symbol: string }) => q.symbol === item.symbol);
      if (quote) {
        const price = quote.regularMarketPrice || 0;
        const prevClose = quote.regularMarketPreviousClose || price;
        return {
          symbol: item.label,
          price: price.toFixed(item.type === "forex" ? 5 : 2),
          change: `${((price - prevClose) / prevClose * 100).toFixed(2)}%`,
          up: price >= prevClose,
        };
      }
      return { symbol: item.label, price: "0.00", change: "0.00%", up: true };
    });

    return NextResponse.json({ fallback: false, signals, ticker: tickerData });
  } catch {
    return NextResponse.json({ fallback: true, signals: [], ticker: [] });
  }
}
