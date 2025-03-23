"use client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
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
        >
          <div className="w-10 rounded-full">
            <img
              alt="Only Juice"
              src="https://avatars.githubusercontent.com/u/184535404?s=200&v=4"
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
