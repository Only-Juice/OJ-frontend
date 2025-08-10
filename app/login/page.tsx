"use client";

// next.js
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  async function handleLogin() {
    setError(false); // 每次嘗試登入前先清除錯誤提示

    try {
      const loginResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );

      if (!loginResponse.ok) {
        throw new Error("Login failed");
      }
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const userData = await userResponse.json();
      const isAdmin = userData?.is_admin ?? false;
      router.push(isAdmin ? "/admin" : "/questions");
    } catch (error) {
      setError(true); // 顯示錯誤訊息
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
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
