import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiz Game",
  description: "Real-time multiplayer quiz game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
