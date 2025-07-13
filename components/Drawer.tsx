"use client";

import Link from "next/link";
import {
  UserRound,
  ChartColumnBig,
  Trophy,
  Award,
  FileText,
  LogOut,
} from "lucide-react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function Drawer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

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

  const { data: userData } = useSWR("https://ojapi.ruien.me/api/gitea/user");
  const { data: userInfoData } = useSWR("https://ojapi.ruien.me/api/user");

  const avatarUrl = userData?.data?.avatar_url ?? null;
  const username = userData?.data?.login ?? "";
  const isPublic = userInfoData?.data?.is_public ?? false;

  const handleLogout = useCallback(async () => {
    try {
      await fetch("https://ojapi.ruien.me/api/auth/logout", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      router.push("/login"); // SPA 跳轉
    }
  }, [router]);

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
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 gap-4">
          {/* 頭像與名稱 */}
          <li>
            <div className="flex items-center gap-4">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                {avatarUrl === null ? (
                  <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
                ) : (
                  <div
                    className={`avatar ${
                      isPublic ? "avatar-online" : "avatar-offline"
                    }`}
                  >
                    <div className="w-10 rounded-full">
                      <img alt="avatar" src={avatarUrl} />
                    </div>
                  </div>
                )}
              </div>
              <span className="text-lg font-medium">{username || "Guest"}</span>
            </div>
          </li>

          {/* 導覽連結 */}
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={`/admin${link.href}`}
                className="btn btn-ghost text-xl justify-start"
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.label}
              </Link>
            </li>
          ))}

          {/* 登出按鈕，推到底部 */}
          <li className="mt-auto">
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-error text-lg w-full justify-start"
            >
              <LogOut className="mr-2" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
