"use client";

// next.js
import { useState } from "react";

// utils
import { fetchWithRefresh } from "@/utils/fetchUtils";
import { showAlert } from "@/utils/alertUtils";

// components
import PasswordInput from "./PasswordInput";

// type
import { ApiResponse } from "@/types/api/common";
import { ApiError } from "@/types/api/error";
import { logout } from "@/utils/authUtils";

const DIALOG_ID = "change-password-dialog";

export function ChangePasswordDialog() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleChangePassword = () => {
    if (newPassword !== confirmNewPassword) {
      showAlert("New password and confirmation do not match.", "error");
      return;
    }

    // Call API to change password
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/change_password`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          new_password: newPassword,
          old_password: oldPassword,
        }),
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((json: ApiResponse<object>) => {
        if (!json.success) {
          throw new ApiError(json.message || "Failed to change password");
        }
        showAlert("Password changed successfully", "success");
      })
      .then(() => {
        closeChangePasswordDialog();
        // Clear input fields
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        logout();
      })
      .catch((error) => {
        if (error instanceof ApiError) {
          showAlert(error.message, "error");
        } else {
          showAlert("An unexpected error occurred.", "error");
        }
      });
  };

  return (
    <dialog id={DIALOG_ID} className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <fieldset className="fieldset">
          <label className="label">Old Password</label>
          <PasswordInput
            value={oldPassword}
            onChange={setOldPassword}
            placeholder="Old Password"
          />
          <label className="label">New Password</label>
          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            placeholder="New Password"
          />
          <label className="label">Confirm New Password</label>
          <PasswordInput
            value={confirmNewPassword}
            onChange={setConfirmNewPassword}
            placeholder="Confirm New Password"
          />
          <button
            className="btn btn-primary mt-4"
            onClick={handleChangePassword}
          >
            Change Password
          </button>
        </fieldset>
      </div>
    </dialog>
  );
}

export function openChangePasswordDialog() {
  (document.getElementById(DIALOG_ID) as HTMLDialogElement)?.showModal();
}

export function closeChangePasswordDialog() {
  (document.getElementById(DIALOG_ID) as HTMLDialogElement)?.close();
}
