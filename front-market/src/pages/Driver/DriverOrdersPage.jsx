import { useState, useEffect } from "react";
import { 
    Container, Typography, Box, Card, CardContent, 
    Button, CircularProgress, Alert, Stack, Tabs, Tab, Chip, Divider, 
    FormControl, InputLabel, Select, MenuItem, Paper 
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StoreIcon from "@mui/icons-material/Store";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import SaveIcon from "@mui/icons-material/Save";
import axios from "../../services/axios";
import DriverNavbar from "../../components/DriverNavbar";

export default function DriverOrdersPage() {
    const [tabValue, setTabValue] = useState(0); // 0: الطلبات المتاحة, 1: طلباتي الحالية
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedRegionId, setSelectedRegionId] = useState("");
    const [loading, setLoading] = useState(true);
    const [regionLoading, setRegionLoading] = useState(false);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    // جلب قائمة المناطق المتاحة في النظام
    const fetchRegions = async () => {
        try {
            const res = await axios.get("/driver/regions"); // أو المسار المخصص للمناطق
            setRegions(res.data.data || res.data);
        } catch (err) {
            console.error("Error fetching regions:", err);
        }
    };

    // جلب بيانات الطلبات
    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            if (tabValue === 0) {
                const res = await axios.get("/driver/available-orders");
                setAvailableOrders(res.data.data || res.data);
            } else {
                const res = await axios.get("/driver/my-orders");
                setMyOrders(res.data.data || res.data);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("فشل في تحميل قائمة الطلبات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegions();
        fetchData();
    }, [tabValue]);

    // حفظ منطقة العمل الجديدة للسائق
    const handleSaveRegion = async () => {
        if (!selectedRegionId) {
            alert("الرجاء اختيار منطقة أولاً");
            return;
        }
        setRegionLoading(true);
        try {
            await axios.post("/driver/set-region", { region_id: selectedRegionId });
            alert("تم تحديث منطقة العمل بنجاح");
            fetchData(); // إعادة جلب الطلبات بناءً على المنطقة المحدثة
        } catch (err) {
            console.error("Error saving region:", err);
            alert(err.response?.data?.message || "فشل في حفظ منطقة العمل");
        } finally {
            setRegionLoading(false);
        }
    };

    // دالة قبول الطلب
    const handleAcceptOrder = async (orderId) => {
        setActionLoading(orderId);
        try {
            await axios.post(`/driver/orders/${orderId}/accept`);
            fetchData();
        } catch (err) {
            console.error("Error accepting order:", err);
            alert(err.response?.data?.message || "فشل في قبول الطلب");
        } finally {
            setActionLoading(null);
        }
    };

    // دالة إتمام وتسليم الطلب
    const handleCompleteOrder = async (orderId) => {
        setActionLoading(orderId);
        try {
            await axios.patch(`/driver/orders/${orderId}/complete`);
            fetchData();
        } catch (err) {
            console.error("Error completing order:", err);
            alert("فشل في تأكيد تسليم الطلب");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <>
            <DriverNavbar />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    لوحة طلبات السائق
                </Typography>

                {/* بطاقة اختيار وتحديث منطقة العمل للسائق */}
                <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon color="primary" /> تحديد منطقة عملك (لتصفية الطلبات المتاحة):
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <FormControl sx={{ minWidth: 240, flexGrow: 1 }} size="small">
                            <InputLabel id="region-select-label">اختر المنطقة</InputLabel>
                            <Select
                                labelId="region-select-label"
                                value={selectedRegionId}
                                label="اختر المنطقة"
                                onChange={(e) => setSelectedRegionId(e.target.value)}
                            >
                                {regions.map((region) => (
                                    <MenuItem key={region.id} value={region.id}>
                                        {region.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button 
                            variant="contained" 
                            startIcon={<SaveIcon />} 
                            onClick={handleSaveRegion}
                            disabled={regionLoading}
                        >
                            {regionLoading ? <CircularProgress size={24} /> : "حفظ المنطقة"}
                        </Button>
                    </Box>
                </Paper>

                {/* التبويبات للتنقل بين المتاحة وطلباتي */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label="driver orders tabs">
                        <Tab label="الطلبات المتاحة للاستلام" sx={{ fontWeight: 'bold' }} />
                        <Tab label="طلباتي الحالية (قيد التوصيل)" sx={{ fontWeight: 'bold' }} />
                    </Tabs>
                </Box>

                {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

                {/* محتوى التبويب الأول: الطلبات المتاحة */}
                {!loading && tabValue === 0 && (
                    <Box>
                        {availableOrders.length === 0 ? (
                            <Typography color="text.secondary" sx={{ mt: 5 }} align="center">
                                لا توجد طلبات متاحة حالياً في منطقتك.
                            </Typography>
                        ) : (
                            <Stack spacing={2}>
                                {availableOrders.map((order) => (
                                    <Card key={order.id} elevation={2} sx={{ borderRadius: 3 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6" fontWeight="bold">
                                                    طلب رقم #{order.id}
                                                </Typography>
                                                <Chip label="بانتظار السائق" color="warning" size="small" />
                                            </Box>
                                            
                                            <Divider sx={{ mb: 2 }} />

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <StoreIcon fontSize="small" color="primary" /> المتجر: <strong>{order.store?.name}</strong>
                                                </Typography>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LocationOnIcon fontSize="small" color="error" /> المنطقة: <strong>{order.address?.region?.name || "غير محدد"}</strong>
                                                </Typography>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PersonIcon fontSize="small" color="action" /> العميل: <strong>{order.user?.name}</strong>
                                                </Typography>
                                            </Box>

                                            <Button 
                                                variant="contained" 
                                                color="primary" 
                                                fullWidth
                                                disabled={actionLoading === order.id}
                                                onClick={() => handleAcceptOrder(order.id)}
                                            >
                                                {actionLoading === order.id ? <CircularProgress size={24} /> : "قبول الطلب والتوجه للتوصيل"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                    </Box>
                )}

                {/* محتوى التبويب الثاني: طلباتي الحالية */}
                {!loading && tabValue === 1 && (
                    <Box>
                        {myOrders.length === 0 ? (
                            <Typography color="text.secondary" sx={{ mt: 5 }} align="center">
                                ليس لديك أي طلبات قيد التوصيل حالياً.
                            </Typography>
                        ) : (
                            <Stack spacing={2}>
                                {myOrders.map((order) => (
                                    <Card key={order.id} elevation={2} sx={{ borderRadius: 3, borderRight: order.status === 'completed' ? '6px solid green' : '6px solid orange' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6" fontWeight="bold">
                                                    طلب رقم #{order.id}
                                                </Typography>
                                                <Chip 
                                                    label={order.status } 
                                                    
                                                    size="small" 
                                                />
                                            </Box>

                                            <Divider sx={{ mb: 2 }} />

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <StoreIcon fontSize="small" color="primary" /> المتجر: <strong>{order.store?.name}</strong>
                                                </Typography>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LocationOnIcon fontSize="small" color="error" /> العنوان: <strong>{order.address?.address_details || order.address?.region?.name}</strong>
                                                </Typography>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PersonIcon fontSize="small" color="action" /> العميل: <strong>{order.user?.name} ({order.user?.phone})</strong>
                                                </Typography>
                                            </Box>

                                            {/* تفاصيل المنتجات */}
                                            <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.primary">
                                                    📦 تفاصيل المنتجات المطلوبة:
                                                </Typography>
                                                <Stack spacing={1}>
                                                    {order.items && order.items.map((item, index) => (
                                                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                                                            <Typography variant="body2">
                                                                • {item.product?.name || "منتج"} <Box component="span" color="text.secondary">({item.quantity}x)</Box>
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                                                                {item.product.price * item.quantity} ل.س
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Box>

                                            {order.status !== 'delivered' && (
                                                <Button 
                                                    variant="contained" 
                                                    color="success" 
                                                    fullWidth
                                                    startIcon={<CheckCircleIcon />}
                                                    disabled={actionLoading === order.id}
                                                    onClick={() => handleCompleteOrder(order.id)}
                                                >
                                                    {actionLoading === order.id ? <CircularProgress size={24} /> : "تأكيد تسليم الطلب وإكماله"}
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                    </Box>
                )}
            </Container>
        </>
    );
}