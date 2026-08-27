import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "myob | Supermarket & Retail Operating Intelligence",
  description: "Next-generation retail operating system with real-time stock control, dynamic expiry clearance AI, automated supplier purchase orders, and optical POS checkout.",
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
      <html lang="en" className="h-full antialiased dark">
        <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
