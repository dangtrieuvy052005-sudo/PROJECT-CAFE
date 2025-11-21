const fs = require('fs');
const path = require('path');

// Cấu hình danh sách file cần tạo
const files = [
  {
    path: 'apps/web-pos/src/stores/cart.store.ts',
    content: `import { create } from 'zustand';

export interface CartItem {
  productVariantId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: any) => void;
  increaseQuantity: (productVariantId: number) => void;
  decreaseQuantity: (productVariantId: number) => void;
  removeFromCart: (productVariantId: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (product) => {
    const { items } = get();
    const defaultVariant = product.variants[0]; 
    if (!defaultVariant) {
      alert("Sản phẩm này chưa có giá (Variant)!");
      return;
    }
    const existingItem = items.find(i => i.productVariantId === defaultVariant.id);
    if (existingItem) {
      set({
        items: items.map(i => i.productVariantId === defaultVariant.id ? { ...i, quantity: i.quantity + 1 } : i)
      });
    } else {
      const newItem = {
        productVariantId: defaultVariant.id,
        productId: product.id,
        name: \`\${product.name} (\${defaultVariant.name})\`,
        price: product.basePrice + defaultVariant.priceAdjustment,
        quantity: 1,
        note: ''
      };
      set({ items: [...items, newItem] });
    }
  },
  increaseQuantity: (id) => set((state) => ({
    items: state.items.map(i => i.productVariantId === id ? { ...i, quantity: i.quantity + 1 } : i)
  })),
  decreaseQuantity: (id) => set((state) => ({
    items: state.items.map(i => {
      if (i.productVariantId === id) {
        return { ...i, quantity: Math.max(1, i.quantity - 1) };
      }
      return i;
    })
  })),
  removeFromCart: (id) => set((state) => ({
    items: state.items.filter(i => i.productVariantId !== id)
  })),
  clearCart: () => set({ items: [] }),
  totalAmount: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
}));`,
  },
  {
    path: 'apps/web-pos/src/features/pos/PosLayout.tsx',
    content: `import React from 'react';
import { Layout } from 'antd';

const { Content, Sider } = Layout;

interface PosLayoutProps {
  menuContent: React.ReactNode;
  cartContent: React.ReactNode;
}

export const PosLayout: React.FC<PosLayoutProps> = ({ menuContent, cartContent }) => {
  return (
    <Layout className="h-screen overflow-hidden bg-background">
      <Content className="h-full overflow-y-auto p-4 md:p-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary m-0">Thực đơn</h1>
              <p className="text-gray-500 text-sm">Ca sáng - NV: Nguyễn Văn A</p>
            </div>
          </div>
          {menuContent}
        </div>
      </Content>
      <Sider width="35%" className="h-full bg-white border-l border-border shadow-xl z-10" theme="light" breakpoint="lg" collapsedWidth="0">
        <div className="h-full flex flex-col">
          {cartContent}
        </div>
      </Sider>
    </Layout>
  );
};`,
  },
  {
    path: 'apps/web-pos/src/features/menu/ProductCard.tsx',
    content: `import React from 'react';
import { Card, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ProductCardProps {
  name: string;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ name, price, imageUrl, isActive = true, onClick }) => {
  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  return (
    <Card
      hoverable
      className={\`overflow-hidden h-full flex flex-col border-0 shadow-sm transition-all duration-200 \${!isActive ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer active:scale-95'}\`}
      bodyStyle={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}
      cover={
        <div className="aspect-square relative bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img alt={name} src={imageUrl} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300"><span className="text-4xl">☕</span></div>
          )}
          {!isActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold px-3 py-1 border-2 border-white rounded-md transform -rotate-12">HẾT HÀNG</span>
            </div>
          )}
        </div>
      }
      onClick={isActive ? onClick : undefined}
    >
      <div className="mt-1 flex-1 flex flex-col justify-between">
        <h3 className="text-base font-semibold text-gray-800 line-clamp-2 mb-1 leading-snug">{name}</h3>
        <div className="flex justify-between items-end mt-2">
          <Text className="text-primary font-bold text-lg font-mono">{formattedPrice}</Text>
          <div className="bg-accent/10 text-accent w-8 h-8 rounded-full flex items-center justify-center"><PlusOutlined /></div>
        </div>
      </div>
    </Card>
  );
};`,
  },
  {
    path: 'apps/web-pos/src/app/app.tsx',
    content: `import React, { useEffect, useState } from 'react';
import { AppThemeProvider } from './theme-provider';
import { PosLayout } from '../features/pos/PosLayout';
import { ProductCard } from '../features/menu/ProductCard';
import { Spin, Empty, Button, List, Typography, message, Modal } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useCartStore } from '../stores/cart.store';

const { Text } = Typography;

interface Product {
  id: number;
  name: string;
  basePrice: number;
  imageUrl: string;
  variants: any[];
}

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, totalAmount, clearCart } = useCartStore();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get('http://localhost:3333/api/v1/products');
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        message.error("Không tải được thực đơn!");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) return;
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
      const response = await axios.post('http://localhost:3333/api/v1/orders', payload);
      if (response.data.success) {
        Modal.success({
          title: 'Thanh toán thành công!',
          content: \`Đơn hàng #\${response.data.data.code} đã được chuyển xuống bếp.\`,
          okText: 'Đóng',
        });
        clearCart();
      }
    } catch (error) {
      Modal.error({ title: 'Lỗi thanh toán', content: 'Không thể tạo đơn hàng. Vui lòng thử lại.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const MenuContent = (
    <div className="min-h-full">
      {loading ? (
        <div className="flex justify-center items-center h-64"><Spin size="large" tip="Đang pha chế menu..." /></div>
      ) : products.length === 0 ? (
        <Empty description="Chưa có món nào." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.basePrice}
              imageUrl={product.imageUrl}
              onClick={() => { addToCart(product); message.success(\`Đã thêm \${product.name}\`); }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const CartContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2 m-0 text-primary"><ShoppingCartOutlined /> Giỏ hàng ({items.length})</h2>
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
        <Button type="primary" block size="large" className="h-14 text-xl font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all" disabled={items.length === 0} loading={isProcessing} onClick={handleCheckout}>
          {isProcessing ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN'}
        </Button>
      </div>
    </div>
  );

  return (
    <AppThemeProvider>
      <PosLayout menuContent={MenuContent} cartContent={CartContent} />
    </AppThemeProvider>
  );
}

export default App;`,
  },
];

// Thực thi tạo file
files.forEach((file) => {
  const fullPath = path.join(__dirname, file.path);
  const dir = path.dirname(fullPath);

  // 1. Tạo thư mục nếu chưa có (Recursive)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Đã tạo thư mục: ${dir}`);
  }

  // 2. Ghi nội dung file
  fs.writeFileSync(fullPath, file.content, 'utf8');
  console.log(`✅ Đã tạo file: ${file.path}`);
});

console.log('\n🎉 HOÀN TẤT! Toàn bộ cấu trúc POS đã sẵn sàng.');
