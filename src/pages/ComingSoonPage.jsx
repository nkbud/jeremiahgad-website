
    import React from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { motion } from 'framer-motion';
    import { Construction, ArrowLeft } from 'lucide-react';

    const ComingSoonPage = ({ title }) => {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-800 dark:to-sky-900 rounded-xl shadow-2xl"
        >
          <Construction className="w-24 h-24 md:w-32 md:h-32 text-primary mb-8 animate-bounce" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {title} - Coming Soon!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md">
            We're working hard to bring you this exciting new section. Stay tuned for updates!
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back Home
            </Link>
          </Button>
        </motion.div>
      );
    };

    export default ComingSoonPage;
  