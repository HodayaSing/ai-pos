import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ContentContainer } from './ContentContainer';
import { OrderSidebar } from './OrderSidebar';
import { SelectedItemsBar } from './SelectedItemsBar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isCameraPage = location.pathname === '/camera';

  return (
    <div className="flex h-screen bg-gray-100">
      {!isCameraPage && <Sidebar />}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        <div className="flex flex-1 overflow-hidden">
          <ContentContainer>
            {children}
          </ContentContainer>
          {!isCameraPage && <OrderSidebar />}
        </div>
        {!isCameraPage && <SelectedItemsBar />}
      </div>
    </div>
  );
};

export { Layout };
