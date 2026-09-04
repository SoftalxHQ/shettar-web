import type { Metadata } from "next";
import "bootstrap-icons/font/bootstrap-icons.css";
import "flatpickr/dist/flatpickr.min.css";
import "choices.js/public/assets/styles/choices.min.css";
import "nouislider/dist/nouislider.css";
import "./styles/bookinga.scss";

const SITE_URL = "https://www.shettar.com";
const SITE_NAME = "Shettar";
const SITE_DESCRIPTION =
  "Discover and book amazing hotels in Nigeria. Compare prices, read reviews, and find the best accommodation for your next trip. 0810 704 0050 hey@shettar.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "Shettar - Find Your Perfect Hotel",
    template: "%s | Shettar",
  },
  description: SITE_DESCRIPTION,
  keywords: ["hotels", "booking", "accommodation", "travel", "vacation"],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Shettar - Find Your Perfect Hotel",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Shettar - Find Your Perfect Hotel",
    description: SITE_DESCRIPTION,
  },
};

import { Toaster } from 'react-hot-toast';
import ReduxProvider from '@/lib/store/ReduxProvider';
import BrowseGateBootstrap from '@/app/components/BrowseGateBootstrap';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Poppins:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  name: SITE_NAME,
                  url: SITE_URL,
                },
                {
                  "@type": "Organization",
                  name: SITE_NAME,
                  url: SITE_URL,
                  email: "hey@shettar.com",
                  telephone: "+2348107040050",
                },
              ],
            }),
          }}
        />
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
        <ReduxProvider>
          <BrowseGateBootstrap />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
