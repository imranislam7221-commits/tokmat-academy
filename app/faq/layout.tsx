import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "FAQ | Tokmat Academy",
  description: "Frequently asked questions about Tokmat Academy signals and courses",
};

export default function FaqLayout({ children }: { children: ReactNode }) {
  return children;
}
