"use client";

// third-party
import Papa from "papaparse";

// next.js
import { useState, useRef } from "react";

// components
import PaginationTable from "@/components/PaginationTable";

// icons
import { Plus, RotateCcw } from "lucide-react";

// type
import { Account, ApiResponse } from "@/types/api/common";
import {
  FailedUser,
  ImportAccount,
} from "@/types/api/admin/account/importAccount";

// utils
import { fetchWithRefresh } from "@/utils/fetchUtils";
import { showAlert } from "@/utils/alertUtils";

export type ImportUserRow = {
  username: string;
  email: string;
  password: string;
};

export default function AccountPage() {
  const importUserModalRef = useRef<HTMLDialogElement>(null);

  const [previewUsers, setPreviewUsers] = useState<ImportUserRow[]>([]);
  const [failedUsers, setFailedUsers] = useState<FailedUser[]>([]);

  const updateUser = (userId: number, is_public: boolean, enable: boolean) => {
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${userId}/user`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          enable: enable,
          is_public: is_public,
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          showAlert("Failed to update user status", "error");
          return;
        }
        return response.json();
      })
      .then((json: ApiResponse<object>) => {
        if (json.success === false) {
          showAlert(json.message || "Failed to update user status", "error");
          return;
        }
        showAlert("User status updated", "success");
      })
      .catch((error) => {
        showAlert("Failed to update user status: " + error.message, "error");
      });
  };

  // 當選擇檔案後觸發
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<ImportUserRow>(file as File, {
      header: true, // 讀取第一行作為欄位名稱
      skipEmptyLines: true, // 跳過空行
      complete: (results) => {
        // results.data 會是陣列 [{username: "...", email: "...", password: "..."}, ...]
        setPreviewUsers(results.data);
      },
      error: (err) => {
        console.error("解析錯誤：", err);
      },
    });
  };

  const handleImport = async () => {
    if (previewUsers.length === 0) {
      return;
    }
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/gitea/admin/user/bulk_v2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          user: previewUsers,
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Import failed");
        }
        return response.json();
      })
      .then((json: ApiResponse<ImportAccount>) => {
        if (json.success === false) {
          throw new Error(json.message || "Import failed");
        }
        if (Object.keys(json.data.failed_users).length > 0) {
          setFailedUsers(json.data.failed_users);
          showAlert(
            `There are ${
              Object.keys(json.data.failed_users).length
            } users failed to import. Please download the failed list.`,
            "error"
          );
          return;
        }
        debugger;
        showAlert("Import successful", "success");
        setPreviewUsers([]);
        setFailedUsers([]);
        importUserModalRef.current?.close();
      })
      .catch((err) => {
        showAlert("Import failed: " + err.message, "error");
      });
  };

  // TODO 可以使用寄信的
  function resetPassword(userId: number) {
    if (!confirm("確定要重置密碼嗎？這將會生成一個新的隨機密碼。")) {
      return;
    }
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${userId}/user/reset_password`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        credentials: "include",
        body: "", // 空字串
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "重置密碼失敗");
        }
        const data = await res.json();
        alert(`密碼重置成功！新密碼是：${data.data.password}`);
      })
      .catch((e) => {
        alert("錯誤：" + e.message);
      });
  }

  const downloadCSV = () => {
    // 將 FailedUser[] 轉成 PapaParse 可以解析的平面陣列
    const flatData = Object.entries(failedUsers).map(
      ([username, failedReason]) => ({
        username,
        failedReason,
      })
    );

    // 用 PapaParse 轉成 CSV
    const csv = Papa.unparse(flatData);

    // 下載
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "failed_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col flex-1 max-h-full">
      <div className="flex justify-end mb-4 gap-4">
        <div
          className="btn btn-primary"
          onClick={() => {
            setPreviewUsers([]);
            setFailedUsers([]);
            importUserModalRef.current?.showModal();
          }}
        >
          Import User
          <Plus />
        </div>
        <div
          className="btn btn-primary"
          onClick={openCreateSingleAccountDialog}
        >
          Create User
          <Plus />
        </div>
      </div>
      <PaginationTable<Account>
        classname="table-lg"
        url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/user`}
        totalField="total_count"
        dataField="items"
        theadShow={() => (
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Enable</th>
            <th>Reset Password</th>
          </tr>
        )}
        tbodyShow={(item, index) => (
          <tr key={index}>
            <td>{item.id}</td>
            <td>{item.user_name}</td>
            <td>{item.email}</td>
            <td>
              {item.is_admin ? (
                <div className="text-gray-500">Admin</div>
              ) : (
                <input
                  type="checkbox"
                  defaultChecked={item.enable}
                  className="toggle toggle-primary"
                  onChange={(e) => {
                    updateUser(item.id, item.is_public, e.target.checked);
                  }}
                />
              )}
            </td>
            <td>
              <div
                className="btn btn-primary btn-sm"
                onClick={() => resetPassword(item.id)}
              >
                Reset Password
                <RotateCcw />
              </div>
            </td>
          </tr>
        )}
      />

      {/* ⬇️ modal import_account_modal */}
      <dialog
        id="import_account_modal"
        className="modal"
        ref={importUserModalRef}
      >
        <div className="modal-box h-[80vh] w-11/12 max-w-7xl flex flex-col">
          {/* 關閉按鈕 */}
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          <h3 className="font-bold text-lg mb-4">Import User</h3>

          {/* 上方區域 */}
          <div className="flex flex-row items-center gap-4 flex-shrink-0">
            <input
              type="file"
              className="file-input"
              onChange={handleFileChange}
              onClick={(e) => (e.currentTarget.value = "")}
              onDrop={(e) => (e.currentTarget.value = "")}
            />
            <a
              href="/example.csv"
              download="import_template.csv"
              className="btn btn-primary"
            >
              Download example file
            </a>
          </div>

          {/* table 區域（可滾動） */}
          <div className="flex-1 overflow-y-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Password</th>
                </tr>
              </thead>
              <tbody>
                {previewUsers.map((user, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 下方按鈕區 */}
          <div className="flex justify-end mt-4 flex-shrink-0 gap-4">
            {Object.keys(failedUsers).length > 0 && (
              <button className="btn btn-error" onClick={downloadCSV}>
                Download failed users
              </button>
            )}

            <button className="btn btn-primary" onClick={handleImport}>
              Import
            </button>
          </div>
        </div>
      </dialog>
      <CreateSingleAccountDialog />
    </div>
  );
}

function openCreateSingleAccountDialog() {
  const dialog = document.getElementById(
    "create_single_account_modal"
  ) as HTMLDialogElement;
  dialog.showModal();
}

function closeCreateSingleAccountDialog() {
  const dialog = document.getElementById(
    "create_single_account_modal"
  ) as HTMLDialogElement;
  dialog.close();
}

function CreateSingleAccountDialog() {
  const formRef = useRef<HTMLFormElement>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateUser = () => {
    fetchWithRefresh(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/gitea/admin/user/bulk_v2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          user: [{ username, email, password }],
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Import failed");
        }
        return response.json();
      })
      .then((json: ApiResponse<ImportAccount>) => {
        if (json.success === false) {
          throw new Error(json.message || "Import failed");
        }
        if (Object.keys(json.data.failed_users).length > 0) {
          showAlert(
            `Failed to create user: ${Object.values(
              json.data.failed_users
            ).join(", ")}`,
            "error"
          );
          return;
        }
        showAlert("User created successfully", "success");
        formRef.current?.reset();
        closeCreateSingleAccountDialog();
      })
      .catch((error) => {
        showAlert("Create user failed: " + error.message, "error");
      });
  };

  return (
    <dialog
      id="create_single_account_modal"
      className="modal"
      onClose={() => formRef.current?.reset()}
    >
      <div className="modal-box flex flex-col">
        {/* 關閉按鈕 */}
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateUser();
          }}
          ref={formRef}
        >
          <fieldset className="fieldset">
            <legend className="text-lg font-bold mb-4">Create User</legend>
            <label className="label">Username</label>
            <div>
              <input
                type="text"
                className="input input-bordered w-full validator"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="validator-hint">Username is required</p>
            </div>
            <label className="label">Email</label>
            <div>
              <input
                type="email"
                className="input input-bordered w-full validator"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="validator-hint">Email is required</p>
            </div>
            <label className="label">Password</label>
            <div>
              <input
                type="password"
                className="input input-bordered w-full validator"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="validator-hint">Password is required</p>
            </div>
          </fieldset>
          <button className="btn btn-primary mt-4 self-end" onClick={() => {}}>
            Create User
          </button>
        </form>
      </div>
    </dialog>
  );
}
