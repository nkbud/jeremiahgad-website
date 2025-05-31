import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, PlusCircle, CalendarPlus, ListOrdered } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation, Routes, Route, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import CreateBlogPostForm from '@/components/admin/CreateBlogPostForm';
import ManageAvailabilityForm from '@/components/admin/ManageAvailabilityForm';


const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = useMemo(() => {
    const pathParts = location.pathname.split('/');
    return pathParts[pathParts.length - 1] || 'create-post';
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/admin-dashboard' || location.pathname === '/admin-dashboard/') {
      navigate('create-post', { replace: true });
    }
  }, [location.pathname, navigate]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <section className="text-center py-12 bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700 rounded-xl shadow-xl">
        <ShieldCheck className="h-16 w-16 text-white mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-lg text-emerald-100">Content & Appointment Management</p>
      </section>

      <Tabs value={currentTab} onValueChange={(value) => navigate(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="create-post" asChild><Link to="create-post"><PlusCircle className="mr-2 h-4 w-4" />Create Blog Post</Link></TabsTrigger>
          <TabsTrigger value="manage-availability" asChild><Link to="manage-availability"><CalendarPlus className="mr-2 h-4 w-4"/>Manage Availability</Link></TabsTrigger>
          <TabsTrigger value="manage-bookings" asChild><Link to="manage-bookings"><ListOrdered className="mr-2 h-4 w-4"/>Manage Bookings</Link></TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Routes>
              <Route path="create-post" element={<CreateBlogPostForm />} />
              <Route path="manage-availability" element={<ManageAvailabilityForm />} />
              <Route path="manage-bookings" element={
                  <Card className="glassmorphism-card">
                      <CardHeader><CardTitle>Manage Bookings</CardTitle><CardDescription>View and manage upcoming appointments.</CardDescription></CardHeader>
                      <CardContent><p>Booking management interface coming soon!</p></CardContent>
                  </Card>
              } />
          </Routes>
        </div>
      </Tabs>

      <style jsx global>{`
        .ql-editor {
          min-height: 200px; 
          font-size: 1rem;
          color: hsl(var(--foreground));
        }
        .ql-toolbar.ql-snow {
          border-top-left-radius: var(--radius);
          border-top-right-radius: var(--radius);
          border-bottom: none;
          background-color: hsl(var(--muted));
        }
        .ql-container.ql-snow {
          border-bottom-left-radius: var(--radius);
          border-bottom-right-radius: var(--radius);
          border-top: 1px solid hsl(var(--border));
        }
        .dark .ql-editor { color: hsl(var(--primary-foreground)); }
        .dark .ql-toolbar.ql-snow .ql-stroke { stroke: hsl(var(--primary-foreground)); }
        .dark .ql-toolbar.ql-snow .ql-picker-label { color: hsl(var(--primary-foreground)); }
        .dark .ql-toolbar.ql-snow .ql-fill { fill: hsl(var(--primary-foreground)); }
      `}</style>
    </motion.div>
  );
};

export default AdminDashboardPage;