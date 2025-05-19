"use client";

import Link from "next/link";
import useSWR from "swr";

const Navbar = () => {
  const { data: userData } = useSWR("https://ojapi.ruien.me/api/gitea/user");

  const { data: userInfoData, mutate: mutateUserInfo } = useSWR(
    "https://ojapi.ruien.me/api/user"
  );

  const avatarUrl = userData?.data?.avatar_url ?? null;
  const username = userData?.data?.login ?? "";
  const userId = userData?.data?.login ?? "";
  const isPublic = userInfoData?.data?.is_public ?? false;

  const updateUserVisibility = async (newVisibility: boolean) => {
    mutateUserInfo(
      {
        ...userInfoData,
        data: { ...userInfoData?.data, is_public: newVisibility },
      },
      false
    );

    try {
      const response = await fetch(
        "https://ojapi.ruien.me/api/user/is_public",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ is_public: newVisibility }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update user visibility");
        mutateUserInfo();
      }
    } catch (error) {
      console.error("Error updating user visibility:", error);
      mutateUserInfo();
    }
  };

  return (
    <div
      className="navbar bg-base-100 shadow-sm"
      style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
    >
      <div className="flex-1">
        <Link href="/problem" className="btn btn-ghost text-xl">
          Problems
        </Link>
        <Link href="/contest" className="btn btn-ghost text-xl">
          Contests
        </Link>
        <Link href="/dashboard" className="btn btn-ghost text-xl">
          Dashboard
        </Link>
        <Link href="/rank" className="btn btn-ghost text-xl">
          Rank
        </Link>
      </div>
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
              <label className="fieldset-label">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={async (e) => {
                    updateUserVisibility(e.target.checked);
                  }}
                  className="toggle toggle-primary"
                />
                Hide information
              </label>
            </li>
            <li>
              <a>(SSH) Settings</a>
            </li>
            <li>
              <a
                className="text-error"
                onClick={() => {
                  sessionStorage.removeItem("authToken");
                  window.location.href = "/login";
                }}
              >
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
