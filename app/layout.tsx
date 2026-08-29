import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "myob | Mind Your Own Business (Retail Intelligence OS)",
  description: "Next-generation retail operating system with real-time stock control, dynamic expiry clearance AI, automated supplier purchase orders, and optical POS checkout.",
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/logo.png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
      }}
    >
      <html 
        lang="en" 
        className={`h-full antialiased dark ${plusJakartaSans.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
      >
        <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
