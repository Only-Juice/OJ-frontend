"use client";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="card bg-base-100 w-96 shadow-sm">
        <div className="card-body p-10 ">
          <h2 className="card-title">Welcome to Orange Juice</h2>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Email</legend>
            <input type="email" className="input" />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Password</legend>
            <input type="Password" className="input" />
          </fieldset>
          <a href="#" className="text-end text-primary">
            Forget password?
          </a>
          <div className="h-15"></div>
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = "/problems")}
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
