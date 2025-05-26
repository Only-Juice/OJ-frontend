"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/Navbar";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideNavbar = ["/login"].includes(pathname);

  return !hideNavbar ? (
    <div>
      <Navbar />
      <main className="pt-20 p-10 min-h-screen flex-col flex">{children}</main>
    </div>
  ) : (
    <main>{children}</main>
  );
}
