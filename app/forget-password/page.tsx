"use client";

import Link from "next/link";
// next.js
import { useState } from "react";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [isSend, setIsSend] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();

    setIsSend(false);
    setIsError(false);

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/forget_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setIsSend(true);
      })
      .catch((error) => {
        setIsError(true);
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="card card bg-base-100 w-96 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">
            Enter your email address to receive a password reset link.
          </h2>
          <form>
            <fieldset className="fieldset">
              <input
                id="email"
                type="email"
                className="input w-full"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="btn btn-primary w-full mt-4"
                onClick={handleSend}
              >
                Send Reset Link
              </button>
            </fieldset>
          </form>
          {isSend && (
            <div className="alert alert-success">
              <p>
                Password reset link sent! Please check your email.{" "}
                <a href="/login" className="underline">
                  Click here
                </a>{" "}
                to return to the login page.
              </p>
            </div>
          )}
          {isError && (
            <div className="alert alert-error">
              <p>
                Error sending reset link. Please ensure the email is correct and
                try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
