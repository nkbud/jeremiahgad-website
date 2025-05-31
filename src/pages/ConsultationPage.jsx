
    import React from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { CalendarCheck, Phone, Mail, MessageSquare } from 'lucide-react';

    const ConsultationPage = () => {
      return (
        <div className="space-y-12">
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-xl shadow-xl"
          >
            <CalendarCheck className="h-16 w-16 text-white mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Book Your Free Consultation</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Let's discuss your real estate goals and how I can help you achieve them.
            </p>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="glassmorphism-card bg-background/70 dark:bg-slate-800/70">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-primary">Schedule Your Appointment</CardTitle>
                <CardDescription className="text-center">
                  Choose your preferred method to get in touch or use the booking tool below (integration coming soon!).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 border border-dashed border-primary/50 rounded-lg">
                  <p className="text-lg font-semibold text-primary mb-2">Online Booking (Coming Soon)</p>
                  <p className="text-muted-foreground mb-4">
                    Our integrated booking system (e.g., SquareUp) will be available shortly.
                    For now, please use one of the contact methods below.
                  </p>
                  <Button disabled size="lg" className="opacity-50">
                    Booking Tool Placeholder
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex-row items-center gap-3">
                      <Phone className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">Call Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a href="tel:+15551234567" className="text-primary hover:underline">(555) 123-4567</a>
                      <p className="text-sm text-muted-foreground">Mon - Fri, 9 AM - 6 PM</p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex-row items-center gap-3">
                      <Mail className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">Email Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a href="mailto:jeremiah@example.com" className="text-primary hover:underline">jeremiah@example.com</a>
                      <p className="text-sm text-muted-foreground">Response within 24 hours</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-center">
                    <p className="text-muted-foreground mb-2">Or send a quick message:</p>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        <MessageSquare className="mr-2 h-5 w-5" /> Quick Contact Form (Link)
                    </Button>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    };

    export default ConsultationPage;
  