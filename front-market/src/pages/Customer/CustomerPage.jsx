import { useState, useEffect } from "react";
import { 
    Container, 
    Grid, 
    Card, 
    CardContent, 
    Typography, 
    CircularProgress, 
    Box, 
    Button,
    Chip
} from "@mui/material";
import axios from "../../services/axios"; 
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "../../components/CustomerNavbar";

export default function CustomerPage() {
    const [stores, setStores] = useState([]);       
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState("");      

    const navigate = useNavigate();

    const handleVisitStore = (storeId) => {
        navigate(`/customer/store/${storeId}/products`);
    };

    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await axios.get("/customer/stores");
                setStores(response.data.data || response.data); 
            } catch (err) {
                console.error("Error fetching stores:", err);
                setError("فشل في جلب المتاجر، يرجى المحاولة لاحقاً");
            } finally {
                setLoading(false); 
            }
        };

        fetchStores();
    }, []);

    return (
        <>
        <CustomerNavbar/>
        
        <Container sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
                المتاجر المتاحة في منطقتك
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

            {!loading && !error && stores.length === 0 && (
                <Typography align="center" color="textSecondary" sx={{ mt: 3 }}>
                    لا توجد متاجر متاحة حالياً في منطقتك. تأكد من إضافة عنوانك الافتراضي.
                </Typography>
            )}

            {!loading && !error && stores.length > 0 && (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {stores.map((store) => (
                        <Grid xs={12} sm={6} md={4} key={store.id}>
                            <Card elevation={3} sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3 }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6" fontWeight="bold">
                                            {store.name}
                                        </Typography>
                                        <Chip 
                                            label={store.is_active ? "مفتوح" : "مغلق"} 
                                            color={store.is_active ? "success" : "default"} 
                                            size="small" 
                                        />
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        📍 المنطقة: {store.region ? store.region.name : "غير محدد"}
                                    </Typography>

                                    {store.manager && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            👤 المسؤول: {store.manager.name} ({store.manager.phone})
                                        </Typography>
                                    )}

                                    <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 2 }}>
                                        تاريخ الانضمام: {store.created_at}
                                    </Typography>

                                    <Button 
                                        variant="contained" 
                                        color="primary"
                                        size="small" 
                                        fullWidth
                                        onClick={() => handleVisitStore(store.id)}
                                    >
                                        زيارة المتجر
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
        </>
    );
}