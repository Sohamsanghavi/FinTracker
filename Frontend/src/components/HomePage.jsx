// Layout.jsx
import React from "react";
import Sidebar from "./SideBar";

const Layout = ({ children }) => {
    const drawerWidth = 240;

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 p-6 overflow-auto">
                {children}
            </div>
        </div>
    );
};

export default Layout;