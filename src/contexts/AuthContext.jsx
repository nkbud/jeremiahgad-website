import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

const fetchUserProfile = async (userId, toast) => {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      // Don't throw error if profile not found, it might be created by trigger later
      if (error.code === 'PGRST116') { 
        console.warn("User profile not found, might be pending creation:", userId);
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    if (toast) {
      toast({ variant: "destructive", title: "Profile Error", description: "Could not load user profile." });
    }
    return null;
  }
};

const AuthProviderComponent = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    setLoading(true); // Ensure loading is true at the start of any auth change
    const getSessionAndProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        setUser(session?.user ?? null);
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id, toast);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error in getSessionAndProfile:", error);
        toast({ variant: "destructive", title: "Auth Error", description: "Failed to initialize session." });
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        // Only set loading for actual auth events, not initial session restoration
        // This prevents the blank page issue when users revisit the site
        if (event !== 'INITIAL_SESSION') {
          setLoading(true);
        }
        
        setUser(session?.user ?? null);
        let userProfile = null;
        if (session?.user) {
          // Try to fetch profile, might take a moment if it's new (created by trigger)
          // Add a small delay or retry mechanism if profiles are not immediately available after signup
          if (event === 'SIGNED_UP') {
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for new signups
          }
          userProfile = await fetchUserProfile(session.user.id, toast);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        // Only navigate on actual sign in/out events, not on session restoration
        // This prevents disrupting user navigation when they revisit the site
        if (event === 'SIGNED_IN') {
          // Only navigate if we're currently on the auth page to avoid disrupting user navigation
          if (window.location.pathname === '/auth') {
            navigate(userProfile?.is_admin ? '/admin-dashboard' : '/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          navigate('/');
        }
        
        setLoading(false); // Set loading false after processing
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate, toast]);

  const signUp = async (email, password, fullName) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      toast({ variant: "destructive", title: "Sign up failed", description: error.message });
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
       toast({ title: "Account already exists", description: "An account with this email already exists. Please try logging in." });
    } else if (data.user) {
      toast({ title: "Sign up successful!", description: "Please check your email to confirm your account." });
      // Navigate to email confirmation page with the email
      navigate('/email-confirmation', { state: { email } });
      // Profile might not be available immediately due to trigger, handled by onAuthStateChange
    }
    setLoading(false);
    return { user: data.user, error };
  };

  const signIn = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast({ variant: "destructive", title: "Sign in failed", description: error.message });
    } else if (data.user) {
      const userProfile = await fetchUserProfile(data.user.id, toast);
      setProfile(userProfile); // This will be updated again by onAuthStateChange, but good for immediate feedback
      toast({ title: "Sign in successful!", description: `Welcome back, ${userProfile?.full_name || data.user.email}!` });
    }
    // setLoading(false) is handled by onAuthStateChange after navigation
    return { user: data.user, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ variant: "destructive", title: "Sign out failed", description: error.message });
    } else {
      toast({ title: "Signed out", description: "You have been successfully signed out." });
    }
    // setLoading(false) is handled by onAuthStateChange after navigation
  };
  
  const isAdmin = profile?.is_admin || false;

  const value = {
    user,
    profile,
    isAdmin,
    signUp,
    signIn,
    signOut,
    loading,
  };

  // Only render children when loading is false
  return <AuthContext.Provider value={value}>{!loading ? children : null}</AuthContext.Provider>;
};


export const AuthProvider = ({ children }) => (
  <AuthProviderComponent>{children}</AuthProviderComponent>
);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
