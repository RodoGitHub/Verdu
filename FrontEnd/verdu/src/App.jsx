import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import LoginPage from './pages/LoginPage';
import PosPage from './pages/PosPage';
import BoardPage from './pages/BoardPage';
import DashboardPage from './pages/DashboardPage';
import SalesPage from './pages/SalesPage';
import TerminalsPage from './pages/TerminalsPage';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import UsersPage from './pages/UsersPage';
import PaymentsPage from './pages/PaymentsPage';

function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pos" element={<PosPage />} />
            <Route path="/board" element={<BoardPage />} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="terminals" element={<TerminalsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </UIProvider>
    </BrowserRouter>
  );
}

export default App;
