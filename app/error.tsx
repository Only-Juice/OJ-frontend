// app/error.js
"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="text-error">
      <h1>發生錯誤了</h1>
      <p>{error.message}</p>
      <button onClick={reset} className="btn btn-primary mt-4">
        重試
      </button>
      <p className="mt-2">或請聯絡管理員</p>
    </div>
  );
}
