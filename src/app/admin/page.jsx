"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useStudents } from '../../hooks/useStudents';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { Shield, Check, X, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminInbox() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { students: pendingStudents, loading: studentsLoading, fetchStudents, setStudents } = useStudents('pending');
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/admin');
    } else if (!authLoading && user && !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  const handleAction = async (studentId, status) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ status })
        .eq('id', studentId);
        
      if (error) throw error;
      
      // Optimistic UI for Framer exit animation
      setStudents(prev => prev.filter(s => s.id !== studentId));
      addToast(`Student ${status} successfully`, 'success');
    } catch (error) {
      addToast(error.message || 'Failed to update student', 'error');
    }
  };

  if (authLoading || studentsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
      </div>
    );
  }

  if (!isAdmin) return null; // Will redirect in useEffect

  return (
    <div className="w-full relative z-10 space-y-8 animate-fade-in">
      <div className="glass-panel rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="mr-2 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors hidden sm:flex">
            <ArrowLeft className="w-5 h-5 text-muted hover:text-white" />
          </Link>
          <div className="w-12 h-12 rounded-xl bg-accent-gold/20 flex items-center justify-center border border-accent-gold/30">
            <Shield className="w-6 h-6 text-accent-gold" />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Admin Inbox
          </h1>
        </div>
        
        <p className="text-muted text-lg max-w-2xl leading-relaxed sm:ml-[4.5rem]">
          Review new student submissions before they appear on the public leaderboard. 
          Approving a student instantly shares them with the community.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Pending Approvals
            <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">{pendingStudents.length}</span>
          </h2>
        </div>

        {pendingStudents.length === 0 ? (
          <div className="glass-panel p-16 rounded-2xl flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
            <p className="text-muted max-w-sm">There are no pending student submissions waiting for your review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {pendingStudents.map((student) => (
                <motion.div
                  layout
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)', y: 20 }}
                  className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row gap-6 border border-white/10 group hover:border-white/20 transition-all"
                >
                  <div className="relative w-full sm:w-28 h-40 sm:h-28 rounded-xl overflow-hidden bg-black/50 shrink-0">
                    <Image 
                      src={student.photo_url || '/placeholder.png'}
                      alt={student.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 112px"
                    />
                  </div>
                  
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-white tracking-wide">
                        {student.name}
                      </h3>
                      <p className="text-sm font-medium text-accent-gold mt-1">
                        Class {student.class}
                      </p>
                      <p className="text-sm text-muted mt-2 truncate">
                        @{student.instagram_username}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                      <button
                        onClick={() => handleAction(student.id, 'rejected')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-medium transition-colors text-sm"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => handleAction(student.id, 'approved')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 font-medium transition-colors text-sm"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
