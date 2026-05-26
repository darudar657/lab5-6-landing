import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './bank/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppLayout from './pages/app/AppLayout';
import DashboardPage from './pages/app/DashboardPage';
import AccountsPage from './pages/app/AccountsPage';
import AccountDetailPage from './pages/app/AccountDetailPage';
import CardsPage from './pages/app/CardsPage';
import TransfersPage from './pages/app/TransfersPage';
import TransactionsPage from './pages/app/TransactionsPage';
import SavingsPage from './pages/app/SavingsPage';
import ExchangePage from './pages/app/ExchangePage';
import ProfilePage from './pages/app/ProfilePage';
import SettingsPage from './pages/app/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="accounts/:id" element={<AccountDetailPage />} />
            <Route path="cards" element={<CardsPage />} />
            <Route path="transfers" element={<TransfersPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="savings" element={<SavingsPage />} />
            <Route path="exchange" element={<ExchangePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#000000',
            border: '1px solid rgba(0,0,0,0.05)',
            borderRadius: '16px',
            padding: '12px 16px',
            fontSize: '14px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
            maxWidth: '500px',
          },
        }}
      />
    </BrowserRouter>
  );
}
