import type { MetadataRoute } from "next";

// Vercel e NEXT_PUBLIC_APP_URL set thakle oi domain use hobe,
// na hole deployed domain (production default)
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tokmat-academy.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/dashboard", "/login", "/register"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
