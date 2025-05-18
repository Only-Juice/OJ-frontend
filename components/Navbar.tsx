"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
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

    const fetchUserInfo = async () => {
      try {
        const response = await fetch("https://ojapi.ruien.me/api/user", {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setIsPublic(data.data.is_public);
        } else {
          console.error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserProfile();
    fetchUserInfo();
  }, []);

  const updateUserVisibility = async (isPublic: boolean) => {
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
          body: JSON.stringify({ is_public: isPublic }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update user visibility");
      }
    } catch (error) {
      console.error("Error updating user visibility:", error);
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
                      const newVisibility = e.target.checked;
                      setIsPublic(newVisibility);
                      await updateUserVisibility(newVisibility);
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
                    window.location.href = "/";
                  }}
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      // {/* <div className="pt-20 p-10 min-h-screen flex-col flex">
      //   <div className="breadcrumbs text-sm pb-7">
      //     <ul>
      //       {links.map((link) => (
      //         <li key={link.href}>
      //           <Link href={link.href}>{link.title}</Link>
      //         </li>
      //       ))}
      //     </ul>
      //   </div>
      //   {children}
      // </div> */}
  );
};

export default Navbar;
