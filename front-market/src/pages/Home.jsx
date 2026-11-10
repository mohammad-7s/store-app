import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import background from '../assets/background.png';

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div 
        style={{ 
          backgroundImage: `url(${background})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          backgroundRepeat: 'no-repeat',
          position: 'relative', 
          height: '100vh',
          width: '100vw'
        }}
      >
        {/* طبقة التظليل الداكنة */}
        <div 
          style={{ 
            background: 'black',
            position: 'absolute', 
            opacity: '0.5', 
            top: '0', 
            left: '0', 
            width: '100%', 
            height: '100%' 
          }}
        />

        {/* المحتوى الأمامي */}
        <div style={{ position: 'relative', zIndex: '1', textAlign: 'center' }}>
          <Stack spacing={3} direction="column" >
            <h1 style={{ color: 'white', fontSize: '36px', fontWeight: 'bold', margin: 0 }}>
              مرحباً بك في موقعنا 
            </h1>
            
            {/* أزرار التنقل بجانب بعضها */}
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => navigate('/login')}
                sx={{ padding: '10px 25px', fontSize: '16px' }}
              >
                تسجيل الدخول
              </Button>

              <Button 
                variant="outlined" 
                color="inherit" 
                size="large"
                onClick={() => navigate('/signup')}
                sx={{ 
                  padding: '10px 25px', 
                  fontSize: '16px', 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': { borderColor: 'primary.main', backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                إنشاء حساب
              </Button>
            </Stack>
          </Stack>
        </div>
      </div>
    </>
  );
}

export default Home;