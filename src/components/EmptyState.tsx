import React from 'react';
import { Heart, Search, MessageSquarePlus } from 'lucide-react';

interface EmptyStateProps {
  isFiltering: boolean;
  onAddClick: () => void;
  isDark: boolean;
}

export default function EmptyState({ isFiltering, onAddClick, isDark }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-6 rounded-2xl border border-dashed flex flex-col items-center max-w-md mx-auto ${
      isDark 
        ? 'border-white/10 bg-white/[0.02]' 
        : 'border-warm-gold/25 bg-warm-cream/20'
    }`}>
      {isFiltering ? (
        <>
          <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className={`font-serif text-lg font-medium ${isDark ? 'text-warm-cream' : 'text-warm-slate'}`}>
            No Memories Found
          </h4>
          <p className={`text-xs text-gray-500 mt-2 max-w-xs leading-relaxed`}>
            We couldn't find any tributes matching your search filter. Try selecting another relationship group or adjusting your keywords.
          </p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-warm-gold/10 flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-warm-gold animate-pulse" />
          </div>
          <h4 className={`font-serif text-lg font-medium ${isDark ? 'text-warm-cream' : 'text-warm-slate'}`}>
            The Memory Wall is Silent
          </h4>
          <p className={`text-xs text-gray-500 mt-2 max-w-xs leading-relaxed`}>
            There are no shared tributes here yet. Take a moment to share a precious memory, a warm thought, or a photo to celebrate their beautiful life.
          </p>
          <button
            onClick={onAddClick}
            className="mt-5 text-xs font-semibold px-4 py-2 bg-warm-gold text-white rounded-full shadow-md hover:bg-yellow-600 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Share First Tribute</span>
          </button>
        </>
      )}
    </div>
  );
}
