"use client";
import { useRouter } from "next/navigation";

export default function Root() {
  const router = useRouter();

  function handleLogin() {
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
        // console.log("Success:", data);
        sessionStorage.setItem("authToken", data.data);
        router.push("/problem");
      })
      .catch((error) => {
        document.getElementById("error_message")!.style.visibility = "visible";
        // console.error("Error:", error);
      });
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
              />
              <label className="label">Password</label>
              <input
                id="password"
                type="password"
                className="input w-full"
                placeholder="Password"
              />
              {/* <div> */}
              <a className="link text-end link-hover">Forgot password?</a>
              {/* </div> */}
              <p
                className="text-red-500 mt-6 text-center"
                style={{ visibility: "hidden" }}
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
