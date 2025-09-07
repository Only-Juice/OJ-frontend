// type
import { ApiResponse, RefreshTokenResponse } from "@/types/api";

// utils
import { isTokenExpired, storeTokenExp } from "./tokenUtils";

// 刷新 token
export function refreshToken() {
  return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      accept: "application/json",
    },
    credentials: "include",
  });
}

// 如果過期就刷新 token
export function fetchWithRefresh(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  if (!isTokenExpired()) {
    return fetch(input, init);
  }

  return refreshToken()
    .then((response) => {
      if (!response.ok) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Unauthorized after refresh — redirecting to login");
      }

      return response.json();
    })
    .then((json: ApiResponse<RefreshTokenResponse>) => {
      if (!json.success) {
        throw new Error(json.message || "Failed to refresh token");
      }
      storeTokenExp(json.data.access_token);
      return fetch(input, init);
    })
    .catch((error) => {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw error;
    });
}

export async function takeQuestion(id: number) {
  return fetchWithRefresh(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/gitea/${id}/question`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
      },
      credentials: "include",
    }
  ).then((response) => {
    if (!response.ok) throw new Error("Failed to post data");
  });
}
