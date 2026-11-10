import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Paper, FormControlLabel, Checkbox } from '@mui/material';
import axios from '../../services/axios';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
const [isStoreOwner, setIsStoreOwner] = useState(false);
  const [error, setError] = useState(''); 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

  if (!name || !phone || !password) {
      setError('الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (phone.length < 10 || phone.length > 10) {
      setError('رقم الهاتف يجب أن يكون 10 أرقام');
      return;
    }

    try {
      const response = await axios.post('/register', { name, phone, password, role: isStoreOwner ? 'store_manager' : 'customer' });
      const { token} = response.data;
      const { role } = response.data.user;
      localStorage.setItem('token', token);
      switch (role) {
        case 'super_admin':
          navigate('/admin/regions');
          break;
        case 'store_manager': // البائع
          navigate('/store-manager/products');
          break;
        case 'driver': // السائق
          navigate('/driver/dashboard');
          break;
        case 'customer': // الزبون
        default:
          navigate('/customer/stores'); // أو الصفحة الرئيسية للمتجر
          break;
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('هذا الرقم موجود بالفعل');
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          إنشاء حساب
        </Typography>
        {error && (
          <Typography color="error" variant="body2" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="الاسم الكامل"
            type="text"
            fullWidth
            required
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="رقم الهاتف"
            type="number"
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
          <Box sx={{ mt: 1, mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={isStoreOwner} 
                  onChange={(e) => setIsStoreOwner(e.target.checked)} 
                  color="primary"
                />
              }
              label="هل أنت صاحب متجر؟"
            />
          </Box>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            size="large"
            sx={{ mt: 3, mb: 2, padding: '12px' }}
          >
            تسجيل
          </Button>

          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
                تسجيل الدخول
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}