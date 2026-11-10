import { useState, useEffect } from "react";
import { 
    Container, Typography, Box, Card, CardContent, 
    Button, Chip, CircularProgress, Alert, Stack 
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "../../services/axios";
import AdminNavbar from "../../components/AdminNavbar";

export default function AdminStoresPage() {
    const [stores, setStores] = useState([]);
     const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchStores = async (pageUrl = "/admin/stores") => {
        try {
            setLoading(true);
            const response = await axios.get(pageUrl);
            

            setStores(response.data.data);
        
        } catch (err) {
            console.error("Error fetching stores:", err);
            setError("فشل في تحميل قائمة المتاجر");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const handleToggleApproval = async (storeId, currentStatus) => {
        try {
            await axios.put(`/admin/stores/${storeId}`, {
                is_active: !currentStatus 
            });
            // تحديث القائمة محلياً
            setStores(stores.map(store => 
                store.id === storeId ? { ...store, is_active: !currentStatus } : store
            ));
        } catch (err) {
            console.error("Error updating store status:", err);
            alert("فشل في تحديث حالة المتجر");
        }
    };

    return (
        <>
            <AdminNavbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    إدارة ومتابعة المتاجر
                </Typography>

                {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

                {!loading && stores.length === 0 && (
                    <Typography color="text.secondary" sx={{ mt: 5 }} align="center">
                        لا توجد متاجر مسجلة حالياً.
                    </Typography>
                )}

                <Stack spacing={2} sx={{ mt: 3 }}>
                    {stores.map((store) => (
                        <Card key={store.id} elevation={2} sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{store.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        المنطقة: {store.region?.name} | المالك: {store.manager?.name || "غير محدد"} | الهاتف: {store.manager?.phone}
                                    </Typography>
                                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                        <Chip 
                                            label={store.is_active ? "نشط (مرئي للعامة)" : "معطل (بانتظار التفعيل)"} 
                                            color={store.is_active ? "success" : "warning"} 
                                            size="small" 
                                        />
                                    </Box>
                                </Box>

                                <Box>
                                    <Button 
                                        variant="contained" 
                                        color={store.is_active ? "error" : "success"}
                                        startIcon={store.is_active ? <CancelIcon /> : <CheckCircleIcon />}
                                        onClick={() => handleToggleApproval(store.id, store.is_active)}
                                    >
                                        {store.is_active ? "تعطيل المتجر" : "تفعيل المتجر"}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Container>
        </>
    );
}