import { useState, useCallback, useMemo } from 'react';
import { OrderContext } from './OrderContext';
import { submitOrderApi, getOrdersApi, getOrderDetailApi, payOrderApi } from '../api/front';
import useMessage from '../hooks/useMessage';

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaying, setIsPaying] = useState(false); // 付款中狀態
    const { showError } = useMessage();

    // 送出訂單
    const submitOrder = useCallback(
        async (data) => {
            setIsSubmitting(true);
            try {
                const res = await submitOrderApi(data);
                return res;
            } catch (error) {
                showError(error?.response?.data?.message || '訂單提交失敗');
                throw error;
            } finally {
                setIsSubmitting(false);
            }
        },
        [showError]
    );

    // 取得所有訂單
    const getOrders = useCallback(
        async (showLoading = true) => {
            if (showLoading) setIsLoading(true);
            try {
                const res = await getOrdersApi();
                setOrders(res.data.orders || []);
                return res.data;
            } catch (error) {
                showError(error?.response?.data?.message || '取得訂單失敗');
                throw error;
            } finally {
                if (showLoading) {
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 1500);
                }
            }
        },
        [showError]
    );

    // 取得單一訂單詳細資料
    const getOrderDetail = useCallback(
        async (orderId, showLoading = true) => {
            if (showLoading) setIsLoading(true);
            try {
                const res = await getOrderDetailApi(orderId);
                setCurrentOrder(res.data.order);
                return res.data.order;
            } catch (error) {
                showError(error?.response?.data?.message || '取得訂單詳情失敗');
                throw error;
            } finally {
                if (showLoading) {
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 1500);
                }
            }
        },
        [showError]
    );

    // 付款
    const payOrder = useCallback(
        async (orderId) => {
            setIsPaying(true);
            try {
                const res = await payOrderApi(orderId);
                // 付款成功後重新取得訂單詳情更新狀態（不顯示 loading）
                await getOrderDetail(orderId, false);
                return res.data;
            } catch (error) {
                showError(error?.response?.data?.message || '付款失敗');
                throw error;
            } finally {
                setIsPaying(false);
            }
        },
        [getOrderDetail, showError]
    );

    // 清除當前訂單
    const clearCurrentOrder = useCallback(() => {
        setCurrentOrder(null);
    }, []);

    const contextValue = useMemo(
        () => ({
            orders,
            currentOrder,
            isLoading,
            isSubmitting,
            isPaying,
            submitOrder,
            getOrders,
            getOrderDetail,
            payOrder,
            clearCurrentOrder,
        }),
        [
            orders,
            currentOrder,
            isLoading,
            isSubmitting,
            isPaying,
            submitOrder,
            getOrders,
            getOrderDetail,
            payOrder,
            clearCurrentOrder,
        ]
    );

    return <OrderContext.Provider value={contextValue}>{children}</OrderContext.Provider>;
};
