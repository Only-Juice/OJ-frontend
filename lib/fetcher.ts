"use client";

// utils
import { refreshToken } from "@/utils/apiUtils";

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

export default async function fetcher(url: string, options?: RequestInit) {
  const doFetch = async () => {
    return fetch(url, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      ...options,
    }).then((res) => {
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        throw new Error(`Fetch failed with status ${res.status}`);
      }

      return res.json();
    });
  };

  try {
    return await doFetch();
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          await refreshToken();

          pendingRequests.forEach((cb) => cb());
          pendingRequests = [];
        } catch (err) {
          window.location.href = "/login";

          throw new Error("Unable to refresh token");
        } finally {
          isRefreshing = false;
        }
      }

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
