import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { TripProvider } from './contexts/TripContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import TripDetailPage from './pages/TripDetailPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AgencyDashboard from './components/agency/AgencyDashboard';
import TripForm from './components/trips/TripForm';
import AdminPanel from './components/admin/AdminPanel';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <TripProvider>
          <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 antialiased font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/trip/:id" element={<TripDetailPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/agency" element={<ProtectedRoute role="agency"><AgencyDashboard /></ProtectedRoute>} />
                <Route path="/agency/trips/new" element={<ProtectedRoute role="agency"><TripForm /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontSize: '14px', fontWeight: 600 } }} />
          </div>
        </TripProvider>
      </AuthProvider>
    </HashRouter>
  );
}
