"use client";

// next.js
import useSWR from "swr";
import { useState, useEffect } from "react";

// components
import Breadcrumbs from "@/components/Breadcrumbs";

// icons
import { Plus, RotateCcw } from "lucide-react";

export default function AccountPage() {
  const links = [{ title: "Account", href: "/admin/account" }];
  const { data: usersData, mutate: mutateUsers } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/user`
  );
  const users = usersData?.data || [];

  const [domain, setDomain] = useState("");
  const [defaultPassword, setDefaultPassword] = useState("");
  const [rawUsernames, setRawUsernames] = useState<string[]>([]);
  const [previewUsers, setPreviewUsers] = useState<
    { username: string; email: string }[]
  >([]);

  useEffect(() => {
    const users = rawUsernames.map((username) => ({
      username,
      email: `${username}@${domain}`,
    }));
    console.log(users);
    setPreviewUsers(users);
  }, [rawUsernames, domain]);

  const updateUser = async (userId, is_public, enable) => {
    await fetch(
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

      setRawUsernames(lines); // 儲存原始使用者名稱
    };

    reader.readAsText(file);
  };

  const handleCreateAccounts = async () => {
    if (!domain || !defaultPassword || previewUsers.length === 0) {
      alert("請輸入 domain、預設密碼並上傳使用者清單");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/gitea/admin/user/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            default_password: defaultPassword,
            email_domain: domain,
            usernames: rawUsernames, // 只要 username 陣列
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "建立失敗");
      }

      // 顯示結果
      const failed = Object.keys(result.data.failed_users || {});
      const success = result.data.successful_users || [];

      alert(
        `成功建立 ${success.length} 位使用者\n失敗 ${
          failed.length
        } 位\n${failed.join(", ")}`
      );

      await mutateUsers();
      // 關閉 modal
      (
        document.getElementById("create_account_modal") as HTMLDialogElement
      )?.close();
    } catch (err: any) {
      console.error(err);
      alert("建立失敗：" + err.message);
    }
  };

  function resetPassword(userId: number) {
    if (!confirm("確定要重置密碼嗎？這將會生成一個新的隨機密碼。")) {
      return;
    }
    fetch(
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
        <table className="table table-zebra table-lg">
          <thead>
            <tr>
              <th>Id</th>
              <th>Username</th>
              <th>Email</th>
              <th>Enable</th>
              <th>Reset Password</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item, index) => (
              <tr key={index} className="cursor-pointer">
                <td>{item.id}</td>
                <td>{item.user_name}</td>
                <td>{item.email}</td>
                <td>
                  <input
                    type="checkbox"
                    defaultChecked={item.enable}
                    className="toggle toggle-primary"
                    onChange={async (e) => {
                      await updateUser(
                        item.id,
                        item.is_public,
                        e.target.checked
                      );
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
            ))}
          </tbody>
        </table>
      </div>
      <div className="fixed bottom-4 right-4">
        <div
          className="btn btn-primary"
          onClick={() => {
            setRawUsernames([]);
            setDomain("");
            setDefaultPassword("");
            document.getElementById("create_account_modal")?.showModal();
          }}
        >
          Create User
          <Plus />
        </div>
      </div>
      {/* ⬇️ modal */}
      <dialog id="create_account_modal" className="modal">
        <div className="modal-box max-h-[90vh]">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Create User</h3>

          <div className="flex flex-col gap-4">
            {/* ⬇️ input file，觸發處理函式 */}
            <input
              type="file"
              className="file-input"
              onChange={handleFileChange}
            />

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Domain: ( e.g. example.com )"
                className="input input-bordered w-full"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <input
                type="text"
                placeholder="Default Password: ( e.g. password )"
                className="input input-bordered w-full"
                value={defaultPassword}
                onChange={(e) => setDefaultPassword(e.target.value)}
              />
            </div>

            {/* ⬇️ 預覽 txt 中的帳號資料 */}
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>username</th>
                  <th>email</th>
                </tr>
              </thead>
              <tbody>
                {previewUsers.map((user, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="btn btn-primary" onClick={handleCreateAccounts}>
              Create
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
