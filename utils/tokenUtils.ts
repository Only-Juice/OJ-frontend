const TOKEN_EXP_KEY = "token_exp"; // <-- 常數

function parseJwt(token: string) {
  const base64Url = token.split(".")[1]; // 取第二段 payload
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

export function storeTokenExp(token: string) {
  try {
    const payload = parseJwt(token);
    if (payload.exp) {
      localStorage.setItem(TOKEN_EXP_KEY, payload.exp.toString());
      console.log("Token exp stored:", payload.exp);
    } else {
      console.warn("No exp field in token payload");
    }
  } catch (e) {
    console.error("Invalid token:", e);
  }
}

export function isTokenExpired(): boolean {
  const exp = localStorage.getItem(TOKEN_EXP_KEY);
  if (!exp) {
    console.warn("No token_exp in localStorage");
    return true; // 當作過期處理
  }
  const expTime = Number(exp) * 1000; // 轉成毫秒
  const now = Date.now();
  return now >= expTime;
}
