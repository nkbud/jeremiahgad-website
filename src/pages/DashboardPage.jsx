import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LayoutDashboard, UserCircle, LogOut } from 'lucide-react';

const DashboardPage = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-10">
        <p>Loading user data or redirecting...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <section className="text-center py-12 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-xl shadow-xl">
        <LayoutDashboard className="h-16 w-16 text-white mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">User Dashboard</h1>
        <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
          Welcome to your personal space, {user.user_metadata?.full_name || user.email}!
        </p>
      </section>

      <Card className="glassmorphism-card max-w-2xl mx-auto">
        <CardHeader className="items-center">
          <UserCircle className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl text-primary">Your Profile</CardTitle>
          <CardDescription>Manage your account details and preferences here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>
            <span className="font-semibold">Full Name:</span> {user.user_metadata?.full_name || 'Not provided'}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold">Joined:</span> {new Date(user.created_at).toLocaleDateString()}
          </p>
          <Button onClick={signOut} variant="destructive" className="mt-4">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>

      <section className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline">Edit Profile (Coming Soon)</Button>
          <Button variant="outline">View My Bookings (Coming Soon)</Button>
          <Button variant="outline">Saved Properties (Coming Soon)</Button>
        </div>
      </section>
    </motion.div>
  );
};

export default DashboardPage;