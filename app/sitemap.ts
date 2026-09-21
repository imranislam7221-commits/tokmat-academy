import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tokmat-academy.vercel.app";

// Public pages — admin/dashboard/login/register/API bad (private pages)
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/about-us",
    "/brokers",
    "/contact",
    "/education",
    "/faq",
    "/full-courses",
    "/news",
    "/news-analysis",
    "/results",
    "/signals",
    "/videos",
  ];
  return pages.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
}
