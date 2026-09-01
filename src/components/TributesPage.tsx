import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Search, Plus, ArrowLeft, MessageSquareQuote, Sparkles, Filter, Users, Flame, Trash } from 'lucide-react';
import { Tribute, NavPage, DeceasedPersonInfo } from '../types';
import TributeCard from './TributeCard';
import EmptyState from './EmptyState';

interface TributesPageProps {
  tributes: Tribute[];
  info: DeceasedPersonInfo;
  isDark: boolean;
  isAdmin?: boolean;
  onNavigate: (page: NavPage) => void;
  onAddTributeClick: () => void;
  onLikeTribute: (id: string) => void;
  onEditTribute?: (tribute: Tribute) => void;
  onDeleteTribute?: (id: string) => Promise<void> | void;
  onResetAllTributes?: () => Promise<void>;
}

export default function TributesPage({
  tributes,
  info,
  isDark,
  isAdmin,
  onNavigate,
  onAddTributeClick,
  onLikeTribute,
  onEditTribute,
  onDeleteTribute,
  onResetAllTributes
}: TributesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'likes'>('newest');

  const relationshipsList = ['All', 'Son', 'Daughter', 'Wife', 'Family', 'Grandchild', 'Friend', 'Son in-law', 'Daughter in-law', 'Other'];

  // Filter & Sort tributes
  const filteredTributes = tributes
    .filter((trib) => {
      const textContent = (trib.text || trib.message || '').toLowerCase();
      const nameContent = (trib.name || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = nameContent.includes(query) || textContent.includes(query);
      
      const matchesRelationship = 
        selectedRelationship === 'All' || 
        trib.relationship === selectedRelationship;
      
      return matchesSearch && matchesRelationship;
    })
    .sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likes || 0) - (a.likes || 0);
      }
      return 0; // Default Firestore order (newest)
    });

  const totalTributes = tributes.length;
  const totalLikes = tributes.reduce((sum, t) => sum + (t.likes || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Back Button */}
      <button
        onClick={() => onNavigate('home')}
        className={`mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
          isDark 
            ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10' 
            : 'bg-white hover:bg-warm-cream text-warm-slate border-warm-gold/20 shadow-xs'
        }`}
      >
        <ArrowLeft className="w-3.5 h-3.5 text-warm-gold" />
        <span>Back to Memorial Home</span>
      </button>

      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-6 sm:p-10 border mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-r from-rose-950/20 via-memorial to-amber-950/20 border-warm-gold/20' 
            : 'bg-gradient-to-r from-rose-500/10 via-[#faf7f2] to-amber-500/10 border-warm-gold/25'
        }`}
      >
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-rose-500 bg-rose-500/10 border border-rose-500/20">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Tributes & Memories</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight">
            What People Remember From Knowing Him
          </h1>

          <p className={`text-xs sm:text-sm font-light max-w-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Every story, heartfelt reflection, and memory shared by family, friends, and colleagues in honour of {info.name}.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isAdmin && onResetAllTributes && (
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to reset all tributes? This will delete all collected tributes permanently so you can start fresh.")) {
                  await onResetAllTributes();
                  alert("All tributes have been successfully reset!");
                }
              }}
              className="px-4 py-3 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 cursor-pointer transition-all"
              title="Reset all tributes"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Reset Tributes</span>
            </button>
          )}

          <button
            onClick={onAddTributeClick}
            className="px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-warm-gold to-yellow-600 text-white hover:brightness-110 shadow-lg cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Tribute</span>
          </button>
        </div>
      </motion.div>

      {/* Statistics Quick Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-warm-gold/15 shadow-xs'}`}>
          <div className="font-serif text-2xl font-semibold text-warm-gold">{totalTributes}</div>
          <div className="text-[11px] font-medium opacity-70 uppercase tracking-wider mt-0.5">Memories Shared</div>
        </div>

        <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-warm-gold/15 shadow-xs'}`}>
          <div className="font-serif text-2xl font-semibold text-rose-500">{totalLikes}</div>
          <div className="text-[11px] font-medium opacity-70 uppercase tracking-wider mt-0.5">Hearts & Condolences</div>
        </div>

        <div className={`col-span-2 sm:col-span-1 p-4 rounded-2xl border text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-warm-gold/15 shadow-xs'}`}>
          <div className="font-serif text-2xl font-semibold text-amber-500">{relationshipsList.length - 1}</div>
          <div className="text-[11px] font-medium opacity-70 uppercase tracking-wider mt-0.5">Friend & Family Circles</div>
        </div>
      </div>

      {/* Search, Filters, and Sorting Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-full border text-xs outline-none transition-all ${
              isDark 
                ? 'bg-white/5 border-white/15 focus:border-warm-gold text-white' 
                : 'bg-white border-warm-gold/20 focus:border-warm-gold text-warm-slate shadow-xs'
            }`}
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 font-medium">Sort by:</span>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
              sortBy === 'newest'
                ? 'bg-warm-gold text-white shadow-xs'
                : isDark ? 'bg-white/5 text-gray-400' : 'bg-white text-gray-600 border'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy('likes')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
              sortBy === 'likes'
                ? 'bg-warm-gold text-white shadow-xs'
                : isDark ? 'bg-white/5 text-gray-400' : 'bg-white text-gray-600 border'
            }`}
          >
            Most Loved
          </button>
        </div>

      </div>

      {/* Relationship Categories Pill filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {relationshipsList.map((rel) => (
          <button
            key={rel}
            onClick={() => setSelectedRelationship(rel)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer shrink-0 transition-all ${
              selectedRelationship === rel
                ? isDark
                  ? 'bg-warm-gold text-white shadow-md'
                  : 'bg-warm-slate text-[#faf7f2] shadow-sm'
                : isDark
                  ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  : 'bg-white text-gray-600 border border-warm-gold/10 hover:bg-warm-cream/50'
            }`}
          >
            {rel === 'All' ? 'All Memories' : rel}
          </button>
        ))}
      </div>

      {/* Tributes Grid */}
      {filteredTributes.length === 0 ? (
        <EmptyState 
          isFiltering={searchQuery.trim().length > 0 || selectedRelationship !== 'All'} 
          onAddClick={onAddTributeClick}
          isDark={isDark}
        />
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          <AnimatePresence mode="popLayout">
            {filteredTributes.map((tribute) => (
              <TributeCard 
                key={tribute.id} 
                tribute={tribute} 
                onLike={onLikeTribute} 
                isDark={isDark} 
                isAdmin={isAdmin}
                onEdit={onEditTribute}
                onDelete={onDeleteTribute}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
