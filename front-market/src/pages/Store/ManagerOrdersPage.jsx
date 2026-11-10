import { useState, useEffect } from "react";
import { 
    Container, Typography, Box, Card, CardContent, 
    Chip, Divider, CircularProgress, Alert, Stack, MenuItem, TextField 
} from "@mui/material";
import axios from "../../services/axios";
import ManagerNavbar from "../../components/ManagerNavbar";

export default function ManagerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
            const response = await axios.get("/store-manager/orders");
            setOrders(response.data.data || response.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("فشل في جلب الطلبات الواردة");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // تحديث حالة الطلب
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.patch(`/store-manager/orders/${orderId}/status`, { status: newStatus });
            // تحديث القائمة محلياً
            setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
        } catch (err) {
            console.error("Error updating status:", err);
            alert("فشل في تحديث حالة الطلب");
        }
    };

    return (
        <>
            <ManagerNavbar />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
                    الطلبات الواردة للمتجر
                </Typography>

                {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

                {!loading && orders.length === 0 && (
                    <Typography align="center" color="text.secondary" sx={{ mt: 5 }}>
                        لا توجد طلبات واردة حالياً.
                    </Typography>
                )}

                <Stack spacing={3} sx={{ mt: 2 }}>
                    {orders.map((order) => (
                        <Card key={order.id} elevation={3} sx={{ borderRadius: 3, p: 1 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        طلب #{order.id} - الزبون: {order.customer?.name || "غير معروف"}
                                    </Typography>
                                    
                                    {/* قائمة منسدلة لتغيير حالة الطلب مباشرة */}
                                    <TextField 
                                        select
                                        size="small"
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        sx={{ minWidth: 150 }}
                                    >
                                        <MenuItem value="pending">معلق</MenuItem>
                                        <MenuItem value="processing">قيد التجهيز</MenuItem>
                                        <MenuItem disabled value="delivered">تم التوصيل</MenuItem>
                                        <MenuItem  disabled value="out_for_delivery">جاري التوصيل</MenuItem>
                                        <MenuItem value="cancelled">ملغي</MenuItem>
                                    </TextField>
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

                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>المنتجات:</Typography>
                                {order.items?.map((item, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pl: 2 }}>
                                        <Typography variant="body2">• {item.product_name} (×{item.quantity})</Typography>
                                        <Typography variant="body2" fontWeight="bold">{item.total_price} ل.س</Typography>
                                    </Box>
                                ))}

                                <Divider sx={{ my: 1.5 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#f9f9f9', p: 2, borderRadius: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">الإجمالي الكلي:</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="primary">{order.grand_total} ل.س</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Container>
        </>
    );
}