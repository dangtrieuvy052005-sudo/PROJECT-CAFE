import React from 'react';
import { Card, Badge, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ProductCardProps {
  name: string;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  imageUrl,
  isActive = true,
  onClick,
}) => {
  // Format tiền tệ theo chuẩn Việt Nam (Font Monospace theo quy chuẩn 3.2)
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);

  return (
    <Card
      hoverable
      className={`
        overflow-hidden h-full flex flex-col border-0 shadow-sm transition-all duration-200
        ${
          !isActive
            ? 'opacity-60 grayscale cursor-not-allowed'
            : 'cursor-pointer active:scale-95'
        }
      `}
      bodyStyle={{
        padding: '12px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
      cover={
        <div className="aspect-square relative bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              alt={name}
              src={imageUrl}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
            />
          ) : (
            // Placeholder theo quy chuẩn 7.2 (Vector Art)
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <span className="text-4xl">☕</span>
            </div>
          )}

          {/* Overlay khi hết hàng */}
          {!isActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold px-3 py-1 border-2 border-white rounded-md transform -rotate-12">
                HẾT HÀNG
              </span>
            </div>
          )}
        </div>
      }
      onClick={isActive ? onClick : undefined}
    >
      <div className="mt-1 flex-1 flex flex-col justify-between">
        <h3 className="text-base font-semibold text-gray-800 line-clamp-2 mb-1 leading-snug">
          {name}
        </h3>

        <div className="flex justify-between items-end mt-2">
          {/* Giá tiền dùng font Mono để thẳng hàng */}
          <Text className="text-primary font-bold text-lg font-mono">
            {formattedPrice}
          </Text>

          {/* Nút thêm nhanh (Visual Cue) */}
          <div className="bg-accent/10 text-accent w-8 h-8 rounded-full flex items-center justify-center">
            <PlusOutlined />
          </div>
        </div>
      </div>
    </Card>
  );
};
