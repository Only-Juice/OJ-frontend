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
        .catch((_error) => {
          console.error("Login or user fetch failed:", _error);
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
    } catch (_error) {
      setError(true);
      console.error("OAuth login error:", _error);
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
                className="btn btn-outline w-full"
                style={{ borderColor: '#87ab63', color: '#87ab63' }}
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
                      <path d="M4.186 5.421C2.341 5.417-.13 6.59.006 9.531c.213 4.594 4.92 5.02 6.801 5.057.206.862 2.42 3.834 4.059 3.99h7.18c4.306-.286 7.53-13.022 5.14-13.07-3.953.186-6.296.28-8.305.296v3.975l-.626-.277-.004-3.696c-2.306-.001-4.336-.108-8.189-.298-.482-.003-1.154-.085-1.876-.087zm.261 1.625h.22c.262 2.355.688 3.732 1.55 5.836-2.2-.26-4.072-.899-4.416-3.285-.178-1.235.422-2.524 2.646-2.552zm8.557 2.315c.15.002.303.03.447.096l.749.323-.537.979a.672.597 0 0 0-.241.038.672.597 0 0 0-.405.764.672.597 0 0 0 .112.174l-.926 1.686a.672.597 0 0 0-.222.038.672.597 0 0 0-.405.764.672.597 0 0 0 .86.36.672.597 0 0 0 .404-.765.672.597 0 0 0-.158-.22l.902-1.642a.672.597 0 0 0 .293-.03.672.597 0 0 0 .213-.112c.348.146.633.265.838.366.308.152.417.253.45.365.033.11-.003.322-.177.694-.13.277-.345.67-.599 1.133a.672.597 0 0 0-.251.038.672.597 0 0 0-.405.764.672.597 0 0 0 .86.36.672.597 0 0 0 .404-.764.672.597 0 0 0-.137-.202c.251-.458.467-.852.606-1.148.188-.402.286-.701.2-.99-.086-.289-.35-.477-.7-.65-.23-.113-.517-.233-.86-.377a.672.597 0 0 0-.038-.239.672.597 0 0 0-.145-.209l.528-.963 2.924 1.263c.528.229.746.79.49 1.26l-2.01 3.68c-.257.469-.888.663-1.416.435l-4.137-1.788c-.528-.228-.747-.79-.49-1.26l2.01-3.679c.176-.323.53-.515.905-.53h.064z" />
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
