/**
 * OAuth 相關的工具函數
 */

// OAuth state interface
export interface OAuthState {
    state: string;
    timestamp: number;
    clientIP?: string;
}

/**
 * 生成隨機的 OAuth state
 * @returns 隨機生成的 state 字符串
 */
export function generateOAuthState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * 存儲 OAuth state 到 localStorage
 * @param state OAuth state 字符串
 * @param expirationMs 過期時間（毫秒），默認 5 分鐘
 */
export function storeOAuthState(state: string, expirationMs: number = 5 * 60 * 1000): void {
    const stateObj: OAuthState = {
        state,
        timestamp: Date.now(),
    };

    const encodedState = btoa(JSON.stringify(stateObj));
    localStorage.setItem('oauth_state', encodedState);

    // 設置過期清理
    setTimeout(() => {
        localStorage.removeItem('oauth_state');
    }, expirationMs);
}

/**
 * 驗證 OAuth state
 * @param receivedState 從 OAuth 回調中收到的 state
 * @param maxAgeMs 最大允許的 state 年齡（毫秒），默認 5 分鐘
 * @returns 驗證結果對象
 */
export function verifyOAuthState(
    receivedState: string,
    maxAgeMs: number = 5 * 60 * 1000
): { valid: boolean; error?: string } {
    const storedStateData = localStorage.getItem('oauth_state');

    if (!storedStateData) {
        return { valid: false, error: 'No stored OAuth state found' };
    }

    try {
        const stateObj: OAuthState = JSON.parse(atob(storedStateData));

        // 驗證 state 是否匹配
        if (stateObj.state !== receivedState) {
            return { valid: false, error: 'OAuth state mismatch' };
        }

        // 檢查 state 是否過期
        const isExpired = Date.now() - stateObj.timestamp > maxAgeMs;
        if (isExpired) {
            return { valid: false, error: 'OAuth state expired' };
        }

        // 驗證成功，清理存儲的 state
        localStorage.removeItem('oauth_state');

        return { valid: true };

    } catch (error) {
        return { valid: false, error: 'Failed to parse OAuth state' };
    }
}

/**
 * 構建 Gitea OAuth 授權 URL
 * @param options OAuth 配置選項
 * @returns OAuth 授權 URL
 */
export function buildGiteaOAuthURL(options?: {
    giteaURL?: string;
    clientID?: string;
    redirectURI?: string;
    scopes?: string[];
}): string {
    const state = generateOAuthState();
    storeOAuthState(state);

    // 使用傳入的選項或環境變量作為默認值
    const giteaURL = options?.giteaURL || process.env.NEXT_PUBLIC_GITEA_URL || 'http://localhost:3000';
    const clientID = options?.clientID || process.env.NEXT_PUBLIC_GITEA_CLIENT_ID || 'your-client-id';
    const redirectURI = options?.redirectURI || process.env.NEXT_PUBLIC_OAUTH_CALLBACK_URL || `${window.location.origin}/oauth`;
    const scopes = options?.scopes || ["read:user"];

    const params = new URLSearchParams({
        client_id: clientID,
        redirect_uri: redirectURI,
        response_type: 'code',
        scope: scopes.join(' '),
        state: state,
        access_type: 'offline',
    });

    return `${giteaURL}/login/oauth/authorize?${params.toString()}`;
}
