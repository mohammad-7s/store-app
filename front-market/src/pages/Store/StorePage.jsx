import { useState, useEffect } from "react";
import { 
    Container, Grid, Card, CardContent, CardMedia, Typography, 
    CircularProgress, Box, Chip, Alert, Button, Dialog, 
    DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Switch, FormControlLabel, 
    Snackbar
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../services/axios";
import ManagerNavbar from "../../components/ManagerNavbar";

export default function StorePage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // حالات نموذج الإضافة والتعديل
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);

    const [formName, setFormName] = useState("");
    const [formPrice, setFormPrice] = useState("");
    const [formStock, setFormStock] = useState("");
    const [formCategoryId, setFormCategoryId] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formIsActive, setFormIsActive] = useState(true);
    const [formImage, setFormImage] = useState(null);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });


    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            const [prodRes, catRes] = await Promise.all([
                axios.get("/store-manager/products"),
                axios.get("/store-manager/categories")
            ]);
            
            // التأكد من أن البيانات مصفوفة وليست فارغة أو غير متوفرة
            setProducts(prodRes.data.data || prodRes.data || []);
            setCategories(catRes.data.data || catRes.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("فشل في تحميل البيانات، تأكد من إنشاء متجرك أولاً.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenAdd = () => {
        setIsEditing(false);
        setFormName("");
        setFormPrice("");
        setFormStock("");
        setFormImage(null);
        setFormCategoryId("");
        setFormDescription("");
        setFormIsActive(true);
        setOpenDialog(true);
    };

    const handleOpenEdit = (product) => {
        setIsEditing(true);
        setCurrentProductId(product.id);
        setFormName(product.name);
        setFormPrice(product.price);
        setFormStock(product.stock);
        setFormImage(product.image || null);
        setFormCategoryId(product.category?.id || "");
        setFormDescription(product.description || "");
        setFormIsActive(product.is_active);
        setOpenDialog(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", formName);
        formData.append("price", formPrice);
        formData.append("stock", formStock);
        formData.append("category_id", formCategoryId);
        formData.append("description", formDescription || "");
        formData.append("is_active", formIsActive ? 1 : 0);
        
        if (formImage) {
            formData.append("image", formImage);
        }

        try {
            if (isEditing) {
                formData.append("_method", "PUT");
                await axios.post(`/store-manager/products/${currentProductId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            } else {
                await axios.post("/store-manager/products", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }
            
            setOpenDialog(false);
            fetchData();
            setSnackbar({ open: true, message: isEditing ? "تم تعديل المنتج بنجاح" : "تم إضافة المنتج بنجاح", severity: "success" });
        } catch (err) {
            console.error("Error saving product:", err);
            const errorMsg = err.response?.data?.message || "حدث خطأ أثناء حفظ المنتج";
            setSnackbar({ open: true, message: errorMsg, severity: "error" });
        }
    };

    const handleOpenDeleteConfirm = (product) => {
        setProductToDelete(product);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await axios.delete(`/store-manager/products/${productToDelete.id}`);
            setProducts(products.filter(p => p.id !== productToDelete.id));
            setSnackbar({ open: true, message: `تم حذف المنتج "${productToDelete.name}" بنجاح`, severity: "success" });
        } catch (err) {
            console.error("Error deleting product:", err);
            const errorMsg = err.response?.data?.message || "فشل في حذف المنتج";
            setSnackbar({ open: true, message: errorMsg, severity: "error" });
        } finally {
            setOpenDeleteDialog(false);
            setProductToDelete(null);
        }
    };

    // فلترة المنتجات بأمان مع التحقق من وجود مصفوفة
    const filteredProducts = Array.isArray(products) ? products.filter(product => {
        const matchesCategory = selectedCategory === "all" || product.category?.id === selectedCategory;
        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    }) : [];

    return (
        <>
            <ManagerNavbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        إدارة منتجات المتجر
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                        إضافة منتج جديد
                    </Button>
                </Box>

                {/* شريط البحث والفلترة */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField 
                        label="بحث عن منتج..." 
                        variant="outlined" 
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ flexGrow: 1 }}
                    />
                    <TextField 
                        select 
                        label="تصفية حسب الصنف" 
                        size="small" 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="all">جميع الأصناف</MenuItem>
                        {categories.map(cat => (
                            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                        ))}
                    </TextField>
                </Box>

                {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

                {!loading && filteredProducts.length === 0 && (
                    <Box sx={{ textAlign: 'center', mt: 6, p: 4, bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed divider' }}>
                        <Typography color="text.secondary" variant="h6" gutterBottom>
                            لا توجد منتجات مضافة في متجرك حالياً.
                        </Typography>
                        <Typography color="text.disabled" variant="body2" sx={{ mb: 2 }}>
                            قم بإضافة منتجاتك الأولى لتبدأ استقبال طلبات الزبائن.
                        </Typography>
                        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                            إضافة منتج الآن
                        </Button>
                    </Box>
                )}

                <Grid container spacing={3}>
                    {filteredProducts.map((product) => (
                        <Grid xs={12} sm={6} md={4} key={product.id}>
                            <Card elevation={3} sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3 }}>
                                {product.image_url ? (
                                    <CardMedia component="img" height="150" image={product.image_url} alt={product.name} />
                                ) : (
                                    <Box sx={{ height: 150, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography color="text.secondary" variant="body2">لا توجد صورة</Typography>
                                    </Box>
                                )}
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="h6" fontWeight="bold">{product.name}</Typography>
                                            {product.category && <Chip label={product.category.name} size="small" color="primary" variant="outlined" />}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{product.description || "لا يوجد وصف"}</Typography>
                                    </Box>
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="body1" fontWeight="bold" color="success.main">{product.price} ل.س</Typography>
                                            <Typography variant="body2">المخزون: {product.stock}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Chip label={product.is_active ? "نشط" : "معطل"} color={product.is_active ? "success" : "default"} size="small" />
                                            <Box>
                                                <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenEdit(product)}>تعديل</Button>
                                                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleOpenDeleteConfirm(product)}>حذف</Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* نافذة نموذج إضافة / تعديل منتج */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight="bold">{isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
                <Box component="form" onSubmit={handleSaveProduct}>
                    <DialogContent>
                        <TextField label="اسم المنتج" fullWidth required margin="normal" value={formName} onChange={(e) => setFormName(e.target.value)} />
                        <TextField label="السعر" type="number" fullWidth required margin="normal" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
                        <TextField label="المخزون" type="number" fullWidth required margin="normal" value={formStock} onChange={(e) => setFormStock(e.target.value)} />
                        
                        <TextField select label="الصنف" fullWidth required margin="normal" value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)}>
                            {categories.map(cat => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField label="الوصف" multiline rows={2} fullWidth margin="normal" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                        
                        <FormControlLabel 
                            control={<Switch checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} />} 
                            label="منتج نشط ومتاح" 
                            sx={{ mt: 2 }}
                        />
                        <Box sx={{ mt: 2, mb: 1 }}>
                            <Button variant="outlined" component="label" fullWidth>
                                {formImage ? `تم اختيار: ${formImage.name}` : "اختر صورة المنتج (اختياري)"}
                                <input type="file" hidden accept="image/*" onChange={(e) => setFormImage(e.target.files[0])} />
                            </Button>
                        </Box>
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
                    <Typography>
                        هل أنت متأكد من رغبتك في حذف المنتج <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>"{productToDelete?.name}"</span>؟
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">إلغاء</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">نعم، حذف</Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}