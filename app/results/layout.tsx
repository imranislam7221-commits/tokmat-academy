import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Signal Results | Tokmat Academy",
  description: "Tokmat Academy monthly signal results — win rate and profit track record",
};

export default function ResultsLayout({ children }: { children: ReactNode }) {
  return children;
}
