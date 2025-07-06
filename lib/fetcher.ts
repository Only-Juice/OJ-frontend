// lib/fetcher.ts
import Router from "next/router";

export default async function fetcher(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...options,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      Router.push("/login");
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error(`Fetch failed with status ${res.status}`);
  }

  const data = await res.json();
  return data;
}
