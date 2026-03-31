"use client";
import { useStudents } from '../hooks/useStudents';
import { useVotes } from '../hooks/useVotes';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StudentCard from '../components/StudentCard';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function RankingPage() {
  const { students, loading, fetchStudents } = useStudents();
  const { userVotes, hasVoted, setUserVotes } = useVotes();
  const { requireAuth, user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const handleVote = async (studentId, isVoted) => {
    if (!requireAuth()) return;

    // Optimistic UI for button state
    const newVotes = new Set(userVotes);
    if (isVoted) newVotes.delete(studentId);
    else newVotes.add(studentId);
    setUserVotes(newVotes);

    if (isVoted) {
      const { error } = await supabase
        .from('votes')
        .delete()
        .match({ student_id: studentId, user_id: user.id });
        
      if (error) {
        addToast(error.message, 'error');
        setUserVotes(userVotes); // revert
      } else {
        // Optimistic cache mutation for snappy counter feel
        // The realtime subscription will eventually true this up
      }
    } else {
      const { error } = await supabase
        .from('votes')
        .insert({ student_id: studentId, user_id: user.id });
        
      if (error) {
        addToast(error.message, 'error');
        setUserVotes(userVotes); // revert
      }
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Student deleted', 'success');
      fetchStudents();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-accent-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="text-center mb-12 sm:mb-16 mt-8">
        <h1 className="font-heading text-5xl sm:text-7xl font-bold tracking-tight mb-4 drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
          NIS RANKING
        </h1>
        <p className="text-muted text-lg sm:text-xl font-medium tracking-wide">
          Vote for the most outstanding students
        </p>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-20 bg-card/30 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-2xl font-bold mb-2">The leaderboard is empty</h2>
          <p className="text-muted mb-6">Be the first to nominate an outstanding student.</p>
          <button
            onClick={() => requireAuth(() => router.push('/add'))}
            className="bg-accent-gold text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(245,197,24,0.3)]"
          >
            Nominate Someone
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {students.map((student, index) => (
              <StudentCard
                key={student.id}
                student={student}
                rank={index + 1}
                isVoted={hasVoted(student.id)}
                onVote={handleVote}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
