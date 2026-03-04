import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';

// Components
import Loading from '../common/Loading';

// Utils
import { getToken } from '../../utils';

// API
import { checkAdminApi } from '../../api/auth';

const CheckLoginRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 驗證登入
    useEffect(() => {
        // 檢查管理員權限
        const checkAdmin = async () => {
            // 輕微延遲，確保從登入頁導航過來時 Cookie 已完全寫入
            await new Promise((resolve) => setTimeout(resolve, 50));

            try {
                const token = getToken();

                // 沒有 token，直接設置未認證
                if (!token) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                // 驗證 Token 是否有效
                await checkAdminApi();

                // API 驗證成功
                setIsAuthenticated(true);
            } catch {
                // API 驗證失敗 - 靜默處理，不顯示錯誤訊息
                // 用戶會被導航到登入頁
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdmin();
    }, []);

    // 顯示 Loading
    if (isLoading) {
        return <Loading isLoading={isLoading} />;
    }

    // 驗證失敗，導航到登入頁
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 驗證成功，進入後台
    return children;
};

export default CheckLoginRoute;
