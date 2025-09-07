"use client";

import Link from "next/link";
import { UserRound, Trophy, FileText, LogOut } from "lucide-react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { fetchWithRefresh } from "@/utils/fetchUtils";

export default function Drawer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const links = [
    {
      href: "/questions",
      label: "Questions",
      icon: <FileText />,
    },
    { href: "/exams", label: "Exams", icon: <Trophy /> },
    { href: "/account", label: "Account", icon: <UserRound /> },
  ];

  const { data: userData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/gitea/user`
  );
  const { data: userInfoData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/user`
  );

  const avatarUrl = userData?.data?.avatar_url ?? null;
  const username = userData?.data?.login ?? "";
  const isPublic = userInfoData?.data?.is_public ?? false;

  const handleLogout = async () => {
    fetchWithRefresh(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Logout failed");
      }
      // 登出成功後，重定向到登入頁面
      router.push("/login");
    });
  };

  return (
    <div className="drawer drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content p-10 flex h-screen">{children}</div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 gap-4">
          {/* 頭像與名稱 */}
          <li className="pointer-events-none hover:bg-transparent">
            <div className="flex items-center gap-4">
              <div tabIndex={0} role="button" className="avatar">
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
              <span className="text-lg font-medium ">
                {username || "Guest"}
              </span>
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
