import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "拼豆库存管理系统",
  description: "Perler Bead Inventory and Pattern Recognition System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
