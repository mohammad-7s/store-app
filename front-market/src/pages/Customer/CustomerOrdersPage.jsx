import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Container, 
    Typography, 
    Box, 
    Button, 
    Card, 
    CardContent, 
    Chip, 
    Divider, 
    CircularProgress, 
    Alert,
    Stack 
} from "@mui/material";
import axios from "../../services/axios";
import CustomerNavbar from "../../components/CustomerNavbar";

export default function CustomerOrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // جلب طلبات الزبون عند تحميل الصفحة
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get("/customer/orders");
                setOrders(response.data.data || response.data);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("فشل في جلب قائمة الطلبات، يرجى المحاولة لاحقاً");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // دالة لتحديد لون الشيب (Chip) حسب حالة الطلب
    const getStatusChip = (status) => {
        switch (status) {
            case 'pending':
                return <Chip label="معلق (قيد المراجعة)" color="warning" size="small" />;
            case 'processing':
                return <Chip label="قيد التجهيز" color="info" size="small" />;
            case 'on_the_way':
                return <Chip label="قيد التوصيل" color="primary" size="small" />;
            case 'completed':
                return <Chip label="مكتمل" color="success" size="small" />;
            case 'cancelled':
                return <Chip label="ملغي" color="error" size="small" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    return (
        <>
            <CustomerNavbar />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Button variant="outlined" onClick={() => navigate("/customer/stores")} sx={{ mb: 3 }}>
                    ← العودة للمتاجر
                </Button>

                <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
                    طلباتي السابقة والحالية
                </Typography>

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
                )}

                {!loading && !error && orders.length === 0 && (
                    <Box sx={{ textAlign: "center", mt: 5 }}>
                        <Typography color="text.secondary" gutterBottom>
                            ليس لديك أي طلبات حتى الآن.
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => navigate("/customer/stores")}
                            sx={{ mt: 2 }}
                        >
                            تصفح المتاجر واطلب الآن
                        </Button>
                    </Box>
                )}

                {!loading && !error && orders.length > 0 && (
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        {orders.map((order) => (
                            <Card key={order.id} elevation={3} sx={{ borderRadius: 3, p: 1 }}>
                                <CardContent>
                                    {/* رأس الكارد: رقم الطلب والحالة */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="bold">
                                            طلب #{order.id}
                                        </Typography>
                                        {getStatusChip(order.status)}
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        📅 تاريخ الطلب: {order.created_at}
                                    </Typography>

                                    {order.address && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            📍 عنوان التوصيل: {order.address.region} - {order.address.street_details}
                                        </Typography>
                                    )}

                                    <Divider sx={{ my: 1.5 }} />

                                    {/* قائمة المنتجات في الطلب */}
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        المنتجات المطلوبة:
                                    </Typography>
                                    {order.items && order.items.map((item, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pl: 2 }}>
                                            <Typography variant="body2">
                                                • {item.product_name} (×{item.quantity})
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {item.total_price} ل.س
                                            </Typography>
                                        </Box>
                                    ))}

                                    <Divider sx={{ my: 1.5 }} />

                                    {/* الملخص المالي للطلب */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, bgcolor: '#f9f9f9', p: 2, borderRadius: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2">مجموع المنتجات:</Typography>
                                            <Typography variant="body2" fontWeight="bold">{order.items_total} ل.س</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2">أجور التوصيل:</Typography>
                                            <Typography variant="body2" fontWeight="bold">{order.delivery_fee} ل.س</Typography>
                                        </Box>
                                        <Divider sx={{ my: 1 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle1" fontWeight="bold">الإجمالي الكلي:</Typography>
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary">{order.grand_total} ل.س</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Container>
        </>
    );
}