import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Container, 
    Typography, 
    Box, 
    Button, 
    Card, 
    CardContent, 
    Divider, 
    TextField, 
    Alert,
    CircularProgress,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions 
} from "@mui/material";
import axios from "../../services/axios";
import CustomerNavbar from "../../components/CustomerNavbar";

export default function CartPage() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]); 
    const [addresses, setAddresses] = useState([]); 
    const [addressId, setAddressId] = useState("");   
    
    const [loading, setLoading] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");

    // حالة نافذة تأكيد إلغاء السلة
    const [openCancelDialog, setOpenCancelDialog] = useState(false);

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(savedCart);

        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await axios.get("/customer/addresses");
            const fetchedAddresses = response.data.data || response.data;
            setAddresses(fetchedAddresses);

            const defaultAddress = fetchedAddresses.find(addr => addr.is_default);
            if (defaultAddress) {
                setAddressId(defaultAddress.id);
            } else if (fetchedAddresses.length > 0) {
                setAddressId(fetchedAddresses[0].id);
            }
        } catch (err) {
            console.error("Error fetching addresses:", err);
            setError("فشل في تحميل عناوين التوصيل");
        } finally {
            setLoadingAddresses(false);
        }
    };

    const itemsTotal = cartItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    const deliveryFee = 5000; 
    const grandTotal = itemsTotal + (cartItems.length > 0 ? deliveryFee : 0);

    // دالة تأكيد إلغاء الطلب وإفراغ السلة
    const handleConfirmCancelOrder = () => {
        localStorage.removeItem("cart");
        setCartItems([]);
        setOpenCancelDialog(false);
        navigate("/customer/stores");
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        if (!addressId) {
            setError("الرجاء اختيار عنوان التوصيل أولاً");
            return;
        }

        setLoading(true);
        setError("");
        setSuccessMessage("");

        const orderData = {
            store_id: cartItems[0]?.store_id || 1, 
            address_id: Number(addressId),
            items: cartItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }))
        };

        try {
            const response = await axios.post("/customer/orders", orderData);
            
            setSuccessMessage(response.data.message || "تم إنشاء طلبك بنجاح!");
            
            localStorage.removeItem("cart");
            setCartItems([]);

            setTimeout(() => {
                navigate("/customer/stores");
            }, 3000);

        } catch (err) {
            console.error("Error creating order:", err);
            setError(err.response?.data?.message || "فشل في إرسال الطلب، يرجى المحاولة لاحقاً");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CustomerNavbar/>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
                    ← العودة للمنتجات
                </Button>

                <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
                    سلة المشتريات
                </Typography>

                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {cartItems.length === 0 ? (
                    <Typography align="center" color="text.secondary" sx={{ mt: 5 }}>
                        سلة المشتريات فارغة حالياً.
                    </Typography>
                ) : (
                    <Box>
                        {/* قائمة المنتجات في السلة */}
                        {cartItems.map((item, index) => (
                            <Card key={index} elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
                                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">{item.product_name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            السعر الفردي: {item.unit_price} ل.س × {item.quantity}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" color="success.main" fontWeight="bold">
                                        {item.unit_price * item.quantity} ل.س
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}

                        {/* ملخص الفاتورة */}
                        <Card elevation={3} sx={{ mt: 3, p: 3, borderRadius: 3, bgcolor: '#f9f9f9' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                ملخص الفاتورة وعنوان التوصيل
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>مجموع المنتجات:</Typography>
                                <Typography fontWeight="bold">{itemsTotal} ل.س</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>أجور التوصيل:</Typography>
                                <Typography fontWeight="bold">{deliveryFee} ل.س</Typography>
                            </Box>
                            <Divider sx={{ my: 1.5 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">الإجمالي الكلي:</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">{grandTotal} ل.س</Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body1" fontWeight="bold">عنوان التوصيل:</Typography>
                                    <Button 
                                        variant="text" 
                                        size="small" 
                                        onClick={() => navigate("/customer/addresses/add")}
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        + إضافة عنوان جديد
                                    </Button>
                                </Box>

                                {loadingAddresses ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : addresses.length === 0 ? (
                                    <Alert severity="warning" sx={{ mt: 1 }}>
                                        لا توجد عناوين محفوظة. يرجى الضغط على "إضافة عنوان جديد" للمتابعة.
                                    </Alert>
                                ) : (
                                    <TextField 
                                        select
                                        label="اختر عنوان التوصيل"
                                        fullWidth 
                                        size="small" 
                                        value={addressId} 
                                        onChange={(e) => setAddressId(e.target.value)}
                                    >
                                        {addresses.map((addr) => (
                                            <MenuItem key={addr.id} value={addr.id}>
                                                {addr.region?.name || ""} - {addr.street_details} {addr.is_default ? "(افتراضي)" : ""}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            </Box>

                            {/* أزرار الإجراءات (تأكيد الطلب أو إلغاؤه) */}
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <Button 
                                    variant="contained" 
                                    color="success" 
                                    size="large" 
                                    fullWidth
                                    disabled={loading || addresses.length === 0}
                                    onClick={handleCheckout}
                                    sx={{ py: 1.5, fontWeight: 'bold', flex: 2 }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : "تأكيد وإرسال الطلب (الدفع عند الاستلام)"}
                                </Button>

                                <Button 
                                    variant="outlined" 
                                    color="error" 
                                    size="large" 
                                    fullWidth
                                    disabled={loading}
                                    onClick={() => setOpenCancelDialog(true)}
                                    sx={{ py: 1.5, fontWeight: 'bold', flex: 1 }}
                                >
                                    إلغاء الطلب
                                </Button>
                            </Box>
                        </Card>
                    </Box>
                )}
            </Container>

            {/* نافذة تأكيد إلغاء الطلب */}
            <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
                <DialogTitle fontWeight="bold">إلغاء الطلب الحالي</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        هل أنت متأكد من رغبتك في إلغاء الطلب وإفراغ سلة المشتريات؟
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenCancelDialog(false)} color="inherit">
                        تراجع
                    </Button>
                    <Button onClick={handleConfirmCancelOrder} color="error" variant="contained">
                        نعم، إلغاء الطلب
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}