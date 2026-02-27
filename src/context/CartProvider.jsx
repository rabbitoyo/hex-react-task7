import { useState, useEffect, useCallback, useMemo } from 'react';
import { CartContext } from './CartContext';
import { getCartApi, updateCartApi, deleteCartApi, deleteCartAllApi, addCartApi } from '../api/front';
import useMessage from '../hooks/useMessage';

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ carts: [], total: 0, final_total: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [isFirstRender, setIsFirstRender] = useState(true);
    const { showError } = useMessage();

    // 取得購物車資料
    const getCart = useCallback(
        async (showLoading = false) => {
            if (showLoading) setIsLoading(true);
            try {
                const res = await getCartApi();
                setCart(res?.data?.data || { carts: [], total: 0, final_total: 0 });
            } catch (error) {
                showError(error.response.data.message);
            } finally {
                if (showLoading) {
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 1500);
                }
                setIsFirstRender(false);
            }
        },
        [showError]
    );

    // 加入購物車
    const addToCart = useCallback(
        async (product_id, qty = 1) => {
            setIsLoading(true);
            try {
                const res = await addCartApi({ product_id, qty: Number(qty) });
                // 異步刷新購物車，不等待結果，讓 loading 狀態在 Cart 頁面顯示
                getCart(true);
                return res;
            } catch (error) {
                showError(error.response.data.message);
                setIsLoading(false);
            }
        },
        [getCart, showError]
    );

    // 更新數量
    const updateCart = useCallback(
        async (cartId, product_id, qty) => {
            try {
                const numQty = Number(qty);
                // 數量不能少於1
                if (numQty < 1) {
                    showError('數量不能少於1');
                    return;
                }
                await updateCartApi(cartId, { product_id, qty: numQty });
                await getCart(false);
            } catch (error) {
                showError(error.response.data.message);
            }
        },
        [getCart, showError]
    );

    // 刪除單一品項
    const deleteCart = useCallback(
        async (cartId) => {
            try {
                await deleteCartApi(cartId);
                await getCart(false);
            } catch (error) {
                showError(error.response.data.message);
            }
        },
        [getCart, showError]
    );

    // 刪除所有品項
    const deleteCartAll = useCallback(async () => {
        try {
            await deleteCartAllApi();
            await getCart(false);
        } catch (error) {
            showError(error.response.data.message);
        }
    }, [getCart, showError]);

    // 初始化載入購物車資料
    useEffect(() => {
        getCart(true);
    }, [getCart]);

    const contextValue = useMemo(
        () => ({
            cart,
            isLoading,
            isFirstRender,
            addToCart,
            updateCart,
            deleteCart,
            deleteCartAll,
            getCart,
        }),
        [cart, isLoading, isFirstRender, addToCart, updateCart, deleteCart, deleteCartAll, getCart]
    );

    return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};
