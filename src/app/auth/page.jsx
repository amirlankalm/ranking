"use client";

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(redirect);
    });
  }, [router, redirect]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!isLogin && !name) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        addToast('Logged in successfully', 'success');
        router.push(redirect);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        
        // As requested, bypass explicit email confirmation workflow locally
        addToast('Welcome to NIS Ranking!', 'success');
        router.push(redirect);
      }
    } catch (error) {
      addToast(error.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[85vh] w-full rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl relative">
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none mix-blend-overlay" />
      
      {/* Visual / Branding Section */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-black/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-gold/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen" />
        </div>
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-accent-gold transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent-gold/20 flex items-center justify-center border border-accent-gold/30">
              <Sparkles className="w-5 h-5 text-accent-gold" />
            </div>
            <span className="font-heading font-bold text-2xl tracking-wider pt-1">NIS RANKING</span>
          </Link>
        </div>

        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-3xl font-playfair font-medium leading-tight text-white/90">
              "Discover, nominate, and vote for the most outstanding students driving excellence across our community."
            </p>
            <footer className="text-white/60 font-medium tracking-wide">
              The exclusive student leaderboard.
            </footer>
          </blockquote>
          
          <div className="flex gap-4 mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Shield className="w-4 h-4 text-accent-gold" /> Secure Voting
            </div>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Zap className="w-4 h-4 text-accent-gold" /> Real-time Updates
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-background/50 backdrop-blur-md">
        <div className="w-full max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-10 text-center lg:text-left">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-muted text-lg">
                {isLogin 
                  ? 'Sign in to nominate students and cast your votes.' 
                  : 'Join the community to start recognizing excellence.'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="relative group"
                  >
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted transition-colors group-focus-within:text-accent-gold" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder:text-muted/50 shadow-inner"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted transition-colors group-focus-within:text-accent-gold" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder:text-muted/50 shadow-inner"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted transition-colors group-focus-within:text-accent-gold" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder:text-muted/50 shadow-inner"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full bg-accent-gold hover:bg-yellow-400 text-black font-bold py-4 px-4 rounded-2xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 mt-6 shadow-[0_0_20px_rgba(245,197,24,0.15)] hover:shadow-[0_0_25px_rgba(245,197,24,0.3)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-white hover:text-accent-gold transition-colors font-semibold"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="w-full max-w-6xl mx-auto pt-6 pb-12">
      <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent-gold" /></div>}>
        <AuthContent />
      </Suspense>
    </div>
  );
}
