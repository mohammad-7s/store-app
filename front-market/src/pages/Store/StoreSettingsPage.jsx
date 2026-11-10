import { useState, useEffect } from "react";
import { Container, Typography, Box, TextField, Button, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import axios from "../../services/axios";
import ManagerNavbar from "../../components/ManagerNavbar";

export default function StoreSettingsPage() {
    const [storeName, setStoreName] = useState("");
    const [regions, setRegions] = useState([]);
    const [selectedRegionId, setSelectedRegionId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const [storeRes, regRes] = await Promise.all([
                    axios.get("/store-manager/store-info"),
                    axios.get("/store-manager/regions")
                ]);
                setStoreName(storeRes.data.data.name || "");
                setSelectedRegionId(storeRes.data.data.region_id || "");
                setRegions(regRes.data.data || regRes.data);
            } catch (err) {
                console.error("Error fetching settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            await axios.put("/store-manager/store-info", {
                name: storeName,
                region_id: selectedRegionId
            });
            setMessage("تم حفظ إعدادات المتجر بنجاح");
        } catch (err) {
            console.error("Error saving store info:", err);
            setMessage("فشل في حفظ الإعدادات");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <ManagerNavbar />
            <Container maxWidth="sm" sx={{ mt: 5 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        إعدادات المتجر ومنطقة العمل
                    </Typography>
                    {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
                    
                    {loading ? <CircularProgress /> : (
                        <Box component="form" onSubmit={handleSave} sx={{ mt: 2 }}>
                            <TextField 
                                label="اسم المتجر"
                                fullWidth
                                required
                                margin="normal"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>منطقة المتجر</InputLabel>
                                <Select
                                    value={selectedRegionId}
                                    label="منطقة المتجر"
                                    onChange={(e) => setSelectedRegionId(e.target.value)}
                                >
                                    {regions.map((reg) => (
                                        <MenuItem key={reg.id} value={reg.id}>{reg.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                size="large" 
                                startIcon={<SaveIcon />}
                                fullWidth
                                sx={{ mt: 3 }}
                                disabled={saving}
                            >
                                {saving ? <CircularProgress size={24} /> : "حفظ التغييرات"}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>
        </>
    );
}