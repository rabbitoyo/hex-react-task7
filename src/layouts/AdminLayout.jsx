import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Modal } from 'bootstrap';
import useMessage from '../hooks/useMessage';

// Components
import Loading from '../components/common/Loading';
import Dashboard from '../pages/admin/Dashboard';
import ProductModal from '../components/admin/ProductModal';

// Utils
import { getToken } from '../utils';

// API
import { checkAdminApi } from '../api/auth';
import { getProductsApi } from '../api/admin';

// 產品初始資料
const initialProduct = {
    id: '',
    title: '',
    category: '',
    origin_price: 0,
    price: 0,
    unit: '',
    ticket_quantity: 0,
    description: '',
    content: '',
    is_enabled: 0,
    imageUrl: '',
    imagesUrl: [],
};

const AdminLayout = () => {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [templateProduct, setTemplateProduct] = useState(initialProduct);

    // Modal 相關的 ref
    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);

    const [modalType, setModalType] = useState('');

    const { showError } = useMessage();

    // 取得產品
    const getProducts = useCallback(
        async (page = 1) => {
            try {
                const res = await getProductsApi(page);
                setProducts(res.data.products);
                setPagination(res.data.pagination);
            } catch (error) {
                showError(error.response.data.message);
            }
        },
        [showError]
    );

    // 驗證登入
    useEffect(() => {
        // 檢查管理員權限
        const checkAdmin = async () => {
            try {
                setIsLoading(true);
                setIsCheckingAuth(true);

                const token = getToken();

                if (!token) {
                    navigate('/login');
                    return;
                }

                // 驗證 Token 是否有效
                await checkAdminApi();

                await getProducts();
            } catch (error) {
                showError(error.response.data.message);
            } finally {
                setIsLoading(false);
                setIsCheckingAuth(false);
            }
        };
        checkAdmin();
    }, [navigate, showError, getProducts]);

    // 建立 Modal 實例
    useEffect(() => {
        if (!modalRef.current) return;
        modalInstanceRef.current = new Modal(modalRef.current, {
            keyboard: false, // 禁止使用 ESC 關閉
        });

        modalRef.current.addEventListener('hide.bs.modal', () => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        });

        // 清理函式
        return () => {
            if (modalInstanceRef.current) {
                modalInstanceRef.current.dispose();
            }
        };
    }, []);

    // 彈窗開關狀態
    const openModal = (type, product = initialProduct) => {
        setModalType(type);
        setTemplateProduct({
            ...initialProduct,
            ...product,
        });
        modalInstanceRef.current.show();
    };
    const closeModal = () => {
        modalInstanceRef.current.hide();
    };

    return (
        <>
            {/* Loading */}
            <Loading isLoading={isLoading} />

            {/* Dashboard */}
            {!isCheckingAuth && (
                <Dashboard
                    products={products}
                    setProducts={setProducts}
                    getProducts={getProducts}
                    pagination={pagination}
                    setIsLoading={setIsLoading}
                    openModal={openModal}
                />
            )}

            {/* Modal */}
            <ProductModal
                modalRef={modalRef}
                getProducts={getProducts}
                templateProduct={templateProduct}
                modalType={modalType}
                closeModal={closeModal}
            />
        </>
    );
};
export default AdminLayout;
