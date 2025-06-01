// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// 可保護的路徑清單
const protectedPaths = ["/problem", "/contest", "/dashboard", "/rank"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 如果目前路徑不在保護清單內，允許通過
  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth");

  // 如果沒有 authToken，就跳轉到 /login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 如果有 token，正常繼續
  return NextResponse.next();
}
