import type { Metadata } from "next";
import "./styles/bookinga.scss";

export const metadata: Metadata = {
  title: "Abri - Find Your Perfect Hotel",
  description: "Discover and book amazing hotels worldwide. Compare prices, read reviews, and find the best accommodation for your next trip.",
  keywords: ["hotels", "booking", "accommodation", "travel", "vacation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
