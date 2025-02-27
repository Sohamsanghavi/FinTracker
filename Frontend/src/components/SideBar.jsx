// Sidebar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Button } from "@mui/material";
import { Dashboard as DashboardIcon, AttachMoney, MoneyOff, ExitToApp } from "@mui/icons-material";

const Sidebar = () => {
    const drawerWidth = 240;
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    // Helper to determine if a route is active
    const isActive = (path) => location.pathname === path;

    const menuItems = [
        {
            text: "Dashboard",
            icon: <DashboardIcon />,
            path: "/dashboard"
        },
        {
            text: "Income",
            icon: <AttachMoney />,
            path: "/income"
        },
        {
            text: "Expenses",
            icon: <MoneyOff />,
            path: "/expenses"
        },
        {
            text: "Budget",
            icon: <MoneyOff />,
            path: "/budget"
        },
        {
            text:"Split",
            icon: <MoneyOff />,
            path: "/split"
        }
    ];

    return (
        <Drawer
            variant="permanent"
            anchor="left"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    position: 'relative',
                    height: '100vh',
                },
            }}
        >
            <div className="flex flex-col h-full justify-between">
                <List>
                    {menuItems.map((item) => (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            sx={{
                                backgroundColor: isActive(item.path) ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                                '&:hover': {
                                    backgroundColor: isActive(item.path) ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: isActive(item.path) ? 'bold' : 'normal'
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
                <div className="p-4">
                    <Button
                        startIcon={<ExitToApp />}
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </Drawer>
    );
};

export default Sidebar;
