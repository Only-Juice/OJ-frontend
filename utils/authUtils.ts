import { fetchWithRefresh } from "./fetchUtils";
import { showAlert } from "./alertUtils";
import { ApiResponse } from "@/types/api/common";

export function logout() {
  fetchWithRefresh(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      return response.json();
    })
    .then((json: ApiResponse<string>) => {
      if (!json.success) {
        throw new Error(json.message || "Logout failed");
      }
      showAlert("Logout successful", "success");
    })
    .catch((err) => {
      console.error("Logout failed", err);
    })
    .finally(() => {
      setTimeout(() => {
        window.location.href = "/login";
      }, 500); // 1秒後跳轉
    });
}
