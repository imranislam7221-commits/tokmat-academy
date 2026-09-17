import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product, email } = body as { product: string; email?: string };

    // Map products to LemonSqueezy variant IDs (set in .env.local)
    const variantMap: Record<string, string | undefined> = {
      premium: process.env.LEMONSQUEEZY_VARIANT_PREMIUM,
      supreme: process.env.LEMONSQUEEZY_VARIANT_SUPREME,
      video1: process.env.LEMONSQUEEZY_VARIANT_VIDEO1,
      video2: process.env.LEMONSQUEEZY_VARIANT_VIDEO2,
      video3: process.env.LEMONSQUEEZY_VARIANT_VIDEO3,
      video4: process.env.LEMONSQUEEZY_VARIANT_VIDEO4,
    };

    const variantId = variantMap[product];
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    // If LemonSqueezy not configured, return mock checkout (for local test with Fasset card flow)
    if (!apiKey || !storeId || !variantId) {
      return NextResponse.json({
        mock: true,
        message: "LemonSqueezy not configured - mock checkout",
        // frontend will handle local unlock
        url: `/dashboard?checkout=mock&product=${product}`,
      });
    }

    // Real LemonSqueezy checkout
    // Redirect base: env -> request origin (localhost fallback bad — deployed domain e kaj korbe)
    const origin = new URL(req.url).origin;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
    const res = await fetch(`https://api.lemonsqueezy.com/v1/checkouts`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            product_options: { redirect_url: `${baseUrl}/dashboard?checkout=success&product=${product}` },
          },
          relationships: {
            store: { data: { type: "stores", id: storeId } },
            variant: { data: { type: "variants", id: variantId } },
          },
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.errors || "checkout failed", mock: true, url: `/dashboard?checkout=mock&product=${product}` }, { status: 200 });
    }
    const url = data.data?.attributes?.url;
    return NextResponse.json({ url, mock: false });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, mock: true, url: "/dashboard?checkout=mock" }, { status: 200 });
  }
}
