import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import App from './App.tsx'
import CheckoutPage from './pages/CheckoutPage.tsx'
import CheckoutSuccess from './pages/CheckoutSuccess.tsx'
import AdminLogin from './pages/AdminLogin.tsx'
import AdminDashboard from './pages/AdminDashboard.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

import TrackOrder from './pages/TrackOrder.tsx'
import PrivacyPolicy from './pages/PrivacyPolicy.tsx'
import CookiePolicy from './pages/CookiePolicy.tsx'
import CookieBanner from './components/CookieBanner.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <CookieBanner />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)
