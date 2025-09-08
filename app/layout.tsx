import { Geist, Geist_Mono } from "next/font/google";
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SWRProvider>{children}</SWRProvider>

        {/* Alert container */}
        <div
          id="alert-container"
          className="absolute top-4 right-4 w-[25%] gap-2 flex flex-col z-9999"
        ></div>
      </body>
    </html>
  );
}
