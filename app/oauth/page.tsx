'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOAuthState } from '@/utils/oauthUtils';

type OAuthStatus =
    | 'loading'
    | 'admin'
    | 'dashboard'
    | 'invalid_state'
    | 'missing_code'
    | 'token_exchange_failed'
    | 'gitea_client_failed'
    | 'user_info_failed'
    | 'no_gitea_token'
    | 'token_generation_failed';

interface StatusConfig {
    title: string;
    message: string;
    type: 'success' | 'error' | 'loading';
    redirectTo?: string;
    redirectDelay?: number;
}

const statusConfigs: Record<OAuthStatus, StatusConfig> = {
    loading: {
        title: '處理中...',
        message: '正在處理OAuth登入，請稍候...',
        type: 'loading'
    },
    admin: {
        title: '登入成功！',
        message: '您已成功登入，即將重新導向至管理頁面...',
        type: 'success',
        redirectTo: '/admin',
        redirectDelay: 2000
    },
    dashboard: {
        title: '登入成功！',
        message: '您已成功登入，即將重定向到儀表板...',
        type: 'success',
        redirectTo: '/dashboard',
        redirectDelay: 2000
    },
    invalid_state: {
        title: '登入失敗',
        message: 'OAuth狀態驗證失敗，可能是安全性問題。請重新嘗試登入。',
        type: 'error',
        redirectTo: '/login',
        redirectDelay: 5000
    },
    missing_code: {
        title: '登入失敗',
        message: '缺少授權碼，OAuth流程異常。請重新嘗試登入。',
        type: 'error',
        redirectTo: '/login',
        redirectDelay: 5000
    },
    token_exchange_failed: {
        title: '登入失敗',
        message: 'Token 交換失敗，無法完成登入。請重新嘗試。',
        type: 'error',
        redirectTo: '/login',
        redirectDelay: 5000
    },
    gitea_client_failed: {
        title: '登入失敗',
        message: 'Gitea客戶端初始化失敗，請聯繫系統管理員。',
        type: 'error',
        redirectTo: '/login',
        redirectDelay: 5000
    },
    user_info_failed: {
        title: '登入失敗',
        message: '無法獲取用戶資訊，請重新嘗試登入。',
        type: 'error',
        redirectTo: '/login',
        redirectDelay: 5000
    },
    no_gitea_token: {
        title: '登入失敗',
        message: '未找到Gitea Token，請改用密碼登入。',
        type: 'error',
        redirectTo: '/login',
        redirectDelay: 5000
    },
    token_generation_failed: {
        title: '登入失敗',
        message: 'Token 生成失敗，請重新嘗試登入。',
        type: 'error',
        redirectTo: '/login',
        redirectDelay: 5000
    }
};

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-base-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-base-100 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center text-base-content">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">載入中...</h2>
                            <p className="mb-6">正在處理OAuth登入，請稍候...</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <OAuthCallbackContent />
        </Suspense>
    );
}

function OAuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<OAuthStatus>('loading');
    const [countdown, setCountdown] = useState<number>(5);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            // 如果有code和state，說明這是從Gitea回來的callback
            if (code && state) {
                try {
                    console.log('Processing OAuth callback with code:', code.substring(0, 10) + '...', 'and state:', state.substring(0, 10) + '...');

                    // 驗證前端生成的 state
                    const stateVerification = verifyOAuthState(state);
                    if (!stateVerification.valid) {
                        console.error('OAuth state verification failed:', stateVerification.error);
                        setStatus('invalid_state');
                        return;
                    }

                    // 調用後端API處理OAuth callback
                    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/oauth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
                    console.log('Calling API:', apiUrl);

                    const response = await fetch(apiUrl, {
                        method: 'GET',
                        credentials: 'include', // 包含cookies
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                    });

                    console.log('API Response status:', response.status);
                    const data = await response.json();
                    console.log('API Response data:', data);

                    if (response.ok && data.success) {
                        // 檢查用戶是否為管理員（從API返回的data中獲取）
                        const isAdmin = data.data; // 根據新API，data欄位包含isAdmin的布林值
                        console.log('User is admin:', isAdmin);

                        if (isAdmin) {
                            setStatus('admin');
                        } else {
                            setStatus('dashboard');
                        }
                    } else {
                        // 根據錯誤訊息設置相應的錯誤狀態
                        const errorMessage = data.message || '';

                        if (errorMessage.includes('state')) {
                            if (errorMessage.includes('mismatch')) {
                                setStatus('invalid_state');
                            } else if (errorMessage.includes('Missing')) {
                                setStatus('invalid_state');
                            } else if (errorMessage.includes('expired')) {
                                setStatus('invalid_state');
                            } else {
                                setStatus('invalid_state');
                            }
                        } else if (errorMessage.includes('authorization code')) {
                            setStatus('missing_code');
                        } else if (errorMessage.includes('exchange')) {
                            setStatus('token_exchange_failed');
                        } else if (errorMessage.includes('Gitea client')) {
                            setStatus('gitea_client_failed');
                        } else if (errorMessage.includes('user info')) {
                            setStatus('user_info_failed');
                        } else if (errorMessage.includes('Gitea token')) {
                            setStatus('no_gitea_token');
                        } else if (errorMessage.includes('generate tokens')) {
                            setStatus('token_generation_failed');
                        } else {
                            // 預設錯誤狀態
                            setStatus('token_exchange_failed');
                        }
                    }
                } catch (error) {
                    console.error('OAuth callback error:', error);
                    setStatus('token_exchange_failed');
                }
            } else {
                // 如果沒有任何參數，可能是直接訪問這個頁面
                setStatus('missing_code');
            }
        };

        handleOAuthCallback();
    }, [searchParams]);

    useEffect(() => {
        const config = statusConfigs[status];

        if (config.redirectTo && config.redirectDelay) {
            const redirectTimer = setTimeout(() => {
                router.push(config.redirectTo!);
            }, config.redirectDelay);

            // 設置倒數計時
            const startTime = Date.now();
            const countdownInterval = setInterval(() => {
                setCountdown(() => {
                    const elapsed = Date.now() - startTime;
                    const remaining = Math.max(0, Math.ceil((config.redirectDelay! - elapsed) / 1000));
                    return remaining;
                });
            }, 100);

            setCountdown(Math.ceil(config.redirectDelay / 1000));

            return () => {
                clearTimeout(redirectTimer);
                clearInterval(countdownInterval);
            };
        }
    }, [status, router]);

    const config = statusConfigs[status];

    const getStatusIcon = () => {
        switch (config.type) {
            case 'success':
                return (
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case 'loading':
            default:
                return (
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-base-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-base-100 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center text-base-content">
                        {getStatusIcon()}

                        <h2 className="text-2xl font-bold mb-2">
                            {config.title}
                        </h2>

                        <p className="mb-6">
                            {config.message}
                        </p>

                        {config.redirectTo && countdown > 0 && (
                            <div className="text-sm mb-4">
                                {countdown} 秒後自動重定向...
                            </div>
                        )}

                        {config.type === 'error' && (
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    返回登入頁面
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    重新整理頁面
                                </button>
                            </div>
                        )}

                        {config.type === 'success' && (
                            <button
                                onClick={() => router.push(`/${status}`)}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                {status === 'admin' ? '前往管理頁面' : '前往儀表板'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}