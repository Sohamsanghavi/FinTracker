import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Drawer, List, ListItem, ListItemIcon, ListItemText, Button, IconButton, Divider, useMediaQuery
} from "@mui/material";
import { Menu as MenuIcon, Dashboard as DashboardIcon, AttachMoney, MoneyOff, ExitToApp } from "@mui/icons-material";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { useTheme } from "@mui/material/styles";

const Sidebar = () => {
    const drawerWidth = 240;
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    // Responsive state
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    // Toggle Sidebar on mobile
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
        { text: "Income", icon: <AttachMoney />, path: "/income" },
        { text: "Expenses", icon: <MoneyOff />, path: "/expenses" },
        { text: "Budget", icon: <WorkOutlineOutlinedIcon />, path: "/budget" },
        { text: "Split", icon: <CallSplitOutlinedIcon />, path: "/split" }
    ];

    const drawerContent = (
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
            <Divider />
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
    );

    return (
        <>
            {/* Mobile Toggle Button */}
            {isMobile && (
                <IconButton onClick={handleDrawerToggle} sx={{ position: "absolute", top: 10, left: 10 }}>
                    <MenuIcon />
                </IconButton>
            )}

            {/* Sidebar Drawer */}
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                anchor="left"
                open={isMobile ? mobileOpen : true}
                onClose={handleDrawerToggle}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        position: isMobile ? "absolute" : "relative",
                        height: '100vh',
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        </>
    );
};

export default Sidebar;
