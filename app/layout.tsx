import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#010102",
};

export const metadata: Metadata = {
  title: "KKP ITB | Koperasi kita.",
  description:
    "Kenali layanan Koperasi Keluarga Pegawai ITB: waserda, simpan pinjam, kantin, serta rental dan travel.",
  keywords: ["KKP ITB", "koperasi", "waserda", "simpan pinjam", "ITB"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    title: "KKP ITB | Koperasi kita.",
    description: "Beragam layanan koperasi, satu pintu masuk.",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="bg-background">
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
