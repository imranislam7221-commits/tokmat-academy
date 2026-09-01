import { NextResponse } from "next/server";

// Yahoo Finance symbols mapping
const SYMBOLS = [
  { symbol: "GC=F", label: "GOLD", type: "commodity" },
  { symbol: "TSLA", label: "TSLA.O", type: "stock" },
  { symbol: "NVDA", label: "NVDA.O", type: "stock" },
  { symbol: "AAPL", label: "AAPL.O", type: "stock" },
  { symbol: "GOOGL", label: "GOOGL.O", type: "stock" },
  { symbol: "EURUSD=X", label: "EUR/USD", type: "forex" },
  { symbol: "GBPUSD=X", label: "GBP/USD", type: "forex" },
  { symbol: "BTC-USD", label: "BTC/USD", type: "crypto" },
  { symbol: "USDJPY=X", label: "USD/JPY", type: "forex" },
  { symbol: "GC=F", label: "XAU/USD", type: "commodity" },
  { symbol: "AMZN", label: "AMZN.O", type: "stock" },
  { symbol: "MSFT", label: "MSFT.O", type: "stock" },
  { symbol: "ETH-USD", label: "ETH/USD", type: "crypto" },
  { symbol: "USDCHF=X", label: "USD/CHF", type: "forex" },
  { symbol: "AUDUSD=X", label: "AUD/USD", type: "forex" },
];

// Deduplicate: remove GC=F duplicate (GOLD and XAU/USD both map to it)
const UNIQUE_SYMBOLS = [
  { symbol: "GC=F", label: "GOLD", type: "commodity" },
  { symbol: "TSLA", label: "TSLA.O", type: "stock" },
  { symbol: "NVDA", label: "NVDA.O", type: "stock" },
  { symbol: "AAPL", label: "AAPL.O", type: "stock" },
  { symbol: "GOOGL", label: "GOOGL.O", type: "stock" },
  { symbol: "EURUSD=X", label: "EUR/USD", type: "forex" },
  { symbol: "GBPUSD=X", label: "GBP/USD", type: "forex" },
  { symbol: "BTC-USD", label: "BTC/USD", type: "crypto" },
  { symbol: "USDJPY=X", label: "USD/JPY", type: "forex" },
  { symbol: "AMZN", label: "AMZN.O", type: "stock" },
  { symbol: "MSFT", label: "MSFT.O", type: "stock" },
  { symbol: "ETH-USD", label: "ETH/USD", type: "crypto" },
  { symbol: "USDCHF=X", label: "USD/CHF", type: "forex" },
  { symbol: "AUDUSD=X", label: "AUD/USD", type: "forex" },
];

export async function GET() {
  try {
    const tickerString = UNIQUE_SYMBOLS.map((s) => s.symbol).join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickerString}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!res.ok) {
      // Fallback: try v8 chart API for each symbol
      return NextResponse.json({ fallback: true, data: [] });
    }

    const json = await res.json();
    const quotes = json.quoteResponse?.result || [];

    const data = UNIQUE_SYMBOLS.map((item) => {
      const quote = quotes.find((q: { symbol: string }) => q.symbol === item.symbol);
      if (quote) {
        const price = quote.regularMarketPrice || 0;
        const prevClose = quote.regularMarketPreviousClose || price;
        const up = price >= prevClose;
        return {
          symbol: item.label,
          price: price.toFixed(item.type === "forex" ? 4 : item.type === "crypto" ? 2 : 2),
          change: prevClose.toFixed(item.type === "forex" ? 4 : item.type === "crypto" ? 2 : 2),
          up,
        };
      }
      // Fallback data
      return {
        symbol: item.label,
        price: "0.00",
        change: "0.00",
        up: true,
      };
    });

    return NextResponse.json({ fallback: false, data });
  } catch {
    return NextResponse.json({ fallback: true, data: [] });
  }
}
