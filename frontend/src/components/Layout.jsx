import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

const Layout = ({ children, showSidebar = false }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setSidebarExpanded((previous) => !previous);
  };

  return (
    <div className="min-h-screen bg-[#080e1c] text-slate-100">
      <div className="flex min-h-screen">
        {showSidebar && (
          <Sidebar
            expanded={sidebarExpanded}
            onToggle={toggleSidebar}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar
            onToggleSidebar={toggleSidebar}
            showSidebarToggle={showSidebar}
          />

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;