// lib/fetcher.ts
const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
  });

export default fetcher;
