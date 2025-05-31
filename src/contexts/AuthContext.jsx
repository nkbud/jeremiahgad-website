import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

// Debug logging utility - using console.info for better visibility
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';
const debugLog = (message, ...args) => {
  if (DEBUG_MODE) {
    console.info(`[AUTH DEBUG] ${message}`, ...args);
  }
};

const AuthContext = createContext(null);

const fetchUserProfile = async (userId, toast) => {
  if (!userId) return null;
  debugLog('Fetching user profile for userId:', userId);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      // Don't throw error if profile not found, it might be created by trigger later
      if (error.code === 'PGRST116') { 
        debugLog("User profile not found, might be pending creation:", userId);
        console.warn("User profile not found, might be pending creation:", userId);
        return null;
      }
      throw error;
    }
    debugLog('User profile fetched successfully:', data);
    return data;
  } catch (error) {
    debugLog('Error fetching user profile:', error);
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
  
  debugLog('AuthProvider initialized, initial loading state:', true);
  
  // Helper function to update loading state with debug logging
  const setLoadingWithDebug = (newLoadingState, reason) => {
    debugLog(`Setting loading state to ${newLoadingState} - Reason: ${reason}`);
    debugLog(`Previous loading state was: ${loading}`);
    debugLog('Current pathname:', window.location.pathname);
    debugLog('Current user:', user?.id || 'null');
    setLoading(newLoadingState);
  };
  
  useEffect(() => {
    debugLog('AuthProvider useEffect starting - initializing session');
    debugLog('Supabase URL:', supabase.supabaseUrl);
    debugLog('Browser storage check - localStorage available:', typeof localStorage !== 'undefined');
    debugLog('Browser storage check - sessionStorage available:', typeof sessionStorage !== 'undefined');
    
    let mounted = true; // Track if component is still mounted
    
    const getSessionAndProfile = async () => {
      debugLog('getSessionAndProfile called');
      try {
        debugLog('Calling supabase.auth.getSession() with timeout...');
        
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session restoration timeout after 10 seconds')), 10000);
        });
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);
        
        debugLog('Session call completed successfully');
        
        if (sessionError) {
          debugLog('Session error:', sessionError);
          throw sessionError;
        }

        if (!mounted) {
          debugLog('Component unmounted, aborting getSessionAndProfile');
          return;
        }

        debugLog('Session retrieved:', session?.user?.id ? `User ID: ${session.user.id}` : 'No session');
        setUser(session?.user ?? null);
        
        if (session?.user) {
          debugLog('User found in session, fetching profile');
          const userProfile = await fetchUserProfile(session.user.id, toast);
          if (!mounted) {
            debugLog('Component unmounted during profile fetch, aborting');
            return;
          }
          debugLog('Profile fetch result:', userProfile);
          setProfile(userProfile);
        } else {
          debugLog('No user in session, setting profile to null');
          setProfile(null);
        }
      } catch (error) {
        debugLog("Error in getSessionAndProfile:", error);
        console.error("Error in getSessionAndProfile:", error);
        
        // If session restoration fails, clear any potentially corrupted session
        if (error.message?.includes('timeout') || error.message?.includes('network')) {
          debugLog('Session restoration failed, clearing potentially corrupted session');
          try {
            await supabase.auth.signOut();
            debugLog('Successfully cleared corrupted session');
          } catch (signOutError) {
            debugLog('Failed to clear session:', signOutError);
          }
        }
        
        if (mounted) {
          // For timeout errors, show a more specific message
          const errorMessage = error.message?.includes('timeout') 
            ? "Session restoration timed out. Please sign in again."
            : "Failed to initialize session.";
          
          toast({ 
            variant: "destructive", 
            title: "Auth Error", 
            description: errorMessage 
          });
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          debugLog('getSessionAndProfile completed, setting loading to false');
          setLoadingWithDebug(false, 'getSessionAndProfile completed');
        }
      }
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          debugLog('Component unmounted, ignoring auth state change');
          return;
        }
        
        debugLog('==== AUTH STATE CHANGE EVENT START ====');
        debugLog('Auth state change:', event, session?.user?.id || 'no user');
        debugLog('Current pathname:', window.location.pathname);
        debugLog('Current user state before change:', user?.id || 'null');
        debugLog('Current loading state before change:', loading);
        
        // Only set loading for events that require user action or significant state changes
        // Never show loading for INITIAL_SESSION or when just restoring existing sessions
        const shouldShowLoading = event === 'SIGNED_UP' || event === 'SIGNED_OUT' || 
                                 (event === 'SIGNED_IN' && window.location.pathname === '/auth');
        
        debugLog('Should show loading?', shouldShowLoading, 'for event:', event);
        
        if (shouldShowLoading) {
          setLoadingWithDebug(true, `Auth event: ${event}`);
        }
        
        debugLog('Setting user state to:', session?.user?.id || 'null');
        setUser(session?.user ?? null);
        let userProfile = null;
        if (session?.user) {
          // Try to fetch profile, might take a moment if it's new (created by trigger)
          // Add a small delay or retry mechanism if profiles are not immediately available after signup
          if (event === 'SIGNED_UP') {
            debugLog('SIGNED_UP event, adding delay before profile fetch');
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for new signups
          }
          debugLog('Fetching profile for user:', session.user.id);
          userProfile = await fetchUserProfile(session.user.id, toast);
          debugLog('Profile fetch completed:', userProfile?.id || 'null');
          if (mounted) {
            setProfile(userProfile);
          }
        } else {
          debugLog('No user in session, setting profile to null');
          if (mounted) {
            setProfile(null);
          }
        }
        
        // Only navigate on actual sign in/out events, not on session restoration
        // This prevents disrupting user navigation when they revisit the site
        if (event === 'SIGNED_IN' && mounted) {
          debugLog('SIGNED_IN event - checking if should navigate');
          // Only navigate if we're currently on the auth page to avoid disrupting user navigation
          if (window.location.pathname === '/auth') {
            const targetPath = userProfile?.is_admin ? '/admin-dashboard' : '/dashboard';
            debugLog('Navigating to:', targetPath);
            navigate(targetPath);
          } else {
            debugLog('Not navigating - not on auth page, current path:', window.location.pathname);
          }
        } else if (event === 'SIGNED_OUT' && mounted) {
          debugLog('SIGNED_OUT event - navigating to home');
          navigate('/');
        }
        
        // Only reset loading if we set it to true earlier
        if (shouldShowLoading && mounted) {
          debugLog('Resetting loading state after auth event processing');
          setLoadingWithDebug(false, `Auth event ${event} processing completed`);
        }
        
        debugLog('==== AUTH STATE CHANGE EVENT END ====');
      }
    );

    return () => {
      mounted = false;
      debugLog('AuthProvider useEffect cleanup - unsubscribing auth listener');
      authListener?.subscription?.unsubscribe();
    };
  }, []); // Remove navigate and toast from dependencies to prevent re-runs

  const signUp = async (email, password, fullName) => {
    debugLog('signUp called for email:', email);
    setLoadingWithDebug(true, 'signUp initiated');
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
      debugLog('signUp error:', error);
      toast({ variant: "destructive", title: "Sign up failed", description: error.message });
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      debugLog('signUp - account already exists');
       toast({ title: "Account already exists", description: "An account with this email already exists. Please try logging in." });
    } else if (data.user) {
      debugLog('signUp successful, user created:', data.user.id);
      toast({ title: "Sign up successful!", description: "Please check your email to confirm your account." });
      // Navigate to email confirmation page with the email
      navigate('/email-confirmation', { state: { email } });
      // Profile might not be available immediately due to trigger, handled by onAuthStateChange
    }
    setLoadingWithDebug(false, 'signUp completed');
    return { user: data.user, error };
  };

  const signIn = async (email, password) => {
    debugLog('signIn called for email:', email);
    setLoadingWithDebug(true, 'signIn initiated');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      debugLog('signIn error:', error);
      toast({ variant: "destructive", title: "Sign in failed", description: error.message });
    } else if (data.user) {
      debugLog('signIn successful, user:', data.user.id);
      const userProfile = await fetchUserProfile(data.user.id, toast);
      setProfile(userProfile); // This will be updated again by onAuthStateChange, but good for immediate feedback
      toast({ title: "Sign in successful!", description: `Welcome back, ${userProfile?.full_name || data.user.email}!` });
    }
    // setLoading(false) is handled by onAuthStateChange after navigation
    debugLog('signIn method completed, loading will be reset by auth state change');
    return { user: data.user, error };
  };

  const signOut = async () => {
    debugLog('signOut called');
    setLoadingWithDebug(true, 'signOut initiated');
    const { error } = await supabase.auth.signOut();
    if (error) {
      debugLog('signOut error:', error);
      toast({ variant: "destructive", title: "Sign out failed", description: error.message });
    } else {
      debugLog('signOut successful');
      toast({ title: "Signed out", description: "You have been successfully signed out." });
    }
    // setLoading(false) is handled by onAuthStateChange after navigation
    debugLog('signOut method completed, loading will be reset by auth state change');
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
  debugLog('AuthProvider render - loading state:', loading, 'will render children:', !loading);
  
  if (loading) {
    debugLog('AuthProvider rendering loading screen due to loading state');
    debugLog('Current user:', user?.id || 'null');
    debugLog('Current profile:', profile?.id || 'null');
    debugLog('Current pathname:', window.location.pathname);
    return <AuthContext.Provider value={value}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        flexDirection: 'column'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading...</div>
          {DEBUG_MODE && (
            <div style={{ fontSize: '12px', color: '#666', maxWidth: '400px' }}>
              <div>Debug Mode Active</div>
              <div>User: {user?.id || 'null'}</div>
              <div>Profile: {profile?.id || 'null'}</div>
              <div>Path: {window.location.pathname}</div>
              <div style={{ marginTop: '10px', color: '#999' }}>
                Check console for detailed logs
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthContext.Provider>;
  }
  
  debugLog('AuthProvider rendering children normally');
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
