import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Best Forex Brokers | Tokmat Academy",
  description: "Trusted forex broker reviews and recommendations by Tokmat Academy",
};

export default function BrokersLayout({ children }: { children: ReactNode }) {
  return children;
}
