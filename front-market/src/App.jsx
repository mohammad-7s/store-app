import { Route, Routes } from "react-router-dom";
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';

// مسارات الزبون (Customer)
import CustomerPage from './pages/Customer/CustomerPage';
import StoreProductsPage from './pages/Customer/StoreProductsPage';
import CartPage from './pages/Customer/CartPage';
import AddAddressPage from './pages/Customer/AddAddressPage';
import CustomerOrdersPage from './pages/Customer/CustomerOrdersPage';

// مسارات مدير المتجر (Store Manager)
import StorePage from './pages/Store/StorePage';
import ManagerOrdersPage from './pages/Store/ManagerOrdersPage';
import StoreSettingsPage from './pages/Store/StoreSettingsPage';


// مسارات الأدمن (Super Admin)
import AdminStoresPage from './pages/Admin/AdminStoresPage';
import AdminDriversPage from './pages/Admin/AdminDriversPage';
import AdminRegionsPage from './pages/Admin/AdminRegionsPage';
import AdminCategoriesPage from './pages/Admin/AdminCategoriesPage';
import DriverOrdersPage from "./pages/Driver/DriverOrdersPage";

function App() {
  return (
    <>
      <Routes>
        {/* المسارات العامة */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* مسارات الزبون */}
        <Route path="/customer/stores" element={<CustomerPage />} />
        <Route path="/customer/store/:storeId/products" element={<StoreProductsPage />} />
        <Route path="/customer/cart" element={<CartPage />} />
        <Route path="/customer/addresses/add" element={<AddAddressPage />} />
        <Route path="/customer/orders" element={<CustomerOrdersPage />} />

        {/* مسارات مدير المتجر */}
        <Route path="/store-manager/products" element={<StorePage />} />
        <Route path="/store-manager/orders" element={<ManagerOrdersPage />} />
        <Route path="/store-manager/settings" element={<StoreSettingsPage />} />

        {/* مسارات السائق */}
        <Route path="/driver/dashboard" element={<DriverOrdersPage />} />

        {/* مسارات لوحة تحكم الأدمن */}
        <Route path="/admin/stores" element={<AdminStoresPage />} />
        <Route path="/admin/drivers" element={<AdminDriversPage />} />
        <Route path="/admin/regions" element={<AdminRegionsPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />

        {/* صفحة الخطأ 404 */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;