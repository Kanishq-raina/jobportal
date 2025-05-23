// AppLayout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const AppLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} />

      {/* Content area */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <TopNav toggleSidebar={() => setIsCollapsed((prev) => !prev)} />
        <main className="p-4 bg-gray-50 dark:bg-gray-900 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
