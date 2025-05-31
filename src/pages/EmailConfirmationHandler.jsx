import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const EmailConfirmationHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (type === 'signup' && token) {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (error) {
            console.error('Email confirmation error:', error);
            toast({
              variant: "destructive",
              title: "Confirmation Failed",
              description: "Failed to confirm your email. The link may have expired."
            });
            navigate('/auth');
          } else if (data.user) {
            toast({
              title: "Email Confirmed!",
              description: "Your account has been successfully confirmed. Welcome!"
            });
            // User will be redirected by the auth state change listener
          }
        } catch (error) {
          console.error('Unexpected error during email confirmation:', error);
          toast({
            variant: "destructive",
            title: "Confirmation Error",
            description: "An unexpected error occurred. Please try again."
          });
          navigate('/auth');
        }
      } else {
        // No confirmation parameters, redirect to home
        navigate('/');
      }
    };

    handleEmailConfirmation();
  }, [navigate, searchParams, toast]);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg">Confirming your email...</p>
      </div>
    </div>
  );
};

export default EmailConfirmationHandler;