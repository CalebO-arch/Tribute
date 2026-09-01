import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Clock, User, Quote, Edit3 } from 'lucide-react';
import { Tribute } from '../types';
import { renderVideoMedia } from '../utils/mediaUtils';

interface TributeCardProps {
  tribute: Tribute;
  onLike: (id: string) => void;
  isDark: boolean;
  isAdmin?: boolean;
  onEdit?: (tribute: Tribute) => void;
  key?: string | number;
}

export default function TributeCard({ tribute, onLike, isDark, isAdmin, onEdit }: TributeCardProps) {
  const [liked, setLiked] = useState(false);

  // Map card theme to Tailwind classes
  const themeStyles = {
    amber: {
      light: 'bg-[#fdf9f0] border-amber-200/60 shadow-amber-50/50 hover:shadow-amber-100/50',
      dark: 'masonry-card border-amber-900/20 shadow-black/40 hover:border-amber-500/30',
      text: 'text-amber-800 dark:text-amber-300',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      accent: 'text-amber-500',
    },
    rose: {
      light: 'bg-[#fdf5f5] border-rose-200/60 shadow-rose-50/50 hover:shadow-rose-100/50',
      dark: 'masonry-card border-rose-900/20 shadow-black/40 hover:border-rose-500/30',
      text: 'text-rose-800 dark:text-rose-300',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
      accent: 'text-rose-500',
    },
    lavender: {
      light: 'bg-[#f8f6fd] border-indigo-200/60 shadow-indigo-50/50 hover:shadow-indigo-100/50',
      dark: 'masonry-card border-indigo-900/20 shadow-black/40 hover:border-indigo-500/30',
      text: 'text-indigo-800 dark:text-indigo-300',
      badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
      accent: 'text-indigo-500',
    },
    slate: {
      light: 'bg-[#f5f6f8] border-slate-200/60 shadow-slate-50/50 hover:shadow-slate-100/50',
      dark: 'masonry-card border-slate-800/30 shadow-black/40 hover:border-warm-gold/20',
      text: 'text-slate-700 dark:text-slate-300',
      badge: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
      accent: 'text-slate-500',
    },
    gold: {
      light: 'bg-[#faf6ee] border-yellow-200/60 shadow-yellow-50/50 hover:shadow-yellow-100/50',
      dark: 'masonry-card border-yellow-950/20 shadow-black/40 hover:border-warm-gold/40',
      text: 'text-yellow-900 dark:text-yellow-200',
      badge: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-300',
      accent: 'text-yellow-600 dark:text-yellow-500',
    }
  };

  const selectedTheme = themeStyles[tribute.theme || 'slate'];
  const currentStyle = isDark ? selectedTheme.dark : selectedTheme.light;

  // Format date
  const getFormattedDate = () => {
    if (!tribute.createdAt) return 'Recently';
    try {
      const date = tribute.createdAt.toDate ? tribute.createdAt.toDate() : new Date(tribute.createdAt);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  const handleLikeClick = () => {
    setLiked(true);
    onLike(tribute.id);
    setTimeout(() => setLiked(false), 800);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className={`break-inside-avoid mb-6 w-full rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-300 flex flex-col ${currentStyle}`}
    >
      {/* Shared Video if exists */}
      {tribute.video && (
        <div className="relative w-full overflow-hidden rounded-xl mb-4 bg-black/10">
          {renderVideoMedia(tribute.video)}
        </div>
      )}

      {/* Shared Image if exists */}
      {tribute.image && (
        <div className="relative w-full overflow-hidden rounded-xl mb-4 bg-black/5 aspect-[4/3]">
          <img
            src={tribute.image}
            alt="Shared Memory"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Quote symbol for card visual interest */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
            <User className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <div>
            <h4 className={`font-serif font-medium text-base ${isDark ? 'text-warm-cream' : 'text-warm-slate'}`}>
              {tribute.name}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{getFormattedDate()}</span>
            </div>
          </div>
        </div>

        {/* Relationship Badge & Admin Edit Button */}
        <div className="flex items-center gap-2">
          {tribute.relationship && (
            <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full ${selectedTheme.badge}`}>
              {tribute.relationship}
            </span>
          )}

          {isAdmin && onEdit && (
            <button
              onClick={() => onEdit(tribute)}
              className="p-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
              title="Edit Tribute (Creator Mode)"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tribute Content text */}
      <div className="relative flex-1 py-1">
        <Quote className={`absolute top-0 -left-1 w-8 h-8 opacity-[0.06] ${selectedTheme.accent}`} />
        <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap relative z-10 font-light ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {tribute.text || tribute.message || ''}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-black/5 dark:border-white/5 my-4" />

      {/* Action Footer */}
      <div className="flex items-center justify-between text-xs mt-auto">
        <span className={`font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Keep in memory
        </span>

        {/* Remembrance (Like) button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLikeClick}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full cursor-pointer transition-colors duration-200 ${
            isDark 
              ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-rose-400' 
              : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-rose-500'
          }`}
        >
          <Heart 
            className={`w-4 h-4 transition-transform duration-300 ${
              liked ? 'scale-150 fill-rose-500 text-rose-500 animate-ping' : ''
            } hover:scale-110`}
          />
          <span className="font-semibold">{tribute.likes || 0}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
