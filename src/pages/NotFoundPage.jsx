
    import React from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { motion } from 'framer-motion';
    import { AlertTriangle, Home } from 'lucide-react';

    const NotFoundPage = () => {
      return (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-900 dark:via-orange-900 dark:to-yellow-900 rounded-xl shadow-2xl"
        >
          <AlertTriangle className="w-24 h-24 md:w-32 md:h-32 text-destructive mb-8 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-bold text-destructive mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
            Oops! Page Not Found.
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-md">
            The page you're looking for doesn't seem to exist. It might have been moved or deleted.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Go Back to Homepage
            </Link>
          </Button>
        </motion.div>
      );
    };

    export default NotFoundPage;
  