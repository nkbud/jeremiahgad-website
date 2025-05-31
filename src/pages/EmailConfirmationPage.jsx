import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const EmailConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12"
    >
      <Card className="glassmorphism-card w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-primary">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {email && (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Email sent to:</p>
              <p className="font-medium text-primary">{email}</p>
            </div>
          )}
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Check your inbox</p>
                <p>Look for an email from us with the subject "Confirm your account"</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Click the confirmation link</p>
                <p>This will verify your email and activate your account</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Start using your account</p>
                <p>Once confirmed, you'll be able to access all features</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center mb-4">
              Didn't receive the email? Check your spam folder or try signing up again.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmailConfirmationPage;