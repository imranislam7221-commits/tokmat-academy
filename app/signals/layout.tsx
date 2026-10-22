import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Live Signals | Tokmat Academy",
  description: "Live forex trading signals with entry, TP and SL levels",
};

export default function SignalsLayout({ children }: { children: ReactNode }) {
  return children;
}
