import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ThreeDots } from 'react-loader-spinner';
import useMessage from '../../hooks/useMessage';

// Components
import SideBar from '../../components/admin/SideBar';
import Pagination from '../../components/common/Pagination';

// Utils
import { removeToken, formatNumber } from '../../utils';

// API
import { logoutApi } from '../../api/auth';
import { updateProductApi } from '../../api/admin';

// Dashboard 元件
const Dashboard = ({ products, setProducts, getProducts, pagination, openModal }) => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useMessage();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [updatingStatusItems, setUpdatingStatusItems] = useState(new Set()); // 追蹤正在更新狀態的產品

    // 登出
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logoutApi();
            showSuccess('已成功登出！');
        } catch (error) {
            showError(error?.response?.data?.message || '登出失敗');
            setIsLoggingOut(false);
        } finally {
            // 清除 token 和狀態
            removeToken();
            setProducts([]);

            // 延遲導航，確保 Cookie 完全清除
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 50);
        }
    };

    // 更新產品狀態（加入防連點機制）
    const updateProductStatus = async (id) => {
        // 防止重複請求：如果該產品正在更新中，忽略新請求
        if (updatingStatusItems.has(id)) {
            return;
        }

        try {
            // 標記為更新中
            setUpdatingStatusItems((prev) => new Set(prev).add(id));

            const target = products.find((product) => product.id === id);
            const data = {
                data: {
                    ...target,
                    is_enabled: target.is_enabled === 1 ? 0 : 1,
                },
            };
            const res = await updateProductApi(id, data);
            showSuccess(res?.data?.message || '更新產品狀態成功');

            setProducts((prev) =>
                prev.map((item) => (item.id === id ? { ...item, is_enabled: data.data.is_enabled } : item))
            );
        } catch (error) {
            showError(error?.response?.data?.message || '更新產品狀態失敗');
        } finally {
            // 移除更新中標記
            setUpdatingStatusItems((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    return (
        <section className="dashboard d-flex">
            <SideBar />
            <div className="content d-flex flex-column flex-grow-1 p-4">
                <nav className="navbar navbar-expand-lg bg-white shadow-sm rounded-2 mb-4">
                    <div className="container-fluid">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">後台</li>
                            <li className="breadcrumb-item active">旅程管理</li>
                        </ol>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? (
                                <div className="d-flex justify-content-center align-items-center gap-2">
                                    <span className="fs-11">登出中</span>
                                    <ThreeDots color="currentColor" width="20" height="10" />
                                </div>
                            ) : (
                                '登出'
                            )}
                        </button>
                    </div>
                </nav>
                <div className="d-flex justify-content-end mb-4">
                    <button
                        type="button"
                        className="btn btn-primary text-white d-flex align-items-center"
                        onClick={() => {
                            openModal('add');
                        }}
                    >
                        <span className="material-symbols-outlined fs-10">add</span>
                        新增商品
                    </button>
                </div>
                <div className="bg-white shadow-sm rounded-2 p-4">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle text-center">
                            <thead>
                                <tr>
                                    <th scope="col">景觀</th>
                                    <th scope="col">分類</th>
                                    <th scope="col">商品名稱</th>
                                    <th scope="col">原價</th>
                                    <th scope="col">售價</th>
                                    <th scope="col">庫存</th>
                                    <th scope="col" className="text-center">
                                        啟用
                                    </th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => {
                                    return (
                                        <tr key={product.id}>
                                            <td>
                                                <img
                                                    className="img-thumbnail"
                                                    src={`${product.imageUrl}?q=80&w=300&auto=format&fit=crop`}
                                                    alt={product.title}
                                                />
                                            </td>
                                            <td>{product.category}</td>
                                            <td>{product.title}</td>
                                            <td>{formatNumber(product.origin_price)}</td>
                                            <td>{formatNumber(product.price)}</td>
                                            <td>{formatNumber(product.ticket_quantity)}</td>
                                            <td className="text-center">
                                                <div className="form-check form-switch d-flex justify-content-center align-items-center">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={product.is_enabled === 1}
                                                        onChange={() => updateProductStatus(product.id)}
                                                        disabled={updatingStatusItems.has(product.id)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="text-nowrap">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success rounded-lg me-2"
                                                    onClick={() => {
                                                        openModal('preview', product);
                                                    }}
                                                >
                                                    預覽
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary rounded-lg me-2"
                                                    onClick={() => {
                                                        openModal('edit', product);
                                                    }}
                                                >
                                                    編輯
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger rounded-lg"
                                                    onClick={() => {
                                                        openModal('delete', product);
                                                    }}
                                                >
                                                    刪除
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <Pagination pagination={pagination} onChangePage={getProducts} />
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
