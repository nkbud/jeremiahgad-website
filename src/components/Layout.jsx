import React from 'react';
    import Navbar from '@/components/Navbar';
    import Footer from '@/components/Footer';
    import { motion } from 'framer-motion';
    import { useLocation } from 'react-router-dom';

    const Layout = ({ children, baseNavLinks, authNavLinks }) => {
      const location = useLocation();
      return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-sky-100 dark:from-slate-900 dark:to-sky-900">
          <Navbar baseNavLinks={baseNavLinks} authNavLinks={authNavLinks} />
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-grow container mx-auto px-4 py-8"
          >
            {children}
          </motion.main>
          <Footer />
        </div>
      );
    };

    export default Layout;