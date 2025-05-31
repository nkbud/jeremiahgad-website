import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Home, UserCheck, BookOpen, Tag, Rss, CalendarCheck, Sparkles, TrendingUp, MessageCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const quickLinks = [
  { to: '/buyer-academy', label: 'Buyer Academy', Icon: BookOpen, description: "Navigate the buying process like a pro." },
  { to: '/seller-academy', label: 'Seller Academy', Icon: Tag, description: "Maximize your home's sale potential." },
  { to: '/blog', label: 'Real Estate Blog', Icon: Rss, description: "Insights, tips, and market updates." },
  { to: '/book-appointment', label: 'Book an Appointment', Icon: CalendarCheck, description: "Schedule your consultation today." },
];

const HomePage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoadingTestimonials(true);
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(2); 

        if (error) throw error;
        setTestimonials(data || []);
      } catch (err) {
        console.error("Error fetching testimonials for homepage:", err);
        toast({
          variant: "destructive",
          title: "Could not load testimonials",
          description: "There was an issue fetching client stories.",
        });
      } finally {
        setLoadingTestimonials(false);
      }
    };
    fetchTestimonials();
  }, [toast]);

  return (
    <div className="space-y-12">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center py-16 md:py-24 rounded-xl overflow-hidden bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-700 shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 container mx-auto px-4">
          <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-white shadow-lg">
            <img  alt="Professional photo of Jeremiah Gadway" className="object-cover" src="https://images.unsplash.com/photo-1648267206011-e4ccc21922e8" />
            <AvatarFallback className="text-4xl bg-secondary text-secondary-foreground">JG</AvatarFallback>
          </Avatar>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Jeremiah Gadway
          </h1>
          <p className="text-xl md:text-2xl text-sky-100 mb-2 max-w-2xl mx-auto">
            Your Trusted Partner in Real Estate
          </p>
          <p className="text-lg text-sky-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Helping You Buy & Sell Real Estate With Confidence. Expert guidance, personalized service, and exceptional results.
          </p>
          <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-lg px-8 py-3 shadow-md transform hover:scale-105 transition-transform duration-200">
            <Link to="/book-appointment">Book a Free Consultation</Link>
          </Button>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="py-12"
      >
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
          <Sparkles className="inline-block mr-2 text-primary h-8 w-8" />
          Explore My Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 glassmorphism-card bg-background/70 dark:bg-slate-800/70">
                <CardHeader className="items-center text-center">
                  <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-full mb-3">
                    <link.Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-primary">{link.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-foreground/80 dark:text-slate-300">{link.description}</CardDescription>
                </CardContent>
                <div className="p-6 pt-0 text-center">
                    <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <Link to={link.to}>Learn More</Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="py-12 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-lg"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                <UserCheck className="inline-block mr-2 text-primary h-8 w-8" />
                Why Choose Jeremiah?
              </h2>
              <p className="text-lg text-foreground/80 dark:text-slate-300 mb-6 leading-relaxed">
                With years of experience in the local market, I provide unparalleled expertise and dedication to achieve your real estate goals. Whether you're a first-time buyer or a seasoned investor, I'm here to guide you every step of the way.
              </p>
              <ul className="space-y-3 text-foreground/80 dark:text-slate-300">
                <li className="flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-secondary" /> Proven track record of success.</li>
                <li className="flex items-center"><MessageCircle className="h-5 w-5 mr-2 text-secondary" /> Clear and consistent communication.</li>
                <li className="flex items-center"><Home className="h-5 w-5 mr-2 text-secondary" /> Deep local market knowledge.</li>
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img   
                className="w-full h-auto object-cover" 
                alt="Modern house exterior" src="https://images.unsplash.com/photo-1654200150895-5be29dc62762" />
            </div>
          </div>
        </div>
      </motion.section>

      {loadingTestimonials ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading testimonials...</p>
        </div>
      ) : testimonials.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="py-12"
        >
          <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
            <MessageCircle className="inline-block mr-2 text-primary h-8 w-8" />
            Hear From My Clients
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="bg-background dark:bg-slate-800/80 glassmorphism-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={testimonial.avatar_url || `https://source.unsplash.com/random/100x100/?person,client&sig=${testimonial.id}`} alt={`Avatar of ${testimonial.client_name}`} />
                        <AvatarFallback className="bg-primary text-primary-foreground">{testimonial.avatar_fallback || testimonial.client_name.substring(0,2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.client_name}</p>
                        {testimonial.rating && (
                          <div className="flex text-secondary">
                            {[...Array(testimonial.rating)].map((_, i) => <Sparkles key={i} className="h-4 w-4 fill-current" />)}
                            {[...Array(5 - testimonial.rating)].map((_, i) => <Sparkles key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />)}
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

export default HomePage;