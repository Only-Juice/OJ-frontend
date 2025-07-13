"use client";
import { useRouter } from "next/navigation";

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

async function refreshToken() {
  const res = await fetch("${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh", {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Refresh token failed");
  }

  return res.json(); // 可視情況使用
}

export default async function fetcher(url: string, options?: RequestInit) {
  const doFetch = async () => {
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      ...options,
    });

    if (res.status === 401) {
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      throw new Error(`Fetch failed with status ${res.status}`);
    }

    return res.json();
  };

  try {
    return await doFetch();
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          await refreshToken();

          // 所有等待中的請求都重新觸發
          pendingRequests.forEach((cb) => cb());
          pendingRequests = [];
        } catch (err) {
          window.location.href = "/login"; // 重新導向到登入頁面
          
          throw new Error("Unable to refresh token");
        } finally {
          isRefreshing = false;
        }
      }

      // 等待 refresh 完後再重試請求
      return new Promise((resolve, reject) => {
        pendingRequests.push(async () => {
          try {
            const result = await doFetch();
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      });
    }

    throw error;
  }
}
