import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Tag, Home, Star, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getIcon } from '@/lib/icons';
import { useToast } from '@/components/ui/use-toast';

const SellerAcademyPage = () => {
  const [academyHighlights, setAcademyHighlights] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: academyTypeData, error: typeError } = await supabase
          .from('academy_types')
          .select('id')
          .eq('name', 'Seller')
          .single();

        if (typeError || !academyTypeData) {
          throw typeError || new Error('Seller academy type not found.');
        }
        const sellerAcademyTypeId = academyTypeData.id;

        const { data: highlightsData, error: highlightsError } = await supabase
          .from('academy_modules')
          .select('*')
          .eq('academy_type_id', sellerAcademyTypeId)
          .order('id');
        if (highlightsError) throw highlightsError;
        setAcademyHighlights(highlightsData || []);

        const { data: testimonialsData, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('*')
          .eq('academy_type_id', sellerAcademyTypeId)
          .order('created_at', { ascending: false })
          .limit(3);
        if (testimonialsError) throw testimonialsError;
        setTestimonials(testimonialsData || []);

      } catch (err) {
        console.error("Error fetching Seller Academy data:", err);
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Failed to load content",
          description: "Could not fetch Seller Academy data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Seller Academy...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Content</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl shadow-xl"
      >
        <Tag className="h-16 w-16 text-white mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Seller Academy</h1>
        <p className="text-xl text-amber-100 max-w-2xl mx-auto">
          Guiding you through a successful home sale, from preparation to closing.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="glassmorphism-card bg-background/70 dark:bg-slate-800/70">
          <CardHeader>
            <CardTitle className="text-2xl text-secondary">Unlock Your Home's Potential</CardTitle>
            <CardDescription>Our Seller Academy provides expert strategies to maximize your sale price and minimize stress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/80 dark:text-slate-300">Learn everything from prepping your home for the market, understanding current pricing trends, effective marketing techniques, to navigating offers and the closing process. We provide blog posts, videos, and podcast episodes to support your journey.</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex-1">
                <Link to="/consultation">Schedule a Listing Consultation</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground flex-1">
                <Link to="/blog?category=Sellers">View Seller Resources</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {academyHighlights.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            <Home className="inline-block mr-2 text-secondary h-8 w-8" />
            Academy Highlights
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {academyHighlights.map((highlight, index) => (
              <motion.div
                key={highlight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-md">
                    {getIcon(highlight.icon_name, { className: "h-6 w-6 text-primary" })}
                  </div>
                  <CardTitle className="text-lg">{highlight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{highlight.description}</p>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
      
      {testimonials.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="py-12 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-lg"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            <Star className="inline-block mr-2 text-secondary h-8 w-8" />
            What Our Sellers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              >
              <Card className="bg-background dark:bg-slate-700 text-center h-full flex flex-col">
                <CardContent className="pt-6 flex-grow flex flex-col items-center">
                  <Avatar className="h-16 w-16 mb-4">
                    <AvatarImage src={testimonial.avatar_url || `https://source.unsplash.com/random/100x100/?person,happy&sig=${testimonial.id}`} alt={`Avatar of ${testimonial.client_name}`} />
                    <AvatarFallback className="bg-secondary text-white">{testimonial.avatar_fallback || testimonial.client_name.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-foreground mb-1">{testimonial.client_name}</p>
                  {testimonial.rating && (
                    <div className="flex text-amber-400 mb-3 justify-center">
                      {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                      {[...Array(5 - testimonial.rating)].map((_, i) => <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />)}
                    </div>
                  )}
                  <blockquote className="italic text-sm text-muted-foreground flex-grow">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default SellerAcademyPage;