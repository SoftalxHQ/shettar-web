import type { Metadata } from "next";
import "./styles/bookinga.scss";

export const metadata: Metadata = {
  title: "Abri - Find Your Perfect Hotel",
  description: "Discover and book amazing hotels worldwide. Compare prices, read reviews, and find the best accommodation for your next trip.",
  keywords: ["hotels", "booking", "accommodation", "travel", "vacation"],
};

import { LayoutProvider } from "./states";
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
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
        <script src="https://js.paystack.co/v2/inline.js" async></script>
      </head>
      <body className="antialiased">
        <Toaster
          position="top-center"
          reverseOrder={false}
          containerStyle={{ zIndex: 99999 }}
          toastOptions={{
            className: 'abri-toast',
            duration: 4000,
            style: {
              background: 'var(--bs-body-bg)',
              color: 'var(--bs-body-color)',
              border: '1px solid var(--bs-border-color)',
            },
            success: {
              iconTheme: {
                primary: 'var(--bs-primary)',
                secondary: 'var(--bs-body-bg)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--bs-danger)',
                secondary: 'var(--bs-body-bg)',
              },
            },
          }}
        />
        <LayoutProvider>
          {children}
        </LayoutProvider>
      </body>
    </html>
  );
}
