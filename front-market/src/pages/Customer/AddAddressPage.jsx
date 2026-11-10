import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Container, 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Paper, 
    FormControlLabel, 
    Switch, 
    MenuItem, 
    CircularProgress, 
    Alert,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from '../../services/axios';
import CustomerNavbar from "../../components/CustomerNavbar";

export default function AddAddressPage() {
    const navigate = useNavigate();
    
    const [regions, setRegions] = useState([]); 
    const [addresses, setAddresses] = useState([]); 
    const [regionId, setRegionId] = useState("");
    const [streetDetails, setStreetDetails] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    
    const [loadingRegions, setLoadingRegions] = useState(true);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // حالات نافذة التأكيد (Dialog) المنبثقة
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    // جلب المناطق والعناوين المحفوظة عند تحميل الصفحة
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [regionsRes, addressesRes] = await Promise.all([
                    axios.get("/customer/regions"),
                    axios.get("/customer/addresses")
                ]);
                
                setRegions(regionsRes.data.data || regionsRes.data);
                setAddresses(addressesRes.data.data || addressesRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("فشل في تحميل البيانات");
            } finally {
                setLoadingRegions(false);
                setLoadingAddresses(false);
            }
        };

        fetchData();
    }, []);

    // فتح نافذة التأكيد وتحديد العنوان المراد حذفه
    const handleOpenConfirmDialog = (address) => {
        setAddressToDelete(address);
        setOpenDeleteDialog(true);
    };

    // إغلاق نافذة التأكيد
    const handleCloseConfirmDialog = () => {
        setOpenDeleteDialog(false);
        setAddressToDelete(null);
    };

    // تنفيذ عملية الحذف الفعلية عبر الـ API
    const handleConfirmDelete = async () => {
        if (!addressToDelete) return;

        try {
            await axios.delete(`/customer/addresses/${addressToDelete.id}`);
            setAddresses(addresses.filter(addr => addr.id !== addressToDelete.id));
            setSuccessMessage("تم حذف العنوان بنجاح");
        } catch (err) {
            console.error("Error deleting address:", err);
            setError(err.response?.data?.message || "فشل في حذف العنوان");
        } finally {
            handleCloseConfirmDialog();
        }
    };

    // إرسال بيانات العنوان الجديد للـ API
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!regionId || !streetDetails.trim()) {
            setError("الرجاء اختيار المنطقة وتعبئة تفاصيل الشارع");
            return;
        }

        setSubmitting(true);

        const addressData = {
            region_id: Number(regionId),
            street_details: streetDetails,
            is_default: isDefault
        };

        try {
            const response = await axios.post("/customer/addresses", addressData);
            setSuccessMessage(response.data.message || "تم حفظ العنوان بنجاح");
            
            const updatedAddresses = await axios.get("/customer/addresses");
            setAddresses(updatedAddresses.data.data || updatedAddresses.data);

            setRegionId("");
            setStreetDetails("");
            setIsDefault(false);

        } catch (err) {
            console.error("Error saving address:", err);
            setError(err.response?.data?.message || "فشل في حفظ العنوان، يرجى المحاولة لاحقاً");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <CustomerNavbar />
            
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
                    ← العودة
                </Button>

                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                    <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
                        إدارة عناوين التوصيل
                    </Typography>

                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {/* قسم عرض وحذف العناوين الحالية */}
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
                        عناوينك المحفوظة:
                    </Typography>
                    {loadingAddresses ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : addresses.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            لا توجد عناوين محفوظة حالياً.
                        </Typography>
                    ) : (
                        <List sx={{ bgcolor: '#f9f9f9', borderRadius: 2, mb: 4, p: 1 }}>
                            {addresses.map((addr) => (
                                <Box key={addr.id}>
                                    <ListItem 
                                        secondaryAction={
                                            <IconButton edge="end" color="error" onClick={() => handleOpenConfirmDialog(addr)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText 
                                            primary={`${addr.region?.name || "منطقة غير محددة"} - ${addr.street_details}`}
                                            secondary={addr.is_default ? "عنوان افتراضي" : ""}
                                        />
                                    </ListItem>
                                    <Divider />
                                </Box>
                            ))}
                        </List>
                    )}

                    <Divider sx={{ my: 3 }} />

                    {/* نموذج إضافة عنوان جديد */}
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        إضافة عنوان جديد
                    </Typography>

                    {loadingRegions ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <TextField
                                select
                                label="المنطقة"
                                fullWidth
                                required
                                margin="normal"
                                value={regionId}
                                onChange={(e) => setRegionId(e.target.value)}
                            >
                                {regions.map((region) => (
                                    <MenuItem key={region.id} value={region.id}>
                                        {region.name} {region.delivery_cost ? `(أجور التوصيل: ${region.delivery_cost} ل.س)` : ""}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="تفاصيل الشارع (مثال: جانب الدوار، طابق 2)"
                                fullWidth
                                required
                                multiline
                                rows={2}
                                margin="normal"
                                value={streetDetails}
                                onChange={(e) => setStreetDetails(e.target.value)}
                            />

                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={isDefault} 
                                        onChange={(e) => setIsDefault(e.target.checked)} 
                                        color="primary"
                                    />
                                }
                                label="تعيين كعنوان افتراضي"
                                sx={{ mt: 2, display: 'block' }}
                            />

                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary" 
                                fullWidth 
                                size="large"
                                disabled={submitting}
                                sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
                            >
                                {submitting ? <CircularProgress size={24} color="inherit" /> : "حفظ العنوان الجديد"}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>

            {/* نافذة منبثقة (Dialog) احترافية لتأكيد الحذف */}
            <Dialog open={openDeleteDialog} onClose={handleCloseConfirmDialog}>
                <DialogTitle fontWeight="bold">تأكيد الحذف</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        هل أنت متأكد من رغبتك في حذف هذا العنوان نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseConfirmDialog} color="inherit">
                        إلغاء
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        حذف
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}