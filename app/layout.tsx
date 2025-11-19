import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cairo = Cairo({ 
  subsets: ["latin", "arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "عمر عرفه - مدرس اللغة العربية",
  description: "موقع تعليمي لمدرس اللغة العربية الأزهري عمر عرفه",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cairo.className}>
        <ThemeProvider>
          <SessionProviderWrapper>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

