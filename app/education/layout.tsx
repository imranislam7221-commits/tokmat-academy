import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Education Center | Tokmat Academy",
  description: "Free forex trading lessons, strategies and education materials",
};

export default function EducationLayout({ children }: { children: ReactNode }) {
  return children;
}
