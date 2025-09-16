import type { Metadata } from "next";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import Layout from "@/components/layout/Layout";
import "./globals.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

ModuleRegistry.registerModules([AllCommunityModule]);

export const metadata: Metadata = {
  title: "나의 가계부",
  description: "수입과 지출을 기록합니다.",
  openGraph: {
    title: "나의 가계부",
    description: "수입과 지출을 기록합니다.",
    url: "https://account-book-next.vercel.app/",
    siteName: "나의 가계부",
    images: [
      {
        url: "/images/og-image.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />

        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>

      <body suppressHydrationWarning>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
