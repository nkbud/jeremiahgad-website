import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { BookOpen, PlayCircle, Download, Users, Star, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getIcon } from '@/lib/icons';
import { useToast } from '@/components/ui/use-toast';

const BuyerAcademyPage = () => {
  const [modules, setModules] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [guides, setGuides] = useState([]);
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
          .eq('name', 'Buyer')
          .single();

        if (typeError || !academyTypeData) {
          throw typeError || new Error('Buyer academy type not found.');
        }
        const buyerAcademyTypeId = academyTypeData.id;

        const { data: modulesData, error: modulesError } = await supabase
          .from('academy_modules')
          .select('*')
          .eq('academy_type_id', buyerAcademyTypeId)
          .order('id');
        if (modulesError) throw modulesError;
        setModules(modulesData || []);

        const { data: testimonialsData, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('*')
          .eq('academy_type_id', buyerAcademyTypeId)
          .order('created_at', { ascending: false })
          .limit(2);
        if (testimonialsError) throw testimonialsError;
        setTestimonials(testimonialsData || []);

        const { data: guidesData, error: guidesError } = await supabase
          .from('guides')
          .select('*')
          .eq('academy_type_id', buyerAcademyTypeId)
          .limit(1);
        if (guidesError) throw guidesError;
        setGuides(guidesData || []);

      } catch (err) {
        console.error("Error fetching Buyer Academy data:", err);
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Failed to load content",
          description: "Could not fetch Buyer Academy data. Please try again later.",
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
        <p className="ml-4 text-lg">Loading Buyer Academy...</p>
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
  
  const buyerGuide = guides.length > 0 ? guides[0] : null;

  return (
    <div className="space-y-12">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 bg-gradient-to-r from-sky-500 to-indigo-600 dark:from-sky-600 dark:to-indigo-700 rounded-xl shadow-xl"
      >
        <BookOpen className="h-16 w-16 text-white mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Buyer Academy</h1>
        <p className="text-xl text-sky-100 max-w-2xl mx-auto">
          Empowering you with the knowledge and tools to make informed home buying decisions.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="glassmorphism-card bg-background/70 dark:bg-slate-800/70">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">What You'll Learn</CardTitle>
            <CardDescription>Our comprehensive Buyer Academy covers every step of your home buying journey, ensuring you're prepared and confident.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-foreground/80 dark:text-slate-300">
              <li>Key steps in the home buying process.</li>
              <li>How to secure financing and understand mortgages.</li>
              <li>Effective negotiation strategies.</li>
              <li>Navigating inspections and appraisals.</li>
              <li>Understanding closing costs and procedures.</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1">
                <Link to="/consultation">Enroll & Book Consultation</Link>
              </Button>
              {buyerGuide && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground flex-1"
                  onClick={() => buyerGuide.file_url ? window.open(buyerGuide.file_url, '_blank') : toast({ title: "Guide not available", description: "The download link for this guide is currently missing."})}
                >
                  <Download className="mr-2 h-5 w-5" /> {buyerGuide.title || "Download Buyer's Guide"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.section>
      
      {modules.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            <PlayCircle className="inline-block mr-2 text-primary h-8 w-8" />
            Key Modules & Resources
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 bg-secondary/10 rounded-md">
                    {getIcon(module.icon_name, { className: "h-6 w-6 text-secondary" })}
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-muted-foreground">Access video tutorials, checklists, and in-depth guides upon enrollment.</p>
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
            <Users className="inline-block mr-2 text-primary h-8 w-8" />
            Success Stories from Buyers
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
              >
              <Card className="bg-background dark:bg-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={testimonial.avatar_url || `https://source.unsplash.com/random/100x100/?person&sig=${testimonial.id}`} alt={`Avatar of ${testimonial.client_name}`} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{testimonial.avatar_fallback || testimonial.client_name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.client_name}</p>
                      {testimonial.rating && (
                        <div className="flex text-secondary">
                          {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                          {[...Array(5 - testimonial.rating)].map((_, i) => <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />)}
                        </div>
                      )}
                    </div>
                  </div>
                  <blockquote className="italic text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</blockquote>
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

export default BuyerAcademyPage;