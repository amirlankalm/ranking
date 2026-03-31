"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      setProfile(data);
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  const requireAuth = (callbackAction) => {
    if (session) {
      if (typeof callbackAction === 'function') callbackAction();
      return true;
    } else {
      // Redirect to our standalone auth page instead
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    addToast('Logged out successfully', 'info');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user ?? null,
      profile,
      isAdmin: profile?.is_admin === true,
      loading, 
      requireAuth, 
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
