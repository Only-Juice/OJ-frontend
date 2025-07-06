"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import useSWR from "swr";
import { Plus } from "lucide-react";

export default function AccountPage() {
  const links = [{ title: "Account", href: "/admin/account" }];

  const { data: usersData } = useSWR(`https://ojapi.ruien.me/api/admin/user`);

  const users = usersData?.data || [];

  const updateUser = async (userId, is_public, enable) => {
    await fetch(`https://ojapi.ruien.me/api/admin/user/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enable: enable,
        is_public: is_public,
      }),
    });
  };

  return (
    <div className="w-full">
      <Breadcrumbs links={links} />
      <div className="flex flex-col w-full gap-10">
        <div className="w-full flex justify-end">
          <div className="btn btn-primary">
            Create User
            <Plus />
          </div>
        </div>
        <table className="table table-zebra table-lg">
          {/* head */}
          <thead>
            <tr>
              {/* <th></th> */}
              <th>Id</th>
              <th>Username</th>
              <th>Email</th>
              <th>Enable</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item, index) => (
              <tr
                key={index}
                //   onClick={async () => {
                //     router.push(`/admin/problem/update/${item.id}`);
                //   }}
                className="cursor-pointer"
              >
                {/* <th>{item.id}</th> */}
                <td>{item.id}</td>
                <td>{item.username}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
