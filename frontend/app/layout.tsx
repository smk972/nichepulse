import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { PlatformProvider } from "@/lib/PlatformContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NICHEPULSE — Market Intelligence Terminal",
  description: "Radar d'opportunités et moteur de détection d'applications mobiles rentables pour développeurs indépendants.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`dark ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${inter.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="bg-[#0b0d13] text-[#e2e2eb] font-sans antialiased min-h-screen">
        <PlatformProvider>
          <Sidebar />
          <div className="pl-64 flex flex-col min-h-screen">
            <Header />
            <main className="w-full pt-16 bg-[#0c0e14] min-h-screen relative">
              {children}
            </main>
          </div>
        </PlatformProvider>
      </body>
    </html>
  );
}
