"use client";

import Link from "next/link";
import {
  UserRound,
  ChartColumnBig,
  Trophy,
  Award,
  FileText,
} from "lucide-react";

export default function Drawer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const links = [
    {
      href: "/problem",
      label: "Problems",
      icon: <FileText />,
    },
    { href: "/contest", label: "Contests", icon: <Trophy /> },
    { href: "/dashboard", label: "Dashboard", icon: <ChartColumnBig /> },
    { href: "/rank", label: "Rank", icon: <Award /> },
    { href: "/account", label: "Account", icon: <UserRound /> },
  ];

  return (
    <div className="drawer drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content p-10 flex">{children}</div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={`/admin${link.href}`}
              className="btn btn-ghost text-xl justify-start"
            >
              {link.icon && <span className="mr-2">{link.icon}</span>}
              {link.label}
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
