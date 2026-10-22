import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Us | Tokmat Academy",
  description: "Learn about Tokmat Academy — international forex education and trading signals platform",
};

export default function AboutUsLayout({ children }: { children: ReactNode }) {
  return children;
}
