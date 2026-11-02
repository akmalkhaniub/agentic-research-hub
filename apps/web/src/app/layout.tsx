import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic AI Research Hub",
  description: "Personal hub for tracking, researching, and deploying autonomous AI systems on free cloud & GPU platforms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
