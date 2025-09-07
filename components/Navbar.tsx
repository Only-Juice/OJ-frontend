"use client";

// next.js
import Link from "next/link";
import useSWR from "swr";
import { useState } from "react";

// utils
import { fetchWithRefresh } from "@/utils/fetchUtils";

// type
import { GiteaPublicKey } from "@/types/api";

export default function Navbar() {
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

  const openPublicKeyDialog = () => {
    (
      document.getElementById("public-key-dialog") as HTMLDialogElement
    )?.showModal();
  };

  const updateUserVisibility = async (newVisibility: boolean) => {
    mutateUserInfo(
      {
        ...userInfoData,
        data: { ...userInfoData?.data, is_public: newVisibility },
      },
      false
    );

    try {
      const response = await fetchWithRefresh(
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
    { href: "/questions", label: "Questions" },
    { href: "/exams", label: "Exams" },
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
              <a
                className="text-error cursor-pointer"
                onClick={async () => {
                  try {
                    await fetchWithRefresh(
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
      <PublicKeyDialog />
    </div>
  );
}

function PublicKeyDialog() {
  const { data, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/gitea/user/keys`
  );

  const [title, setTitle] = useState("");
  const [key, setKey] = useState("");

  const handleAddKey = () => {
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/gitea/user/keys`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: title,
          key: key,
        }),
      }
    )
      .then(() => {
        setTitle("");
        setKey("");
        mutate();
      })
      .catch((err) => {
        console.error("Failed to add key", err);
      });
  };

  const handleDeleteKey = (keyId: number) => {
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/gitea/user/keys`,
      {
        method: "DELETE",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: keyId,
        }),
      }
    )
      .then(() => {
        mutate();
      })
      .catch((err) => {
        console.error("Failed to delete key", err);
      });
  };

  return (
    <dialog id="public-key-dialog" className="modal">
      <div className="modal-box h-[80vh] w-11/12 max-w-7xl">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <fieldset className="fieldset">
          <label className="label">Title</label>
          <div>
            <input
              className="input w-full"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            ></input>
          </div>
          <label className="label">Public Key</label>
          <div>
            <textarea
              className="textarea w-full"
              placeholder="Public Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            ></textarea>
          </div>
        </fieldset>

        <div className="flex justify-end">
          <button className="btn btn-primary mt-4 mb-4" onClick={handleAddKey}>
            Add
          </button>
        </div>

        <table className="table ">
          <thead>
            <tr>
              <th>Title</th>
              <th>Key</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((key: GiteaPublicKey) => (
              <tr key={key.id}>
                <td>{key.title}</td>
                <td className="max-w-xs whitespace-pre-wrap break-words">
                  {key.key}
                </td>
                <td>
                  <button
                    className="btn btn-error"
                    onClick={() => handleDeleteKey(key.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </dialog>
  );
}
