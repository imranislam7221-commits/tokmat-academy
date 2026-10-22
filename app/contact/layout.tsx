import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact Us | Tokmat Academy",
  description: "Get in touch with Tokmat Academy support — Telegram, email, or message form",
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
