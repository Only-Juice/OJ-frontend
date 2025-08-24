"use client";

// third-party
import Papa from "papaparse";

// next.js
import { useState, useRef } from "react";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import PaginationTable from "@/components/PaginationTable";

// icons
import { Plus, RotateCcw } from "lucide-react";

// type
import { Account } from "@/types/api";

// utils
import { fetchWithRefresh } from "@/utils/apiUtils";

export type ImportUserRow = {
  username: string;
  email: string;
  password: string;
};

export default function AccountPage() {
  const links = [{ title: "Account", href: "/admin/account" }];

  const importUserModalRef = useRef<HTMLDialogElement>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [previewUsers, setPreviewUsers] = useState<ImportUserRow[]>([]);

  const updateUser = async (
    userId: number,
    is_public: boolean,
    enable: boolean
  ) => {
    await fetchWithRefresh(
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
    );
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
      .then((res) => {
        if (!res.ok) {
          throw new Error("匯入失敗");
        }
        alert("匯入成功！");
        setPreviewUsers([]);
        importUserModalRef.current?.close();
      })
      .catch((err) => {
        console.error("匯入失敗：", err);
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

  return (
    <div className="w-full flex flex-col">
      <Breadcrumbs links={links} />
      <div className="flex justify-end mb-4 gap-4">
        <div
          className="btn btn-primary"
          onClick={() => {
            setPreviewUsers([]);
            importUserModalRef.current?.showModal();
          }}
        >
          Import User
          <Plus />
        </div>
        <div className="btn btn-primary" onClick={() => {}}>
          Create User
          <Plus />
        </div>
      </div>
      <PaginationTable<Account>
        classname="table-lg"
        url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/user`}
        totalField="totalCount"
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
        tbodyShow={(item, rowIndex, total, page) => (
          <tr key={rowIndex}>
            <td>{item.id}</td>
            <td>{item.user_name}</td>
            <td>{item.email}</td>
            <td>
              {!item.is_admin && (
                <input
                  type="checkbox"
                  defaultChecked={item.enable}
                  className="toggle toggle-primary"
                  onChange={async (e) => {
                    await updateUser(item.id, item.is_public, e.target.checked);
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
            />
            <a
              className="link link-primary"
              href="/example.csv"
              download="import_template.csv"
            >
              example file
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
          <div className="flex justify-end mt-4 flex-shrink-0">
            <button className="btn btn-primary" onClick={handleImport}>
              Import
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
