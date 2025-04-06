"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function Profile() {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [username, setUsername] = useState("");
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
          setUsername(data.data.login);
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
    <div>
      <Navbar></Navbar>
      <div className="w-full pt-25 p-10 flex justify-center gap-10 min-h-screen">
        <div className="card flex-1 flex flex-col gap-10 items-center bg-base-100">
          <div className="card-body w-full">
            <h2 className="card-title">Sunmit history</h2>
            <ul className="list">
              {Array.from({ length: 3 }).map((_, index) => {
                return (
                  <li key={index} className="list-row">
                    <p>2025-01-{index + 1}</p>
                    <p>100</p>
                  </li>
                );
              })}
            </ul>
          </div>
          {/* <div className="card-body gap-5">
            <img src={avatarUrl} className="rounded-lg" />
            <h2 className="card-title">{username}</h2>
            {username}
            <button className="btn btn-primary">Edit Profile</button>
          </div> */}
        </div>
        <div className="flex-1 flex flex-col gap-10">
          <div className="flex-1 flex gap-10">
            {/* <div className="card flex-1 bg-base-200">
              <div className="card-body"></div>
            </div> */}
            <div className="card flex-1 bg-base-200">
              <div className="card-body">
                <div className="flex flex-wrap gap-4">
                  {Array.from({ length: 20 }).map((_, index) => {
                    const colors = ["#1CBABA", "#FFB700", "#F63737"];
                    const randomColor =
                      colors[Math.floor(Math.random() * colors.length)];
                    return (
                      <div
                        key={index}
                        className="w-12 h-12 flex  items-center justify-center text-white rounded"
                        style={{ backgroundColor: randomColor }}
                      ></div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="card flex-1 flex flex-col gap-10 items-center bg-base-100">
          </div>
        </div>
      </div>
    </div>
  );
}
