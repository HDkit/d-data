import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DData Library",
  description: "Browse and manage documents in DData.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
