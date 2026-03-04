import { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from 'bootstrap';
import useMessage from '../hooks/useMessage';

// Components
import Loading from '../components/common/Loading';
import Dashboard from '../pages/admin/Dashboard';
import ProductModal from '../components/admin/ProductModal';

// API
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
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [templateProduct, setTemplateProduct] = useState(initialProduct);

    // Modal 相關的 ref
    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);
    const isModalInitialized = useRef(false);

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
                showError(error?.response?.data?.message || '取得產品列表失敗');
            } finally {
                // 只在初次載入後關閉 loading
                if (isLoading) {
                    setIsLoading(false);
                }
            }
        },
        [showError, isLoading]
    );

    // 初始化：取得產品列表
    useEffect(() => {
        getProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 建立 Modal 實例（等待 Loading 完成後才初始化）
    useEffect(() => {
        if (isLoading || !modalRef.current || isModalInitialized.current) return;

        const modalElement = modalRef.current;

        modalInstanceRef.current = new Modal(modalElement, {
            keyboard: false, // 禁止使用 ESC 關閉
        });

        const handleHide = () => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        };

        modalElement.addEventListener('hide.bs.modal', handleHide);
        isModalInitialized.current = true;

        // 清理函式
        return () => {
            modalElement.removeEventListener('hide.bs.modal', handleHide);
            if (modalInstanceRef.current) {
                modalInstanceRef.current.dispose();
                modalInstanceRef.current = null;
                isModalInitialized.current = false;
            }
        };
    }, [isLoading]);

    // 彈窗開關狀態
    const openModal = (type, product = initialProduct) => {
        // 如果 Modal 還沒初始化，先初始化
        if (!modalInstanceRef.current && modalRef.current && !isModalInitialized.current) {
            modalInstanceRef.current = new Modal(modalRef.current, {
                keyboard: false,
                backdrop: 'static',
            });
            isModalInitialized.current = true;
        }

        setModalType(type);
        setTemplateProduct({
            ...initialProduct,
            ...product,
        });

        // 確保 Modal 實例存在
        if (modalInstanceRef.current) {
            modalInstanceRef.current.show();
        }
    };
    const closeModal = () => {
        if (modalInstanceRef.current) {
            modalInstanceRef.current.hide();
        }
    };

    // Loading 時顯示載入畫面
    if (isLoading) {
        return <Loading isLoading={isLoading} />;
    }

    return (
        <>
            {/* Dashboard */}
            <Dashboard
                products={products}
                setProducts={setProducts}
                getProducts={getProducts}
                pagination={pagination}
                openModal={openModal}
            />

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
