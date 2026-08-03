import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monorepo Base",
  description: "Aplicação multi-tenant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-svh antialiased">{children}</body>
    </html>
  );
}
