import { useState, useEffect } from "react";
import { 
    AppBar, Toolbar, Typography, Button, Badge, Box, 
    IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery, useTheme 
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

export default function CustomerNavbar() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
        };

        updateCartCount();

        window.addEventListener("storage", updateCartCount);
        window.addEventListener("cartUpdated", updateCartCount);

        return () => {
            window.removeEventListener("storage", updateCartCount);
            window.removeEventListener("cartUpdated", updateCartCount);
        };
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const navItems = [
        { label: "طلباتي", path: "/customer/orders" },
        { label: "العنوان", path: "/customer/addresses/add" },
    ];

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250, pt: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                🛍️ متجري
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
                    <ListItemButton onClick={() => navigate("/customer/cart")} sx={{ textAlign: 'center' }}>
                        <ListItemText primary={`السلة (${cartCount})`} />
                    </ListItemButton>
                </ListItem>
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
            <AppBar position="sticky" sx={{ bgcolor: "primary.main", mb: 3 }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    
                    {/* الشعار أو اسم المتجر */}
                    <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        sx={{ cursor: 'pointer' }} 
                        onClick={() => navigate("/customer/stores")}
                        noWrap
                    >
                        🛍️ متجري
                    </Typography>

                    {/* عرض الأزرار طبيعياً إذا كانت الشاشة كبيرة (Desktop) */}
                    {!isMobile ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                            <Button 
                                color="inherit" 
                                startIcon={
                                    <Badge badgeContent={cartCount} color="error">
                                        <ShoppingCart />
                                    </Badge>
                                }
                                onClick={() => navigate("/customer/cart")}
                                sx={{ fontWeight: 'bold' }}
                            >
                                السلة
                            </Button>
                            <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 'bold' }}>
                                تسجيل الخروج
                            </Button>
                        </Box>
                    ) : (
                        /* على الموبايل: عرض أيقونة السلة وأيقونة القائمة (Hamburger) */
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <IconButton 
                                color="inherit" 
                                onClick={() => navigate("/customer/cart")}
                            >
                                <Badge badgeContent={cartCount} color="error">
                                    <ShoppingCart />
                                </Badge>
                            </IconButton>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {/* الدرج الجانبي المنبثق للموبايل */}
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