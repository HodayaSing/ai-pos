import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ContentContainer } from './ContentContainer';
import { OrderSidebar } from './OrderSidebar';
import { SelectedItemsBar } from './SelectedItemsBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        <div className="flex flex-1 overflow-hidden">
          <ContentContainer>
            {children}
          </ContentContainer>
          <OrderSidebar />
        </div>
        <SelectedItemsBar />
      </div>
    </div>
  );
};

export { Layout };
