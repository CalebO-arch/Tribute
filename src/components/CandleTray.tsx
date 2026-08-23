import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, MessageCircle, Plus } from 'lucide-react';

interface CandleTrayProps {
  onAddTributeClick: () => void;
  isDark: boolean;
  tributesCount: number;
}

export default function CandleTray({ onAddTributeClick, isDark, tributesCount }: CandleTrayProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`w-full max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-xl border relative mb-12 ${
        isDark 
          ? 'masonry-card border-white/5 bg-gradient-to-br from-white/[0.01] via-transparent to-white/[0.02]' 
          : 'bg-gradient-to-br from-[#faf6ee] via-white to-[#f5ecd7] border-warm-gold/20'
      }`}
    >
      {/* Decorative glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-warm-gold/5 via-transparent to-transparent pointer-events-none" />

      <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-warm-gold/15 text-warm-gold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Living Memorial</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Share Your Loving Tribute
          </h2>
          
          <p className={`text-sm font-light leading-relaxed max-w-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Take a moment to write a tribute or leave a message of love.
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1.5 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-warm-gold/60" />
              <span>{tributesCount} Memories Shared</span>
            </span>
            <span className="opacity-30">•</span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-rose-500/60" />
              <span>Always in Our Hearts</span>
            </span>
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddTributeClick}
            className="w-full md:w-auto bg-gradient-to-r from-warm-gold via-yellow-600 to-warm-gold text-white font-semibold text-sm px-8 py-4 rounded-full shadow-lg hover:shadow-warm-gold/20 flex items-center justify-center gap-2 cursor-pointer border border-warm-gold/25"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Write a Tribute</span>
          </motion.button>
          
          <span className={`text-[11px] mt-3 font-light italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Tributes are posted instantly to the Memorial Wall below
          </span>
        </div>
      </div>
    </motion.div>
  );
}
