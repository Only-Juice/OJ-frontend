"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="card bg-base-100 w-96 shadow-sm">
        <div className="card-body p-10 ">
          <h2 className="card-title">Welcome to Orange Juice</h2>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Username</legend>
            <input id="username" type="text" className="input" />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Password</legend>
            <input id="password" type="Password" className="input" />
          </fieldset>
          <a href="#" className="text-end text-primary">
            Forget password?
          </a>
          <div className="h-15"></div>
          <button
            className="btn btn-primary"
            onClick={() => {
              const usernameInput = document.getElementById(
                "username"
              ) as HTMLInputElement;
              const passwordInput = document.getElementById(
                "password"
              ) as HTMLInputElement;
              const username = usernameInput?.value;
              const password = passwordInput?.value;

              fetch("https://ojapi.ruien.me/api/gitea/auth", {
                method: "POST",
                headers: {
                  accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  username,
                  password,
                }),
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("Network response was not ok");
                  }
                  return response.json();
                })
                .then((data) => {
                  console.log("Success:", data);
                  router.push("/problem");
                })
                .catch((error) => {
                  console.error("Error:", error);
                });
            }}
          >
            Login
          </button>
          <div className="h-2"></div>
          <p className="text-center">
            Don't have an account?{" "}
            <a href="#" className="text-primary">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
