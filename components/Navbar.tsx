"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState("");

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
        <a
          className="btn btn-ghost text-xl"
          onClick={() => router.push("/problem")}
        >
          Problems
        </a>
        <a
          className="btn btn-ghost text-xl"
          onClick={() => router.push("/problem")}
        >
          Contests
        </a>
      </div>
      <div className="flex ">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle avatar"
          onClick={() => router.push("/profile")}
        >
          <div className="w-10 rounded-full">
            <img
              src={avatarUrl}
            />
          </div>
        </div>
      </div>
      {/* <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered w-24 md:w-auto"
        />
        <div className="dropdown dropdown-end">
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <a>Logout</a>
            </li>
          </ul>
        </div>
      </div> */}
    </div>
  );
}
