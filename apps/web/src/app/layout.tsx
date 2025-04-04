import "@/styles/globals.css";
import "@analogia/ui-v4/globals.css";

import { TRPCReactProvider } from "@/trpc/react";
import { type Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Analogia",
  description: "Analogia – Cursor for Designers",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${inter.variable}`}>
      <body>
        <TRPCReactProvider>
          <NextIntlClientProvider>
            {children as any}
            {/* <Modals /> */}
          </NextIntlClientProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
