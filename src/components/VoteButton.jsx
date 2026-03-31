import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export default function VoteButton({ votes, isVoted, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-xl border transition-all shrink-0 ${
        isVoted 
          ? 'bg-accent-gold/10 border-accent-gold text-accent-gold shadow-[0_0_15px_rgba(245,197,24,0.2)]' 
          : 'bg-card border-white/10 text-muted hover:border-white/30 hover:text-white shadow-lg'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <ChevronUp className={`w-6 h-6 -mb-1 transition-transform ${isVoted ? 'text-accent-gold translate-y-[-2px]' : ''}`} />
      <div className="relative h-5 w-full overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div 
            key={votes}
            initial={{ opacity: 0, y: isVoted ? 15 : -15 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isVoted ? -15 : 15, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="font-bold text-sm tracking-tight absolute inset-0 flex items-center justify-center"
          >
            {votes}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
