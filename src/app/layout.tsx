import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
// Roadmap fonts, exposed as CSS variables and used under .roadmap-home only.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
export const metadata: Metadata = {
  title: "ABAP Academy — SAP ABAP for Everyone",
  description:
    "Learn ABAP through short lessons, guided simulations, and hands-on challenges. No SAP system needed.",
  openGraph: {
    title: "ABAP Academy — SAP ABAP for Everyone",
    description: "Learn ABAP through short lessons, guided simulations, and hands-on challenges. No SAP system needed.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
