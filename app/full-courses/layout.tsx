import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Full Courses | Tokmat Academy",
  description: "Complete forex trading courses — from basics to advanced strategies",
};

export default function FullCoursesLayout({ children }: { children: ReactNode }) {
  return children;
}
