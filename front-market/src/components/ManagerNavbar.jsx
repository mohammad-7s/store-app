import { useState } from "react";
import { 
    AppBar, Toolbar, Typography, Button, Box, 
    IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery, useTheme 
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

export default function ManagerNavbar() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navItems = [
        { label: "المنتجات", path: "/store-manager/products" },
        { label: "الطلبات الواردة", path: "/store-manager/orders" },
        { label: "إعدادات المتجر", path: "/store-manager/settings" }
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250, pt: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                ⚙️ لوحة تحكم المتجر
            </Typography>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton onClick={() => navigate(item.path)} sx={{ textAlign: 'center' }}>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout} sx={{ textAlign: 'center', color: 'error.main', mt: 2 }}>
                        <ListItemText primary="تسجيل الخروج" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="sticky" sx={{ bgcolor: "secondary.main", mb: 3 }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                        ⚙️ لوحة تحكم المتجر
                    </Typography>

                    {/* عرض الأزرار طبيعياً على الشاشات الكبيرة */}
                    {!isMobile ? (
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                            {navItems.map((item) => (
                                <Button 
                                    key={item.path} 
                                    color="inherit" 
                                    onClick={() => navigate(item.path)} 
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                            <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 'bold' }}>
                                تسجيل الخروج
                            </Button>
                        </Box>
                    ) : (
                        /* زر القائمة الجانبية على الهواتف */
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>

            {/* القائمة الجانبية المنبثقة للموبايل */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
}