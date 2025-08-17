# OAuth 設置指南

## 概述

此項目已經修改為在前端直接生成 OAuth 授權 URL，而不是通過後端 API。這提供了更好的安全性和用戶體驗。

## 環境變量設置

請創建一個 `.env.local` 文件（基於 `.env.local.example`）並設置以下環境變量：

```env
# API Base URL for backend requests
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Gitea OAuth Configuration
NEXT_PUBLIC_GITEA_URL=http://localhost:3000
NEXT_PUBLIC_GITEA_CLIENT_ID=your-gitea-oauth-client-id

# OAuth Callback URL (should match the one configured in Gitea)
NEXT_PUBLIC_OAUTH_CALLBACK_URL=http://localhost:3001/oauth
```

## Gitea OAuth 應用程序設置

1. 登入您的 Gitea 實例
2. 前往 **Settings** > **Applications**
3. 在 **OAuth2 Applications** 部分點擊 **Create a new OAuth2 Application**
4. 填寫應用程序資訊：
   - **Application Name**: OJ Frontend
   - **Redirect URI**: `http://localhost:3001/oauth` (與 `NEXT_PUBLIC_OAUTH_CALLBACK_URL` 一致)
5. 創建應用程序後，複製 **Client ID** 並設置到 `NEXT_PUBLIC_GITEA_CLIENT_ID`

## OAuth 流程說明

### 1. 登入流程

1. 用戶點擊 "使用 Gitea 登入" 按鈕
2. 前端生成隨機 `state` 並存儲在 `localStorage`
3. 用戶被重定向到 Gitea OAuth 授權頁面
4. 用戶授權後，Gitea 重定向回 `/oauth` 頁面，帶有 `code` 和 `state` 參數

### 2. 回調處理

1. 前端驗證 `state` 是否匹配和未過期
2. 調用後端 API `/auth/oauth/callback` 處理 `code` 交換
3. 根據用戶角色重定向到相應頁面

### 3. 安全特性

- **State 驗證**: 防止 CSRF 攻擊
- **時間戳檢查**: State 在 5 分鐘後自動過期
- **客戶端存儲**: State 存儲在 `localStorage`，頁面刷新後自動清理

## 文件結構

```
app/
├── login/page.tsx          # 登入頁面，包含 OAuth 按鈕
└── oauth/page.tsx          # OAuth 回調處理頁面

utils/
└── oauthUtils.ts           # OAuth 相關工具函數
```

## 主要函數

### `buildGiteaOAuthURL()`

生成 Gitea OAuth 授權 URL，包括 state 生成和存儲。

### `verifyOAuthState()`

驗證從 OAuth 回調收到的 state 是否有效。

### `generateOAuthState()`

生成加密安全的隨機 state 字符串。

## 故障排除

### 常見錯誤

1. **OAuth state mismatch**: 檢查是否正確設置了環境變量
2. **OAuth state expired**: State 有效期為 5 分鐘，超時需要重新開始流程
3. **No stored OAuth state found**: 可能是 localStorage 被清理或用戶禁用了本地存儲

### 調試提示

- 檢查瀏覽器 Console 中的錯誤訊息
- 確認 Gitea OAuth 應用程序的 Redirect URI 設置正確
- 驗證環境變量是否正確載入（可以在瀏覽器中檢查 `process.env`）

## 後端 API 要求

後端仍然需要處理 `/auth/oauth/callback` 端點，但不再需要 `/auth/oauth/login` 端點。後端應該：

1. 驗證收到的 `code` 和 `state`
2. 與 Gitea 交換 access token
3. 獲取用戶資訊
4. 創建用戶會話
5. 返回用戶角色資訊

## 優點

- **更好的安全性**: State 在前端生成和驗證，減少服務器端狀態管理
- **減少 API 調用**: 不需要額外的 API 調用來獲取授權 URL
- **更快的響應**: 直接重定向，無需等待服務器響應
- **離線友好**: 即使後端暫時不可用，也可以啟動 OAuth 流程
