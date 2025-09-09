"use client";

// next.js
import useSWR from "swr";
import { useState } from "react";

// utils
import { fetchWithRefresh } from "@/utils/fetchUtils";
import { showAlert } from "@/utils/alertUtils";

// types
import { ApiResponse } from "@/types/api/common";
import { GiteaPublicKey } from "@/types/api/giteaPublicKey";

const DIALOG_ID = "public-key-dialog";

export function PublicKeyDialog() {
  const { data, mutate } = useSWR<ApiResponse<GiteaPublicKey[]>>(
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
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add key");
        }
        return response.json();
      })
      .then((json: ApiResponse<string>) => {
        if (!json.success) {
          throw new Error(json.message || "Failed to add key");
        }
        showAlert("Key added successfully", "success");
      })
      .then(() => {
        setTitle("");
        setKey("");
        mutate();
      })
      .catch((error) => {
        showAlert(error.message, "error");
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
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete key");
        }
        return response.json();
      })
      .then((json: ApiResponse<string>) => {
        if (!json.success) {
          throw new Error(json.message || "Failed to delete key");
        }
        showAlert("Key deleted successfully", "success");
      })
      .then(() => {
        mutate();
      })
      .catch((error) => {
        showAlert(error.message, "error");
      });
  };

  return (
    <dialog id={DIALOG_ID} className="modal">
      <div className="modal-box h-[80vh] w-[80vw] max-w-7xl">
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

        <div className="overflow-y-auto h-[60%]">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Key</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((key: GiteaPublicKey) => (
                <tr key={key.id}>
                  <td>{key.title}</td>
                  <td className="max-w-xs truncate">{key.key}</td>
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
      </div>
    </dialog>
  );
}

export function openPublicKeyDialog() {
  (document.getElementById(DIALOG_ID) as HTMLDialogElement)?.showModal();
}
