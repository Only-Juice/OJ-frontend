// lib/fetcher.ts
import Cookies from "js-cookie";

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${Cookies.get("auth")}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
  });

export default fetcher;
