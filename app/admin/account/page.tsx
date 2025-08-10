"use client";

// next.js
import { useState } from "react";

// components
import Breadcrumbs from "@/components/Breadcrumbs";
import PaginationTable from "@/components/PaginationTable";

// icons
import { Plus, RotateCcw, ChevronRight } from "lucide-react";

// type
import { Account } from "@/types/api";

// utils
import { fetchWithRefresh } from "@/utils/apiUtils";

export default function AccountPage() {
  const links = [{ title: "Account", href: "/admin/account" }];

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [previewUsers, setPreviewUsers] = useState<
    { username: string; email: string; password: string }[]
  >([]);

  const addToTable = () => {
    setPreviewUsers((prev) => [...prev, { username, email, password }]);
    setUsername("");
    setEmail("");
    setPassword("");
  };

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

  // ⬇️ 當選擇檔案後觸發
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;

      const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      // setRawUsernames(lines); // 儲存原始使用者名稱
    };

    reader.readAsText(file);
  };

  // const handleCreateAccounts = async () => {
  //   if (!domain || !defaultPassword || previewUsers.length === 0) {
  //     alert("請輸入 domain、預設密碼並上傳使用者清單");
  //     return;
  //   }

  //   try {
  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/gitea/admin/user/bulk`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           accept: "application/json",
  //         },
  //         credentials: "include",
  //         body: JSON.stringify({
  //           default_password: defaultPassword,
  //           email_domain: domain,
  //           usernames: rawUsernames, // 只要 username 陣列
  //         }),
  //       }
  //     );

  //     const result = await res.json();

  //     if (!res.ok) {
  //       throw new Error(result.message || "建立失敗");
  //     }

  //     // 顯示結果
  //     const failed = Object.keys(result.data.failed_users || {});
  //     const success = result.data.successful_users || [];

  //     alert(
  //       `成功建立 ${success.length} 位使用者\n失敗 ${
  //         failed.length
  //       } 位\n${failed.join(", ")}`
  //     );

  //     // 關閉 modal
  //     (
  //       document.getElementById("create_account_modal") as HTMLDialogElement
  //     )?.close();
  //   } catch (err: any) {
  //     console.error(err);
  //     alert("建立失敗：" + err.message);
  //   }
  // };

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
    <div className="w-full">
      <Breadcrumbs links={links} />
      <div className="flex flex-col w-full gap-10">
        <PaginationTable<Account>
          classname="table-lg"
          url={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/user`}
          limit={15}
          totalField="total"
          dataField="items"
          theadShow={() => (
            <tr>
              <th>Id</th>
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
                <input
                  type="checkbox"
                  defaultChecked={item.enable}
                  className="toggle toggle-primary"
                  onChange={async (e) => {
                    await updateUser(item.id, item.is_public, e.target.checked);
                  }}
                />
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
      </div>
      <div className="fixed bottom-4 right-4">
        <div
          className="btn btn-primary"
          onClick={() => {
            setPreviewUsers([]);
            (
              document.getElementById(
                "create_account_modal"
              ) as HTMLDialogElement
            )?.showModal();
          }}
        >
          Create User
          <Plus />
        </div>
      </div>
      {/* ⬇️ modal */}
      <dialog id="create_account_modal" className="modal">
        <div className="modal-box max-h-[90vh] w-11/12 max-w-7xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Create User</h3>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <fieldset className="fieldset">
                  <legend className="legend">Add single user</legend>
                  <label className="label">Username</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input w-full"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label className="label">Password</label>
                  <input
                    type="password"
                    className="input w-full"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="btn btn-primary mt-4 w-full"
                    onClick={addToTable}
                  >
                    Add to table
                    <ChevronRight />
                  </button>
                </fieldset>
                <div className="divider"></div>
                <fieldset className="fieldset">
                  {/* TODO: example file or example image */}
                  <legend className="legend">Add from CSV</legend>
                  <input
                    type="file"
                    className="file-input"
                    onChange={handleFileChange}
                  />
                </fieldset>
              </div>
              <div className="divider divider-horizontal"></div>
              <div className="flex-2">
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
            </div>
            <button className="btn btn-primary">Create</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
