import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { SocketProvider } from "@/lib/socket";
import JsonLd from "@/components/JsonLd";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Downlouder - Any Platform Media Downloader",
  description:
    "Download media from YouTube, Facebook, Instagram, X and TikTok instantly.",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body
        className={`${inter.className} bg-slate-950 antialiased`}
        suppressHydrationWarning
      >
        <JsonLd />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SocketProvider>{children}</SocketProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
