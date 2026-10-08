import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muharrir",
  description: "Transform vague ideas into structured, high-quality AI prompts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
