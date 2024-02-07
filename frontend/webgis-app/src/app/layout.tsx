import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./ui/globals.css";
import SideNav from "./ui/sidenav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LightGIS",
  description: "An application for conducting GIS analysis in a browser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <main className="flex-row md:flex">
          <div className="w-full md:flex-none md:w-64 md:h-screen">
            <SideNav />
          </div>
          <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        </main>
      </body>
    </html>
  );
}
