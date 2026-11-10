import { useState, useEffect } from "react";
import { 
    Container, Typography, Box, Button, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Paper, 
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, CircularProgress, Alert, Snackbar, Switch, FormControlLabel 
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../services/axios";
import AdminNavbar from "../../components/AdminNavbar";

export default function AdminRegionsPage() {
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // حالات النافذة المنبثقة (إضافة وتعديل)
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRegionId, setCurrentRegionId] = useState(null);

    // حقول النموذج
    const [name, setName] = useState("");
    const [deliveryCost, setDeliveryCost] = useState("");

    // حالة حذف المنطقة
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [regionToDelete, setRegionToDelete] = useState(null);

    // إشعارات Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const fetchRegions = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/admin/regions");
            setRegions(response.data.data || response.data);
        } catch (err) {
            console.error("Error fetching regions:", err);
            setError("فشل في تحميل قائمة المناطق");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegions();
    }, []);

    const handleOpenAdd = () => {
        setIsEditing(false);
        setName("");
        setDeliveryCost("");
        setOpenDialog(true);
    };

    const handleOpenEdit = (region) => {
        setIsEditing(true);
        setCurrentRegionId(region.id);
        setName(region.name);
        setDeliveryCost(region.delivery_cost);
        setOpenDialog(true);
    };

    const handleSaveRegion = async (e) => {
        e.preventDefault();
        try {
            const data = { name, delivery_cost: Number(deliveryCost) };
            if (isEditing) {
                await axios.put(`/admin/regions/${currentRegionId}`, data);
                setSnackbar({ open: true, message: "تم تحديث المنطقة بنجاح", severity: "success" });
            } else {
                await axios.post("/admin/regions", data);
                setSnackbar({ open: true, message: "تم إضافة المنطقة بنجاح", severity: "success" });
            }
            setOpenDialog(false);
            fetchRegions();
        } catch (err) {
            console.error("Error saving region:", err);
            setSnackbar({ open: true, message: "حدث خطأ أثناء الحفظ", severity: "error" });
        }
    };

    const handleConfirmDelete = async () => {
        if (!regionToDelete) return;
        try {
            await axios.delete(`/admin/regions/${regionToDelete.id}`);
            setRegions(regions.filter(r => r.id !== regionToDelete.id));
            setSnackbar({ open: true, message: "تم حذف المنطقة بنجاح", severity: "success" });
        } catch (err) {
            console.error("Error deleting region:", err);
            setSnackbar({ open: true, message: "فشل في حذف المنطقة", severity: "error" });
        } finally {
            setOpenDeleteDialog(false);
            setRegionToDelete(null);
        }
    };

    return (
        <>
            <AdminNavbar />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">إدارة مناطق التوصيل</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                        إضافة منطقة جديدة
                    </Button>
                </Box>

                {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

                {!loading && regions.length === 0 && (
                    <Typography align="center" color="text.secondary" sx={{ mt: 5 }}>لا توجد مناطق مسجلة.</Typography>
                )}

                {!loading && regions.length > 0 && (
                    <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell fontWeight="bold">اسم المنطقة</TableCell>
                                    <TableCell fontWeight="bold">أجور التوصيل</TableCell>
                                    <TableCell align="center" fontWeight="bold">الإجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {regions.map((region) => (
                                    <TableRow key={region.id}>
                                        <TableCell>{region.name}</TableCell>
                                        <TableCell>{region.delivery_cost} ل.س</TableCell>
                                        <TableCell align="center">
                                            <IconButton color="primary" onClick={() => handleOpenEdit(region)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => { setRegionToDelete(region); setOpenDeleteDialog(true); }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Container>

            {/* نافذة الإضافة والتعديل */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold">{isEditing ? "تعديل المنطقة" : "إضافة منطقة جديدة"}</DialogTitle>
                <Box component="form" onSubmit={handleSaveRegion}>
                    <DialogContent>
                        <TextField 
                            label="اسم المنطقة" 
                            fullWidth 
                            required 
                            margin="normal" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                        <TextField 
                            label="أجور التوصيل (ل.س)" 
                            type="number" 
                            fullWidth 
                            required 
                            margin="normal" 
                            value={deliveryCost} 
                            onChange={(e) => setDeliveryCost(e.target.value)} 
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenDialog(false)}>إلغاء</Button>
                        <Button type="submit" variant="contained">حفظ</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* نافذة تأكيد الحذف */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold">تأكيد الحذف</DialogTitle>
                <DialogContent>
                    <Typography>هل أنت متأكد من حذف منطقة "{regionToDelete?.name}"؟</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)}>إلغاء</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">حذف</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </>
    );
}