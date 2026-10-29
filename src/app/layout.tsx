import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ABAP Academy 2.0 — SAP ABAP for Everyone",
  description:
    "Learn ABAP through short bilingual lessons, guided simulations, and hands-on challenges. No SAP system needed.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
