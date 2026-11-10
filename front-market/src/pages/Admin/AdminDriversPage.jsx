import { useState, useEffect } from "react";
import { 
    Container, Typography, Box, Button, Card, CardContent, 
    TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
    CircularProgress, Alert, Stack, IconButton 
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../services/axios";
import AdminNavbar from "../../components/AdminNavbar";

export default function AdminDriversPage() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // حالات نافذة الإضافة
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // حالات نافذة التعديل
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editPassword, setEditPassword] = useState("");

    // حالات نافذة تأكيد الحذف
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState(null);

    const fetchDrivers = async () => {
        try {
            const response = await axios.get("/admin/drivers");
            setDrivers(response.data.data || response.data);
        } catch (err) {
            console.error("Error fetching drivers:", err);
            setError("فشل في تحميل قائمة السائقين");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    // دالة إنشاء سائق جديد
    const handleCreateDriver = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post("/admin/drivers", { name, phone, password });
            setOpenAddDialog(false);
            setName("");
            setPhone("");
            setPassword("");
            fetchDrivers();
        } catch (err) {
            console.error("Error creating driver:", err);
            alert(err.response?.data?.message || "فشل في إنشاء حساب السائق");
        } finally {
            setSubmitting(false);
        }
    };

    // فتح نافذة التعديل وتعبئة البيانات الحالية
    const handleOpenEdit = (driver) => {
        setSelectedDriver(driver);
        setEditName(driver.name);
        setEditPhone(driver.phone);
        setEditPassword(""); 
        setOpenEditDialog(true);
    };

    // دالة تحديث بيانات السائق
    const handleUpdateDriver = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const updateData = {
                name: editName,
                phone: editPhone,
            };
            if (editPassword) {
                updateData.password = editPassword;
            }

            await axios.put(`/admin/drivers/${selectedDriver.id}`, updateData);
            setOpenEditDialog(false);
            fetchDrivers();
        } catch (err) {
            console.error("Error updating driver:", err);
            alert(err.response?.data?.message || "فشل في تحديث بيانات السائق");
        } finally {
            setSubmitting(false);
        }
    };

    // فتح نافذة تأكيد الحذف
    const handleOpenDelete = (driver) => {
        setDriverToDelete(driver);
        setOpenDeleteDialog(true);
    };

    // تنفيذ الحذف الفعلي
    const handleConfirmDelete = async () => {
        if (!driverToDelete) return;

        try {
            await axios.delete(`/admin/drivers/${driverToDelete.id}`);
            setDrivers(drivers.filter(driver => driver.id !== driverToDelete.id));
            setOpenDeleteDialog(false);
            setDriverToDelete(null);
        } catch (err) {
            console.error("Error deleting driver:", err);
            alert("فشل في حذف حساب السائق");
        }
    };

    return (
        <>
            <AdminNavbar />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        إدارة السائقين
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)}>
                        إضافة سائق جديد
                    </Button>
                </Box>

                {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

                {!loading && drivers.length === 0 && (
                    <Typography color="text.secondary" sx={{ mt: 5 }} align="center">
                        لا يوجد سائقون مسجلون حتى الآن.
                    </Typography>
                )}

                <Stack spacing={2}>
                    {drivers.map((driver) => (
                        <Card key={driver.id} elevation={2} sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <LocalShippingIcon color="primary" fontSize="large" />
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">{driver.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">رقم الهاتف: {driver.phone}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton color="primary" onClick={() => handleOpenEdit(driver)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleOpenDelete(driver)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Container>

            {/* نافذة إضافة سائق جديد */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold">إضافة حساب سائق جديد</DialogTitle>
                <Box component="form" onSubmit={handleCreateDriver}>
                    <DialogContent>
                        <TextField 
                            label="اسم السائق" 
                            fullWidth 
                            required 
                            margin="normal" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                        <TextField 
                            label="رقم الهاتف" 
                            fullWidth 
                            required 
                            margin="normal" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                        />
                        <TextField 
                            label="كلمة المرور" 
                            type="password" 
                            fullWidth 
                            required 
                            margin="normal" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenAddDialog(false)}>إلغاء</Button>
                        <Button type="submit" variant="contained" disabled={submitting}>
                            {submitting ? <CircularProgress size={24} /> : "إنشاء الحساب"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* نافذة تعديل بيانات السائق */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold">تعديل بيانات السائق</DialogTitle>
                <Box component="form" onSubmit={handleUpdateDriver}>
                    <DialogContent>
                        <TextField 
                            label="اسم السائق" 
                            fullWidth 
                            required 
                            margin="normal" 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)} 
                        />
                        <TextField 
                            label="رقم الهاتف" 
                            fullWidth 
                            required 
                            margin="normal" 
                            value={editPhone} 
                            onChange={(e) => setEditPhone(e.target.value)} 
                        />
                        <TextField 
                            label="كلمة المرور الجديدة (اختياري)" 
                            type="password" 
                            fullWidth 
                            margin="normal" 
                            placeholder="اتركها فارغة إن لم ترغب بتغييرها"
                            value={editPassword} 
                            onChange={(e) => setEditPassword(e.target.value)} 
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenEditDialog(false)}>إلغاء</Button>
                        <Button type="submit" variant="contained" color="secondary" disabled={submitting}>
                            {submitting ? <CircularProgress size={24} /> : "حفظ التعديلات"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* نافذة تأكيد الحذف المخصصة */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color="error.main">تأكيد الحذف</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mt: 1 }}>
                        هل أنت متأكد من رغبتك في حذف حساب السائق <Box component="span" fontWeight="bold">{driverToDelete?.name}</Box>؟ لا يمكن التراجع عن هذا الإجراء.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)}>إلغاء</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error">
                        تأكيد الحذف
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}