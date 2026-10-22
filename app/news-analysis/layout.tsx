import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "News Analysis | Tokmat Academy",
  description: "Daily forex news analysis and market impact breakdown",
};

export default function NewsAnalysisLayout({ children }: { children: ReactNode }) {
  return children;
}
