"use client";

// next.js
import Link from "next/link";
import useSWR from "swr";

// utils
import { fetchWithRefresh } from "@/utils/fetchUtils";
import { showAlert } from "@/utils/alertUtils";

// type
import { ApiResponse } from "@/types/api/common";
import { UserInfo, UserProfile } from "@/types/api/user";

// components
import { PublicKeyDialog, openPublicKeyDialog } from "./PublicKeyDialog";

export default function Navbar() {
  const { data: userData } = useSWR<ApiResponse<UserProfile>>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/gitea/user`
  );

  const { data: userInfoData, mutate: mutateUserInfo } = useSWR<
    ApiResponse<UserInfo>
  >(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`);

  const avatarUrl = userData?.data.avatar_url ?? null;
  const username = userData?.data.login ?? "";
  const userId = userData?.data.login ?? "";
  const isPublic = userInfoData?.data.is_public ?? false;

  const updateUserVisibility = (newVisibility: boolean) => {
    // 更新當前資料
    mutateUserInfo((currentData) => {
      if (!currentData?.data) return currentData; // 防呆
      return {
        ...currentData,
        data: {
          ...currentData.data,
          is_public: newVisibility,
        },
      };
    }, false);

    fetchWithRefresh(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/is_public`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ is_public: newVisibility }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update user visibility");
        }
        return response.json();
      })
      .then((json: ApiResponse<object>) => {
        if (!json.success) {
          throw new Error(json.message || "Failed to update user visibility");
        }
        showAlert("User visibility updated", "success");
      })
      .catch((error) => {
        showAlert(error.message, "error");
        mutateUserInfo();
      });
  };

  const handleLogout = () => {
    fetchWithRefresh(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Logout failed");
        }
        return response.json();
      })
      .then((json: ApiResponse<string>) => {
        if (!json.success) {
          throw new Error(json.message || "Logout failed");
        }
        showAlert("Logout successful", "success");
      })
      .catch((err) => {
        console.error("Logout failed", err);
      })
      .finally(() => {
        // 無論是否成功，都導向 login 頁;
        window.location.href = "/login";
      });
  };

  const links = [
    { href: "/questions", label: "Questions" },
    { href: "/exams", label: "Exams" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/rank", label: "Rank" },
  ];

  return (
    <div
      className="navbar bg-base-100 shadow-sm"
      style={{ top: 0, width: "100%", zIndex: 1000 }}
    >
      {/* navigation links */}
      <div className="flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="btn btn-ghost text-xl"
          >
            {link.label}
          </Link>
        ))}
      </div>
      {/* user info */}
      <div className="flex gap-5 items-center">
        <div className="lg:flex flex-col items-end">
          <p>{username}</p>
          <p className="text-sm">{userId}</p>
        </div>
        <div className="dropdown dropdown-end">
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
          <ul
            tabIndex={0}
            className="menu menu-md dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <label className="flex">
                Hide information
                <div className="flex-1"></div>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={async (e) => {
                    updateUserVisibility(e.target.checked);
                  }}
                  className="toggle toggle-primary"
                />
              </label>
            </li>
            <li>
              <a onClick={() => openPublicKeyDialog()}>(SSH) Settings</a>
            </li>
            <li>
              <a className="text-error cursor-pointer" onClick={handleLogout}>
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
      <PublicKeyDialog />
    </div>
  );
}
