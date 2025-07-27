// 刷新 token
export async function refreshToken() {
  return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      accept: "application/json",
    },
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Refresh token failed");
      }

      return res.json();
    })
    .catch((err) => {
      throw new Error(`Error refreshing token: ${err.message}`);
    });
}

// 如果 401 就刷新 token

export function fetchWithRefresh(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  return fetch(input, init).then((res) => {
    if (res.status === 401) {
      // 第一次 401 → 試圖 refresh
      return refreshToken()
        .then(() => fetch(input, init)) // 重試
        .then((retryRes) => {
          if (retryRes.status === 401) {
            // 第二次還是 401 → 跳轉到 login
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            throw new Error(
              "Unauthorized after refresh — redirecting to login"
            );
          }
          return retryRes;
        })
        .catch((err) => {
          // refreshToken 本身失敗 → 跳轉 login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw err;
        });
    }

    return res;
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
