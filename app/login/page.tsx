"use client";

// next.js
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildGiteaOAuthURL } from "@/utils/oauthUtils";

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  async function handleLogin() {
    setError(false); // 每次嘗試登入前先清除錯誤提示

    try {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })
        .then((loginResponse) => {
          if (!loginResponse.ok) {
            throw new Error("Login failed");
          }
          return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
            method: "GET",
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
        })
        .then((userResponse) => userResponse.json())
        .then((userData) => {
          router.push(userData.data.is_admin ? "/admin" : "/questions");
        })
        .catch((error) => {
          console.error("Login or user fetch failed:", error);
        });
    } catch (error) {
      setError(true); // 顯示錯誤訊息
    }
  }

  async function handleOAuthLogin() {
    setOauthLoading(true);
    setError(false);

    try {
      // Generate OAuth URL directly in frontend
      const authURL = buildGiteaOAuthURL();

      // Redirect to Gitea OAuth authorization page
      window.location.href = authURL;
    } catch (error) {
      setError(true);
      console.error("OAuth login error:", error);
      setOauthLoading(false);
    }
  }

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Login Now!</h1>
          <p className="py-6">
            Welcome to Orange Juice, a platform for online judge.
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <fieldset className="fieldset">
              <label className="label">Usrename</label>
              <input
                id="username"
                type="username"
                className="input w-full"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
              />
              <label className="label">Password</label>
              <input
                id="password"
                type="password"
                className="input w-full"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <a className="link text-end link-hover">Forgot password?</a>
              <p
                className="text-red-500 mt-6 text-center"
                style={{ visibility: error ? "visible" : "hidden" }}
                id="error_message"
              >
                Login failed, please check your username and password.
              </p>
              <button className="btn btn-primary mt-4" onClick={handleLogin}>
                Login
              </button>

              {/* OAuth 分隔線 */}
              <div className="divider">OR</div>

              {/* Gitea OAuth 按鈕 */}
              <button
                className="btn btn-outline btn-secondary w-full"
                onClick={handleOAuthLogin}
                disabled={oauthLoading}
              >
                {oauthLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    連接到 Gitea...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                    使用 Gitea 登入
                  </>
                )}
              </button>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
