// components/SidebarLayout.jsx
import Sidebar from "./navbar";
import { useState } from "react";

function SidebarLayout({ children }) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="d-flex">
      {/* Toggle Sidebar Button */}
      <button
        className="btn btn-outline-dark position-fixed m-3"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        &#9776;
      </button>

      {/* Sidebar */}
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* Page Content */}
      <div className="flex-grow-1 p-4 ms-5 mt-5">
        {children}
      </div>
    </div>
  );
}

export default SidebarLayout;
