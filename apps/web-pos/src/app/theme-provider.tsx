import React from 'react';
import { ConfigProvider } from 'antd';

// Map màu từ Design System sang Ant Design Token
const themeConfig = {
  token: {
    colorPrimary: '#4B3621', // Brand Color
    colorSuccess: '#22C55E',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    fontFamily: "'Inter', sans-serif",
    borderRadius: 8, // Bo góc nhẹ nhàng
    wireframe: false,
  },
  components: {
    Button: {
      colorPrimary: '#FF7D00', // Nút chính dùng màu Cam (Accent) theo quy chuẩn 2.1
      algorithm: true, // Tự động tính toán hover state
      controlHeight: 48, // Chiều cao nút lớn (Touch-first)
      controlHeightLG: 56, // Nút Thanh toán khổng lồ
    },
    Card: {
      borderRadiusLG: 12,
    },
  },
};

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
};
