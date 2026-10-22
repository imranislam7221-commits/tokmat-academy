import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Video Lessons | Tokmat Academy",
  description: "Forex video lessons — technical analysis, price action and more",
};

export default function VideosLayout({ children }: { children: ReactNode }) {
  return children;
}
