"use client";
import { motion } from 'framer-motion';
import { Camera, Crown, Trash2 } from 'lucide-react';
import Image from 'next/image';
import VoteButton from './VoteButton';
import { useAuth } from '../context/AuthContext';

export default function StudentCard({ student, rank, onVote, isVoted, onDelete }) {
  const { isAdmin } = useAuth();
  const isTop3 = rank <= 3;
  
  let borderColor = 'border-white/5';
  let glowColor = '';
  let shadow = 'shadow-lg';

  if (rank === 1) {
    borderColor = 'border-rank-gold';
    glowColor = 'shadow-[0_0_20px_rgba(255,215,0,0.3)]';
  } else if (rank === 2) {
    borderColor = 'border-rank-silver';
    glowColor = 'shadow-[0_0_15px_rgba(192,192,192,0.2)]';
  } else if (rank === 3) {
    borderColor = 'border-rank-bronze';
    glowColor = 'shadow-[0_0_15px_rgba(205,127,50,0.2)]';
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-6 bg-card/60 backdrop-blur-md border ${borderColor} ${glowColor} ${shadow} overflow-hidden group`}
    >
      {/* Huge faded rank watermark */}
      <span className="absolute -left-4 -bottom-6 text-8xl sm:text-[9rem] font-rank font-bold leading-none text-white/[0.04] select-none pointer-events-none z-0">
        #{rank}
      </span>

      {/* Profile Photo */}
      <div className={`relative shrink-0 z-10 ${rank === 1 ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-16 h-16 sm:w-20 sm:h-20'}`}>
        {rank === 1 && (
          <div className="absolute -top-3 -right-2 text-rank-gold rotate-12 drop-shadow-lg scale-110">
            <Crown size={28} />
          </div>
        )}
        <div className={`w-full h-full rounded-full p-1 ${isTop3 ? 'bg-gradient-to-tr from-white/20 to-white/5' : 'bg-white/5'} relative`}>
          <Image 
            src={student.photo_url || '/placeholder.png'} 
            alt={student.name}
            fill
            sizes="(max-width: 640px) 96px, 128px"
            className="object-cover rounded-full bg-background"
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 z-10">
        <h3 className="font-heading font-bold text-xl sm:text-2xl text-white truncate group-hover:text-accent-gold transition-colors">
          {student.name}
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 sm:mt-2">
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-medium text-indigo-100 w-fit shrink-0">
            {student.class}
          </span>
          <a 
            href={`https://instagram.com/${student.instagram_username.replace('@', '')}`}
            target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-sm text-muted hover:text-white transition-colors truncate"
          >
            <Camera size={14} />
            {student.instagram_username.startsWith('@') ? student.instagram_username : `@${student.instagram_username}`}
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3 z-10">
        {isAdmin && (
          <button 
            onClick={() => onDelete(student.id)}
            className="p-2 sm:p-3 text-muted hover:text-red-400 hover:bg-red-950/30 rounded-full transition-colors sm:opacity-0 group-hover:opacity-100"
            title="Delete Student"
          >
            <Trash2 size={20} />
          </button>
        )}
        {/* Vote Button */}
        <VoteButton 
          votes={student.votes} 
          isVoted={isVoted} 
          onClick={() => onVote(student.id, isVoted)} 
        />
      </div>
    </motion.div>
  );
}
