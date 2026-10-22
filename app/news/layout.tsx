import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Forex News | Tokmat Academy",
  description: "Latest forex market news and updates",
};

export default function NewsLayout({ children }: { children: ReactNode }) {
  return children;
}
