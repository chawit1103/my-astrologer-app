import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // <-- เพิ่มบรรทัดนี้
import Footer from "@/components/Footer"; // <-- เพิ่มบรรทัดนี้

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Astro",
  description: "Your personal astrologer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar/> {/* <-- เพิ่มบรรทัดนี้ */}
        <main>{children}</main> 
        <Footer/> {/* <-- เพิ่มบรรทัดนี้ */}
      </body>
    </html>
  );
}
