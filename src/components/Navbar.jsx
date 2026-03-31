"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Trophy, Inbox } from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout, requireAuth } = useAuth();
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/60 backdrop-blur-xl border-b border-white/5 transition-all w-full leading-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white hover:text-accent-gold transition-colors shrink-0">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-accent-gold" />
          <span className="font-heading font-bold text-lg sm:text-xl tracking-wider pt-1 hidden xs:inline block">NIS RANKING</span>
        </Link>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link 
              href="/admin"
              className="flex items-center gap-1.5 text-sm font-medium text-white hover:text-accent-gold transition-colors mr-1 sm:mr-2"
              title="Admin Inbox"
            >
              <Inbox className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Inbox</span>
            </Link>
          )}
          <button 
            onClick={() => requireAuth(() => router.push('/add'))}
            className="flex items-center gap-1.5 text-sm font-medium text-black bg-accent-gold hover:bg-yellow-400 p-2 sm:px-4 sm:py-2 rounded-full transition-shadow hover:shadow-[0_0_15px_rgba(245,197,24,0.4)]"
            title="Nominate Student"
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Add Student</span>
          </button>
          
          {user ? (
            <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-card border border-white/10 flex items-center justify-center text-xs font-bold uppercase text-accent-gold shadow-sm shrink-0">
                {user.email.charAt(0)}
              </div>
              <button 
                onClick={logout}
                className="text-muted hover:text-white transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => requireAuth()}
              className="text-sm font-medium text-white hover:text-accent-gold transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
