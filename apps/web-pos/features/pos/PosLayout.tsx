import React from 'react';
import { Layout } from 'antd';

const { Content, Sider } = Layout;

interface PosLayoutProps {
  menuContent: React.ReactNode;
  cartContent: React.ReactNode;
}

export const PosLayout: React.FC<PosLayoutProps> = ({
  menuContent,
  cartContent,
}) => {
  return (
    <Layout className="h-screen overflow-hidden bg-background">
      {/* KHU VỰC 1: MENU (70%) */}
      <Content className="h-full overflow-y-auto p-4 md:p-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Header nhỏ chào nhân viên */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary m-0">Thực đơn</h1>
              <p className="text-gray-500 text-sm">
                Ca sáng - NV: Nguyễn Văn A
              </p>
            </div>
            {/* Có thể thêm ô tìm kiếm ở đây */}
          </div>

          {/* Nội dung lưới sản phẩm sẽ được inject vào đây */}
          {menuContent}
        </div>
      </Content>

      {/* KHU VỰC 2: GIỎ HÀNG (30%) - Fixed Right */}
      <Sider
        width="35%"
        className="h-full bg-white border-l border-border shadow-xl z-10"
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div className="h-full flex flex-col">
          {/* Nội dung giỏ hàng sẽ được inject vào đây */}
          {cartContent}
        </div>
      </Sider>
    </Layout>
  );
};
