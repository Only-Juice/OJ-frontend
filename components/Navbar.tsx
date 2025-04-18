"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("https://ojapi.ruien.me/api/gitea/user", {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAvatarUrl(data.data.avatar_url);
          setUsername(data.data.login);
          setUserId(data.data.login);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div
      className="navbar bg-base-100 shadow-sm"
      style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
    >
      <div className="flex-1">
        <Link href="/problem" className="btn btn-ghost text-xl">
          Problems
        </Link>
        <Link href="#" className="btn btn-ghost text-xl">
          Contests
        </Link>
        <Link href="/dashboard" className="btn btn-ghost text-xl">
          Dashboard
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
              // <div className="avatar avatar-online">
              <div className="w-10 rounded-full">
                <img alt="avatar" src={avatarUrl} />
              </div>
              // </div>
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
                  defaultChecked
                  className="toggle toggle-primary"
                />
                Hide information
              </label>
            </li>
            <li>
              <a>(SSH) Settings</a>
            </li>
            <li>
              <a className="text-secondary">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
