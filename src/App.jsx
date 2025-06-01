import React from 'react';
    import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
    import Layout from '@/components/Layout';
    import HomePage from '@/pages/HomePage';
    import BlogPage from '@/pages/BlogPage';
    import BlogPostPage from '@/pages/BlogPostPage'; 
    import NotFoundPage from '@/pages/NotFoundPage';
    import AuthPage from '@/pages/AuthPage';
    import DashboardPage from '@/pages/DashboardPage';
    import AdminDashboardPage from '@/pages/AdminDashboardPage';
    import ProtectedRoute from '@/components/ProtectedRoute';
    import AdminProtectedRoute from '@/components/AdminProtectedRoute';
    import { AuthProvider } from '@/contexts/AuthContext';
    import { Toaster } from '@/components/ui/toaster';
    import { Home, Rss, CalendarCheck, LayoutDashboard as DashboardIcon, ShieldCheck, Info as InfoIcon } from 'lucide-react';
    import BookAppointmentPage from '@/pages/BookAppointmentPage';
    import InstructionsPage from '@/pages/InstructionsPage';
    import EmailConfirmationPage from '@/pages/EmailConfirmationPage';
    import EmailConfirmationHandler from '@/pages/EmailConfirmationHandler';

    // Debug logging utility for App component
    const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';
    const debugLog = (message, ...args) => {
      if (DEBUG_MODE) {
        console.info(`[APP DEBUG] ${message}`, ...args);
      }
    };

    const baseNavLinks = [
      { to: '/', label: 'Home', Icon: Home, public: true },
      { to: '/blog', label: 'Blogs', Icon: Rss, public: true },
      { to: '/book-appointment', label: 'Appointments', Icon: CalendarCheck, public: true },
    ];
    
    const authNavLinks = [
      { to: '/dashboard', label: 'Dashboard', Icon: DashboardIcon, public: false, requiresAuth: true, adminOnly: false },
      { to: '/admin-dashboard', label: 'Admin', Icon: ShieldCheck, public: false, requiresAuth: true, adminOnly: true },
      { to: '/admin/instructions', label: 'Instructions', Icon: InfoIcon, public: false, requiresAuth: true, adminOnly: true },
    ];

    function App() {
      debugLog('App component render started');
      debugLog('Current URL:', window.location.href);
      debugLog('Current pathname:', window.location.pathname);
      
      return (
        <Router>
          <AuthProvider>
            <Layout baseNavLinks={baseNavLinks} authNavLinks={authNavLinks}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/book-appointment" element={<BookAppointmentPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
                <Route path="/auth/callback" element={<EmailConfirmationHandler />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin-dashboard/*" 
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboardPage />
                    </AdminProtectedRoute>
                  } 
                />
                 <Route 
                  path="/admin/instructions" 
                  element={
                    <AdminProtectedRoute>
                      <InstructionsPage />
                    </AdminProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
            <Toaster />
          </AuthProvider>
        </Router>
      );
    }

    export default App;