import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Login | Tokmat Academy",
  description: "Login to your Tokmat Academy account",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
