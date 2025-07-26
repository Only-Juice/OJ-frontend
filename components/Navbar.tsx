"use client";

// next.js
import Link from "next/link";
import useSWR from "swr";

const Navbar = () => {
  const { data: userData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/gitea/user`
  );

  const { data: userInfoData, mutate: mutateUserInfo } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/user`
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/is_public`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
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

  const links = [
    { href: "/problem", label: "Problems" },
    { href: "/contest", label: "Contests" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/rank", label: "Rank" },
  ];

  return (
    <div
      className="navbar bg-base-100 shadow-sm"
      style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
    >
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
                className="text-error cursor-pointer"
                onClick={async () => {
                  try {
                    await fetch(
                      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
                      {
                        method: "POST",
                        headers: {
                          accept: "application/json",
                          "Content-Type": "application/json",
                        },
                        credentials: "include",
                      }
                    );
                  } catch (err) {
                    console.error("Logout failed", err);
                  } finally {
                    // 無論是否成功，都導向 login 頁
                    window.location.href = "/login";
                  }
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
