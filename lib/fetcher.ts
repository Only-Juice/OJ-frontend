"use client";

// utils
import { refreshToken } from "@/utils/fetchUtils";
import { isTokenExpired, storeTokenExp } from "@/utils/tokenUtils";

// type
import { ApiResponse, RefreshTokenResponse } from "@/types/api";

export default async function fetcher(url: string, options?: RequestInit) {
  if (!isTokenExpired()) {
    return fetch(url, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      ...options,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Fetch failed with status ${res.status}`);
      }

      return res.json();
    });
  }
  return refreshToken()
    .then((response) => {
      if (!response.ok) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return response.json();
    })
    .then((json: ApiResponse<RefreshTokenResponse>) => {
      if (!json.success) {
        throw new Error(json.message || "Failed to refresh token");
      }
      storeTokenExp(json.data.access_token);
      return fetch(url, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        ...options,
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`Fetch failed with status ${res.status}`);
        }

        return res.json();
      });
    })
    .catch((error) => {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw error;
    });
}
