import { NextResponse } from "next/server";

const SIGNAL_SYMBOLS = [
  { symbol: "EURUSD=X", label: "EUR/USD", type: "forex" },
  { symbol: "GC=F", label: "XAU/USD", type: "commodity" },
  { symbol: "GBPJPY=X", label: "GBP/JPY", type: "forex" },
];

const TICKER_SYMBOLS = [
  { symbol: "GC=F", label: "GOLD", type: "commodity" },
  { symbol: "TSLA", label: "TSLA", type: "stock" },
  { symbol: "NVDA", label: "NVDA", type: "stock" },
  { symbol: "AAPL", label: "AAPL", type: "stock" },
  { symbol: "GOOGL", label: "GOOGL", type: "stock" },
  { symbol: "EURUSD=X", label: "EUR/USD", type: "forex" },
  { symbol: "GBPUSD=X", label: "GBP/USD", type: "forex" },
  { symbol: "BTC-USD", label: "BTC/USD", type: "crypto" },
  { symbol: "USDJPY=X", label: "USD/JPY", type: "forex" },
  { symbol: "AMZN", label: "AMZN", type: "stock" },
  { symbol: "MSFT", label: "MSFT", type: "stock" },
  { symbol: "ETH-USD", label: "ETH/USD", type: "crypto" },
  { symbol: "USDCHF=X", label: "USD/CHF", type: "forex" },
  { symbol: "AUDUSD=X", label: "AUD/USD", type: "forex" },
];

function generateSignal(pair: { symbol: string; label: string; type: string }, price: number) {
  const isBuy = Math.random() > 0.35;
  const tpPercent = 0.005 + Math.random() * 0.008;
  const slPercent = 0.003 + Math.random() * 0.005;
  const entry = price;
  const tp = isBuy ? entry * (1 + tpPercent) : entry * (1 - tpPercent);
  const sl = isBuy ? entry * (1 - slPercent) : entry * (1 + slPercent);
  const profitPercent = 0.2 + Math.random() * 2.0;
  const status = profitPercent > 1.0 ? "TP Hit" : "Running";
  const decimals = pair.type === "forex" ? 5 : 2;

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
    const allSymbols = [...SIGNAL_SYMBOLS, ...TICKER_SYMBOLS];
    const tickerString = allSymbols.map((s) => s.symbol).join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickerString}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      next: { revalidate: 30 },
    });

    if (!res.ok) return NextResponse.json({ fallback: true, signals: [], ticker: [] });

    const json = await res.json();
    const quotes = json.quoteResponse?.result || [];

    const signals = SIGNAL_SYMBOLS.map((item) => {
      const quote = quotes.find((q: { symbol: string }) => q.symbol === item.symbol);
      if (quote && quote.regularMarketPrice) return generateSignal(item, quote.regularMarketPrice);
      return null;
    }).filter(Boolean);

    const ticker = TICKER_SYMBOLS.map((item) => {
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

    return NextResponse.json({ fallback: false, signals, ticker });
  } catch {
    return NextResponse.json({ fallback: true, signals: [], ticker: [] });
  }
}
