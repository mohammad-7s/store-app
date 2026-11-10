import { useState, useEffect } from "react";
import { 
    Container, Typography, Box, Button, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Paper, 
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, CircularProgress, Alert, Snackbar, Switch, FormControlLabel, Chip 
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../services/axios";
import AdminNavbar from "../../components/AdminNavbar";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCatId, setCurrentCatId] = useState(null);

    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [catToDelete, setCatToDelete] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/admin/categories");
            setCategories(response.data.data || response.data);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError("فشل في تحميل الأقسام");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenAdd = () => {
        setIsEditing(false);
        setName("");
        setIsActive(true);
        setOpenDialog(true);
    };

    const handleOpenEdit = (cat) => {
        setIsEditing(true);
        setCurrentCatId(cat.id);
        setName(cat.name);
        setIsActive(cat.is_active);
        setOpenDialog(true);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        try {
            const data = { name, is_active: isActive };
            if (isEditing) {
                await axios.put(`/admin/categories/${currentCatId}`, data);
                setSnackbar({ open: true, message: "تم تحديث القسم بنجاح", severity: "success" });
            } else {
                await axios.post("/admin/categories", data);
                setSnackbar({ open: true, message: "تم إضافة القسم بنجاح", severity: "success" });
            }
            setOpenDialog(false);
            fetchCategories();
        } catch (err) {
            console.error("Error saving category:", err);
            setSnackbar({ open: true, message: "حدث خطأ أثناء الحفظ", severity: "error" });
        }
    };

    const handleConfirmDelete = async () => {
        if (!catToDelete) return;
        try {
            await axios.delete(`/admin/categories/${catToDelete.id}`);
            setCategories(categories.filter(c => c.id !== catToDelete.id));
            setSnackbar({ open: true, message: "تم حذف القسم بنجاح", severity: "success" });
        } catch (err) {
            console.error("Error deleting category:", err);
            setSnackbar({ open: true, message: "فشل في حذف القسم", severity: "error" });
        } finally {
            setOpenDeleteDialog(false);
            setCatToDelete(null);
        }
    };

    return (
        <>
            <AdminNavbar />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">إدارة أقسام المنتجات</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                        إضافة قسم جديد
                    </Button>
                </Box>

                {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

                {!loading && categories.length === 0 && (
                    <Typography align="center" color="text.secondary" sx={{ mt: 5 }}>لا توجد أقسام مسجلة.</Typography>
                )}

                {!loading && categories.length > 0 && (
                    <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell fontWeight="bold">اسم القسم</TableCell>
                                    <TableCell fontWeight="bold">الحالة</TableCell>
                                    <TableCell align="center" fontWeight="bold">الإجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categories.map((cat) => (
                                    <TableRow key={cat.id}>
                                        <TableCell>{cat.name}</TableCell>
                                        <TableCell>
                                            <Chip label={cat.is_active ? "نشط" : "معطل"} color={cat.is_active ? "success" : "default"} size="small" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton color="primary" onClick={() => handleOpenEdit(cat)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => { setCatToDelete(cat); setOpenDeleteDialog(true); }}>
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
                <DialogTitle fontWeight="bold">{isEditing ? "تعديل القسم" : "إضافة قسم جديد"}</DialogTitle>
                <Box component="form" onSubmit={handleSaveCategory}>
                    <DialogContent>
                        <TextField 
                            label="اسم القسم" 
                            fullWidth 
                            required 
                            margin="normal" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                        <FormControlLabel 
                            control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} 
                            label="القسم نشط" 
                            sx={{ mt: 2 }}
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
                    <Typography>هل أنت متأكد من حذف قسم "{catToDelete?.name}"؟</Typography>
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