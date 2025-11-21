const fs = require('fs');
const path = require('path');

// 1. CẤU HÌNH CORS CHUẨN CHO BACKEND (main.ts)
const mainTsPath = 'apps/api-server/src/main.ts';
const mainTsContent = `import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api/v1';

  app.setGlobalPrefix(globalPrefix);
  
  // --- CẤU HÌNH CORS MỚI (CHO PHÉP TẤT CẢ) ---
  app.enableCors({
    origin: true, // Phản hồi lại đúng origin của người gọi
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  // -------------------------------------------

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Coffee-Tech Pro API')
    .setDescription('Hệ thống quản lý chuỗi F&B Enterprise')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(\`🚀 API Server đang chạy tại: http://localhost:\${port}/\${globalPrefix}\`);
}

bootstrap();`;

// 2. CẬP NHẬT FRONTEND VỚI LOGGING CHI TIẾT HƠN (app.tsx)
const appTsxPath = 'apps/web-pos/src/app/app.tsx';
const appTsxContent = `import React, { useEffect, useState } from 'react';
import { AppThemeProvider } from './theme-provider';
import { PosLayout } from '../features/pos/PosLayout';
import { ProductCard } from '../features/menu/ProductCard';
import { Spin, Empty, Button, List, Typography, message, Modal } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useCartStore } from '../stores/cart.store';

const { Text } = Typography;

// Cấu hình Axios cơ bản
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

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, totalAmount, clearCart } = useCartStore();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        console.log("Đang tải menu...");
        const response = await apiClient.get('/products');
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi tải menu:", error);
        message.error("Không kết nối được Server (3333). Hãy kiểm tra Backend!");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleCheckout = async () => {
    console.log("--- BẮT ĐẦU THANH TOÁN ---");
    
    if (items.length === 0) {
      message.warning("Giỏ hàng trống!");
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
      
      console.log("Gửi dữ liệu:", payload);

      const response = await apiClient.post('/orders', payload);
      
      console.log("Phản hồi từ Server:", response); // Log toàn bộ response để debug

      // Kiểm tra kỹ hơn các trường hợp thành công
      // 1. Nếu API trả về success: true (theo chuẩn Envelope)
      // 2. Hoặc nếu status code là 201 (Created)
      if (response.data?.success === true || response.status === 201) {
        console.log("--> THANH TOÁN THÀNH CÔNG!");
        
        // Dữ liệu đơn hàng trả về (có thể nằm trong data.data hoặc trực tiếp trong data)
        const orderData = response.data.data || response.data;
        const orderCode = orderData.code || 'MỚI';

        Modal.success({
          title: 'Thanh toán thành công!',
          content: \`Đơn hàng #\${orderCode} đã được chuyển xuống bếp.\`,
          okText: 'Đóng',
          onOk: () => {
            console.log("Đóng modal -> Xóa giỏ hàng");
            clearCart();
          }
        });
      } else {
        console.warn("--> API trả về nhưng không báo success:", response.data);
        throw new Error(response.data?.message || 'Lỗi không xác định từ Server');
      }
    } catch (error: any) {
      console.error("Lỗi thanh toán (Catch):", error);
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi kết nối';
      Modal.error({ 
        title: 'Thất bại', 
        content: \`Lỗi: \${errorMsg}. Xem Console (F12) để biết thêm.\` 
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
        <Empty description="Không có món ăn (Kiểm tra API /products)" />
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
                message.success({ content: \`Thêm \${product.name}\`, key: 'add_cart', duration: 1 }); 
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
        <Button type="primary" block size="large" className="h-14 text-xl font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all" disabled={items.length === 0 || isProcessing} loading={isProcessing} onClick={handleCheckout}>
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

export default App;`;

// 3. GHI FILE
console.log('🔄 Đang sửa lỗi...');
try {
  if (fs.existsSync(mainTsPath)) {
    fs.writeFileSync(mainTsPath, mainTsContent);
    console.log('✅ Đã fix CORS: apps/api-server/src/main.ts');
  }
  if (fs.existsSync(appTsxPath)) {
    fs.writeFileSync(appTsxPath, appTsxContent);
    console.log(
      '✅ Đã fix Frontend UI & Logging: apps/web-pos/src/app/app.tsx'
    );
  }
} catch (err) {
  console.error('❌ Lỗi:', err);
}
console.log('🎉 Xong! Vui lòng restart API Server.');
