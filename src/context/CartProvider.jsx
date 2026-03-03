import { useState, useEffect, useCallback, useMemo } from 'react';
import { CartContext } from './CartContext';
import { getCartApi, updateCartApi, deleteCartApi, deleteCartAllApi, addCartApi } from '../api/front';
import useMessage from '../hooks/useMessage';

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ carts: [], total: 0, final_total: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [isFirstRender, setIsFirstRender] = useState(true);
    const [updatingItems, setUpdatingItems] = useState(new Set()); // 更新數量中
    const [deletingItems, setDeletingItems] = useState(new Set()); // 刪除中
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const { showError } = useMessage();

    // 取得購物車資料
    const getCart = useCallback(
        async (showLoading = false) => {
            if (showLoading) setIsLoading(true);
            try {
                const res = await getCartApi();
                setCart(res?.data?.data || { carts: [], total: 0, final_total: 0 });
            } catch (error) {
                showError(error?.response?.data?.message || '取得購物車資料失敗');
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
                showError(error?.response?.data?.message || '加入購物車失敗');
                setIsLoading(false);
            }
        },
        [getCart, showError]
    );

    // 更新數量（加入防連點機制）
    const updateCart = useCallback(
        async (cartId, product_id, qty) => {
            try {
                const numQty = Number(qty);

                // 數量不能少於1
                if (numQty < 1) {
                    showError('數量不能少於1');
                    return;
                }

                // 防止重複請求：如果該商品正在更新中，忽略新請求
                if (updatingItems.has(cartId)) {
                    showError(`商品 ${cartId} 正在更新中，忽略重複請求`);
                    return;
                }

                // 標記為更新中
                setUpdatingItems((prev) => new Set(prev).add(cartId));

                await updateCartApi(cartId, { product_id, qty: numQty });
                await getCart(false);
            } catch (error) {
                showError(error?.response?.data?.message || '更新商品數量失敗');
            } finally {
                // 移除更新中標記
                setUpdatingItems((prev) => {
                    const next = new Set(prev);
                    next.delete(cartId);
                    return next;
                });
            }
        },
        [getCart, updatingItems, showError]
    );

    // 刪除單一品項
    const deleteCart = useCallback(
        async (cartId) => {
            try {
                // 標記為刪除中
                setDeletingItems((prev) => new Set(prev).add(cartId));

                await deleteCartApi(cartId);
                await getCart(false);
            } catch (error) {
                showError(error?.response?.data?.message || '刪除商品失敗');
            } finally {
                // 移除刪除中標記
                setDeletingItems((prev) => {
                    const next = new Set(prev);
                    next.delete(cartId);
                    return next;
                });
            }
        },
        [getCart, showError]
    );

    // 刪除所有品項
    const deleteCartAll = useCallback(async () => {
        setIsDeletingAll(true);
        try {
            await deleteCartAllApi();
            await getCart(false);
        } catch (error) {
            showError(error?.response?.data?.message || '刪除所有商品失敗');
        } finally {
            setIsDeletingAll(false);
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
            updatingItems,
            deletingItems,
            addToCart,
            updateCart,
            deleteCart,
            deleteCartAll,
            isDeletingAll,
            getCart,
        }),
        [
            cart,
            isLoading,
            isFirstRender,
            updatingItems,
            deletingItems,
            addToCart,
            updateCart,
            deleteCart,
            deleteCartAll,
            isDeletingAll,
            getCart,
        ]
    );

    return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};
