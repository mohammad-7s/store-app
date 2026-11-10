import { useState } from "react";
import { 
    AppBar, Toolbar, Typography, Button, Box, 
    IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery, useTheme 
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

export default function AdminNavbar() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // يتحقق إذا كانت الشاشة بحجم موبايل/تابلت صغير
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navItems = [
        { label: "المتاجر", path: "/admin/stores" },
        { label: "السائقين", path: "/admin/drivers" },
        { label: "المناطق", path: "/admin/regions" },
        { label: "الأقسام", path: "/admin/categories" },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // القائمة الجانبية التي تظهر عند النقر على أيقونة القائمة في الموبايل
    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250, pt: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                👑 لوحة الإدارة
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
            <AppBar position="sticky" sx={{ bgcolor: "error.main", mb: 3 }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    
                    
                    <Typography variant="h6" fontWeight="bold" noWrap>
                        👑 لوحة الإدارة العليا
                    </Typography>

                    {/* عرض الأزرار طبيعياً إذا كانت الشاشة كبيرة (Desktop) */}
                    {!isMobile ? (
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
                            <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 'bold', ml: 2, bgcolor: 'rgba(0,0,0,0.1)' }}>
                                تسجيل الخروج
                            </Button>
                        </Box>
                    ) : (
                        /* زر القائمة (Hamburger Icon) يظهر فقط على الشاشات الصغيرة */
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

            {/* الدرج الجانبي المنبثق للموبايل */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // تحسين الأداء على الهواتف
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
}