import React from 'react';

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ContentContainer: React.FC<ContentContainerProps> = ({ children, className = '' }) => {
  return (
    <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 ${className}`}>
      {children}
    </main>
  );
};

export { ContentContainer };
