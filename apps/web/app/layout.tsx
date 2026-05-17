import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AppQueryClientProvider } from "@/lib/react-query/query-client-provider";
import { ThemeProvider } from "@/components/foundation/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bếp An Tâm | Tủ lạnh số cho gia đình",
  description:
    "Bếp An Tâm giúp theo dõi thực phẩm đã mở nắp, nhắc hạn dùng và giảm lãng phí trong gia đình.",
  keywords: [
    "quản lý thực phẩm",
    "tủ lạnh số",
    "hạn sử dụng",
    "bếp an tâm",
    "food tracker",
    "mở nắp",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bếp An Tâm",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "Bếp An Tâm | Tủ lạnh số cho gia đình",
    description:
      "Theo dõi thực phẩm đã mở nắp, nhắc hạn dùng và giảm lãng phí thực phẩm trong gia đình.",
    siteName: "Bếp An Tâm",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bếp An Tâm | Tủ lạnh số cho gia đình",
    description:
      "Theo dõi thực phẩm đã mở nắp, nhắc hạn dùng và giảm lãng phí thực phẩm.",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <AppQueryClientProvider>{children}</AppQueryClientProvider>
        </ThemeProvider>

        <Toaster
          position="bottom-center"
          richColors
          closeButton
          toastOptions={{
            style: { borderRadius: '16px' },
          }}
        />
      </body>
    </html>
  );
}
