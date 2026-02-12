import type { Metadata } from "next";
import "./styles/bookinga.scss";

export const metadata: Metadata = {
  title: "Abri - Find Your Perfect Hotel",
  description: "Discover and book amazing hotels worldwide. Compare prices, read reviews, and find the best accommodation for your next trip.",
  keywords: ["hotels", "booking", "accommodation", "travel", "vacation"],
};

import { LayoutProvider } from "./states";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const themeKey = 'data-bs-theme';
                const foundTheme = localStorage.getItem(themeKey);
                const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                if (foundTheme === 'dark' || (foundTheme === 'auto' && preferredTheme === 'dark') || (!foundTheme && preferredTheme === 'dark')) {
                  document.documentElement.setAttribute(themeKey, 'dark');
                } else {
                  document.documentElement.setAttribute(themeKey, 'light');
                }
              })()
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <LayoutProvider>
          {children}
        </LayoutProvider>
      </body>
    </html>
  );
}
