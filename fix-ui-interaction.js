const fs = require('fs');
const path = require('path');

const appTsxPath = 'apps/web-pos/src/app/app.tsx';
const appTsxContent = `import React, { useEffect, useState } from 'react';
import { AppThemeProvider } from './theme-provider';
import { PosLayout } from '../features/pos/PosLayout';
import { ProductCard } from '../features/menu/ProductCard';
import { Spin, Empty, Button, List, Typography, Modal, message, App as AntdApp } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useCartStore } from '../stores/cart.store';

const { Text } = Typography;

const apiClient = axios.create({
  baseURL: 'http://localhost:3333/api/v1',
  timeout: 10000,
});

interface Product {
  id: number;
  name: string;
  basePrice: number;
  imageUrl: string;
  variants: any[];
}

// Component con chứa logic chính
function PosApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, totalAmount, clearCart } = useCartStore();

  // SỬ DỤNG HOOKS THAY VÌ STATIC METHOD (FIX LỖI KHÔNG HIỆN POPUP)
  const [messageApi, contextHolderMessage] = message.useMessage();
  const [modalApi, contextHolderModal] = Modal.useModal();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await apiClient.get('/products');
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        messageApi.error("Lỗi tải menu: Không kết nối được Server.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) {
      messageApi.warning("Giỏ hàng trống!");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        storeId: 1,
        items: items.map(item => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          note: item.note || ''
        }))
      };

      const response = await apiClient.post('/orders', payload);

      if (response.data.success || response.status === 201) {
        // 1. Xóa giỏ hàng NGAY LẬP TỨC để giao diện phản hồi nhanh
        clearCart();
        
        // 2. Hiển thị thông báo thành công bằng Hook Modal
        const orderCode = response.data.data?.code || 'MỚI';
        modalApi.success({
          title: 'Thanh toán thành công!',
          content: \`Đơn hàng #\${orderCode} đã được chuyển xuống bếp.\`,
          okText: 'Đóng',
        });
      } else {
        throw new Error('Server trả về lỗi không xác định');
      }
    } catch (error: any) {
      console.error("Checkout Error:", error);
      modalApi.error({ 
        title: 'Thất bại', 
        content: error.response?.data?.message || 'Lỗi kết nối Server.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const MenuContent = (
    <div className="min-h-full">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Đang tải menu..."><div className="p-12" /></Spin>
        </div>
      ) : products.length === 0 ? (
        <Empty description="Không có món ăn" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.basePrice}
              imageUrl={product.imageUrl}
              onClick={() => { 
                addToCart(product); 
                messageApi.success({ content: \`Thêm \${product.name}\`, key: 'add_cart', duration: 1 }); 
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const CartContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2 m-0 text-primary">
          <ShoppingCartOutlined /> Giỏ hàng ({items.length})
        </h2>
        {items.length > 0 && (<Button type="text" danger icon={<DeleteOutlined />} onClick={clearCart}>Xóa hết</Button>)}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
            <div className="text-6xl mb-4 opacity-50">🛒</div>
            <p>Chưa có món nào</p>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item) => (
              <List.Item className="bg-white mb-2 p-3 rounded-lg shadow-sm border border-gray-100">
                <List.Item.Meta
                  title={<span className="font-medium text-primary">{item.name}</span>}
                  description={
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-mono font-bold text-orange-600">{new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)} đ</span>
                      <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                        <MinusCircleOutlined className="text-gray-500 cursor-pointer hover:text-red-500 text-lg" onClick={() => decreaseQuantity(item.productVariantId)} />
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <PlusCircleOutlined className="text-gray-500 cursor-pointer hover:text-green-500 text-lg" onClick={() => increaseQuantity(item.productVariantId)} />
                      </div>
                    </div>
                  }
                />
                <Button type="text" icon={<DeleteOutlined />} className="text-gray-400 hover:text-red-500 ml-2" onClick={() => removeFromCart(item.productVariantId)} />
              </List.Item>
            )}
          />
        )}
      </div>
      <div className="p-4 border-t bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="flex justify-between text-lg font-bold mb-4">
          <span>Tổng tiền:</span>
          <span className="font-mono text-2xl text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount())}</span>
        </div>
        <Button type="primary" block size="large" className="h-14 text-xl font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all" disabled={items.length === 0 || isProcessing} loading={isProcessing} onClick={handleCheckout}>
          {isProcessing ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN'}
        </Button>
      </div>
      {/* Placeholder để AntD hiển thị Popup */}
      {contextHolderMessage}
      {contextHolderModal}
    </div>
  );

  return <PosLayout menuContent={MenuContent} cartContent={CartContent} />;
}

// Component Wrapper để cung cấp Theme
export function App() {
  return (
    <AppThemeProvider>
      <AntdApp>
        <PosApp />
      </AntdApp>
    </AppThemeProvider>
  );
}

export default App;`;

try {
  fs.writeFileSync(appTsxPath, appTsxContent);
  console.log(
    '✅ Đã nâng cấp Frontend lên chuẩn Hooks: apps/web-pos/src/app/app.tsx'
  );
  console.log('🚀 Hãy quay lại trình duyệt và thử thanh toán!');
} catch (err) {
  console.error('❌ Lỗi ghi file:', err);
}
