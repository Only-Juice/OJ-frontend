import UserLayout from "@/layouts/UserLayout";
import AdminLayout from "@/layouts/AdminLayout";

import { Geist, Geist_Mono, Nabla } from "next/font/google";
import "../app/globals.css";

import { SWRProvider } from "@/providers/swr-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = false;
  const Layout = isAdmin ? AdminLayout : UserLayout;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SWRProvider>
          <Layout>{children}</Layout>
        </SWRProvider>
      </body>
    </html>
  );
}
