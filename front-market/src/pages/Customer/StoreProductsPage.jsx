import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Container, 
    Grid, 
    Card, 
    CardContent, 
    CardMedia,
    Typography, 
    CircularProgress, 
    Box, 
    Button,
    Chip,
    Snackbar,
    Alert 
} from "@mui/material";
import axios from "../../services/axios"; 
import CustomerNavbar from "../../components/CustomerNavbar"; // استيراد الناف بار

export default function StoreProductsPage() {
    const { storeId } = useParams(); 
    const navigate = useNavigate();
    
    const [products, setProducts] = useState([]);      
    const [categories, setCategories] = useState([]); 
    const [selectedCategory, setSelectedCategory] = useState("all"); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState("");      
    
    // حالات الإشعار المنبثق (Snackbar)
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`/customer/stores/${storeId}/products`);
                const fetchedProducts = response.data.data || response.data;
                setProducts(fetchedProducts); 

                const uniqueCategories = [];
                fetchedProducts.forEach(prod => {
                    if (prod.category && !uniqueCategories.some(cat => cat.id === prod.category.id)) {
                        uniqueCategories.push(prod.category);
                    }
                });
                setCategories(uniqueCategories);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("فشل في جلب منتجات المتجر، يرجى المحاولة لاحقاً");
            } finally {
                setLoading(false); 
            }
        };

        fetchProducts();
    }, [storeId]);

    const handleAddToCart = (product) => {
        const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
        
        const itemIndex = existingCart.findIndex(item => item.product_id === product.id);
        
        if (itemIndex > -1) {
            existingCart[itemIndex].quantity += 1; 
        } else {
            existingCart.push({
                store_id: product.store_id || Number(storeId), 
                product_id: product.id,
                product_name: product.name,
                unit_price: product.price,
                quantity: 1
            });
        }

        localStorage.setItem("cart", JSON.stringify(existingCart));
        
        // إطلاق حدث لتحديث عداد السلة في الناف بار فوراً
        window.dispatchEvent(new Event("cartUpdated"));

        // إظهار الإشعار الجميل
        setSnackbarMessage(`تمت إضافة "${product.name}" إلى السلة بنجاح`);
        setOpenSnackbar(true);
    };

    const filteredProducts = selectedCategory === "all" 
        ? products 
        : products.filter(prod => prod.category && prod.category.id === selectedCategory);

    return (
        <>
            {/* شريط التنقل العلوي مع زر السلة */}
            <CustomerNavbar />

            <Container maxWidth="lg" sx={{ mt: 2, mb: 4, px: { xs: 2, sm: 3 } }}>
                <Button 
                    variant="outlined" 
                    onClick={() => navigate(-1)} 
                    sx={{ mb: 2 }}
                    size="small"
                >
                    ← العودة للمتاجر
                </Button>

                <Typography variant="h4" align="center" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                    منتجات المتجر
                </Typography>

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Typography color="error" align="center" sx={{ mt: 3 }}>
                        {error}
                    </Typography>
                )}

                {!loading && !error && categories.length > 0 && (
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        overflowX: 'auto', 
                        py: 2, 
                        mb: 2,
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' } 
                    }}>
                        <Chip 
                            label="الكل" 
                            onClick={() => setSelectedCategory("all")}
                            color={selectedCategory === "all" ? "primary" : "default"}
                            variant={selectedCategory === "all" ? "filled" : "outlined"}
                            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                        />
                        {categories.map((cat) => (
                            <Chip 
                                key={cat.id}
                                label={cat.name} 
                                onClick={() => setSelectedCategory(cat.id)}
                                color={selectedCategory === cat.id ? "primary" : "default"}
                                variant={selectedCategory === cat.id ? "filled" : "outlined"}
                                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                            />
                        ))}
                    </Box>
                )}

                {!loading && !error && filteredProducts.length === 0 && (
                    <Typography align="center" color="textSecondary" sx={{ mt: 5 }}>
                        لا توجد منتجات مطابقة في هذا القسم حالياً.
                    </Typography>
                )}

                {!loading && !error && filteredProducts.length > 0 && (
                    <Grid container spacing={2.5} sx={{ mt: 1 }}>
                        {filteredProducts.map((product) => (
                            <Grid xs={12} sm={6} md={4} key={product.id}>
                                <Card elevation={3} sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3 }}>
                                    {product.image_url ? (
                                        <CardMedia
                                            component="img"
                                            height="160"
                                            image={product.image_url}
                                            alt={product.name}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box sx={{ height: 160, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography color="text.secondary" variant="body2">لا توجد صورة</Typography>
                                        </Box>
                                    )}

                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                                                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem', lineHeight: 1.2 }}>
                                                    {product.name}
                                                </Typography>
                                                {product.category && (
                                                    <Chip label={product.category.name} size="small" color="primary" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                                                )}
                                            </Box>
                                            
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {product.description || "لا يوجد وصف متاح للمنتج."}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="body1" fontWeight="bold" color="success.main">
                                                    {product.price} ل.س
                                                </Typography>
                                                <Typography variant="caption" color={product.stock > 0 ? "text.secondary" : "error"}>
                                                    {product.stock > 0 ? `المتوفر: ${product.stock}` : "نفذت الكمية"}
                                                </Typography>
                                            </Box>

                                            <Button 
                                                variant="contained" 
                                                color="primary"
                                                size="small" 
                                                fullWidth
                                                disabled={!product.is_active || product.stock <= 0}
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                {product.is_active && product.stock > 0 ? "إضافة إلى السلة" : "غير متاح"}
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* إشعار الـ Snackbar الأنيق الذي يزول وحده بعد ثانيتين */}
                <Snackbar 
                    open={openSnackbar} 
                    autoHideDuration={2000} 
                    onClose={() => setOpenSnackbar(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setOpenSnackbar(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
}