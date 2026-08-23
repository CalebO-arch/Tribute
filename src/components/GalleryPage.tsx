import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Plus, ArrowLeft, Maximize2, X, ChevronLeft, ChevronRight, Video, Film, Sparkles } from 'lucide-react';
import { DeceasedPersonInfo, Tribute, NavPage } from '../types';
import { renderVideoMedia } from '../utils/mediaUtils';

interface GalleryPageProps {
  info: DeceasedPersonInfo;
  tributes: Tribute[];
  isDark: boolean;
  onNavigate: (page: NavPage) => void;
  onAddTributeClick: () => void;
}

export default function GalleryPage({
  info,
  tributes,
  isDark,
  onNavigate,
  onAddTributeClick
}: GalleryPageProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'memorial' | 'community' | 'videos'>('all');

  // Gather photos from memorialInfo.gallery and from tributes
  const memorialPhotos = info.gallery || [];
  const tributePhotos = tributes
    .filter((t) => t.image && t.image.trim().length > 0)
    .map((t) => ({ url: t.image!, author: t.name, caption: `Shared by ${t.name}` }));

  // Gather videos from tributes
  const videoTributes = tributes.filter((t) => t.video && t.video.trim().length > 0);

  // Combine list
  const allPhotosList = [
    ...memorialPhotos.map((url, idx) => ({ url, author: info.name, caption: `Photograph ${idx + 1}` })),
    ...tributePhotos
  ];

  const displayedPhotos = filter === 'memorial' 
    ? memorialPhotos.map((url, idx) => ({ url, author: info.name, caption: `Photograph ${idx + 1}` }))
    : filter === 'community'
      ? tributePhotos
      : allPhotosList;

  const currentPhoto = selectedPhotoIndex !== null ? displayedPhotos[selectedPhotoIndex] : null;

  const handleNext = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % displayedPhotos.length);
  };

  const handlePrev = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + displayedPhotos.length) % displayedPhotos.length);
  };

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
            ? 'bg-gradient-to-r from-emerald-950/20 via-memorial to-amber-950/20 border-warm-gold/20' 
            : 'bg-gradient-to-r from-emerald-500/10 via-[#faf7f2] to-amber-500/10 border-warm-gold/25'
        }`}
      >
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
            {filter === 'videos' ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
            <span>{filter === 'videos' ? 'Video Gallery' : 'Photo Gallery'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight">
            {filter === 'videos' ? 'Video Tributes & Memories' : 'The Photographs People Are Gathering'}
          </h1>

          <p className={`text-xs sm:text-sm font-light max-w-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {filter === 'videos'
              ? `Watching shared video tributes, speeches, and video recordings in loving memory of ${info.name}.`
              : `Capturing moments of laughter, family gatherings, quiet smiles, and precious memories in honour of ${info.name}.`}
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onAddTributeClick}
          className="px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-warm-gold to-yellow-600 text-white hover:brightness-110 shadow-lg cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{filter === 'videos' ? 'Share a Video Tribute' : 'Contribute Photo or Video'}</span>
        </button>
      </motion.div>

      {/* Gallery Filter Tabs */}
      <div className="flex items-center justify-between gap-4 mb-8 border-b pb-4 border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              filter === 'all'
                ? 'bg-warm-gold text-white shadow-xs'
                : isDark ? 'bg-white/5 text-gray-400' : 'bg-white text-gray-600 border'
            }`}
          >
            All Photos ({allPhotosList.length})
          </button>
          <button
            onClick={() => setFilter('memorial')}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              filter === 'memorial'
                ? 'bg-warm-gold text-white shadow-xs'
                : isDark ? 'bg-white/5 text-gray-400' : 'bg-white text-gray-600 border'
            }`}
          >
            Memorial Photographs ({memorialPhotos.length})
          </button>
          <button
            onClick={() => setFilter('community')}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              filter === 'community'
                ? 'bg-warm-gold text-white shadow-xs'
                : isDark ? 'bg-white/5 text-gray-400' : 'bg-white text-gray-600 border'
            }`}
          >
            Shared Photos ({tributePhotos.length})
          </button>
          <button
            onClick={() => setFilter('videos')}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              filter === 'videos'
                ? 'bg-warm-gold text-white shadow-xs'
                : isDark ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-white text-gray-600 border hover:border-warm-gold/50'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videos ({videoTributes.length})</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {filter === 'videos' ? (
        /* Video Grid */
        videoTributes.length === 0 ? (
          <div className={`text-center py-16 px-4 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-warm-gold/20'}`}>
            <Video className="w-12 h-12 text-warm-gold/40 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold">No video tributes shared yet</h3>
            <p className="text-xs text-gray-400 mt-1 mb-6">Be the first to share a video memory or recorded speech in honour of {info.name}.</p>
            <button
              onClick={onAddTributeClick}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-warm-gold text-white hover:brightness-110 transition-all cursor-pointer"
            >
              Share a Video Tribute
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoTributes.map((tribute) => (
              <motion.div
                key={tribute.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between ${
                  isDark ? 'bg-memorial border-white/10 text-warm-cream' : 'bg-white border-warm-gold/20 text-warm-slate shadow-xs'
                }`}
              >
                <div>
                  <div className="rounded-xl overflow-hidden mb-4 bg-black/20">
                    {renderVideoMedia(tribute.video)}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-serif font-semibold text-base">{tribute.name}</h4>
                    {tribute.relationship && (
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-warm-gold/15 text-warm-gold">
                        {tribute.relationship}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    "{tribute.text}"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Shared Memory</span>
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-warm-gold" /> Video Tribute
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* Photo Grid */
        displayedPhotos.length === 0 ? (
          <div className={`text-center py-16 px-4 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-warm-gold/20'}`}>
            <ImageIcon className="w-12 h-12 text-warm-gold/40 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold">No photographs in this view yet</h3>
            <p className="text-xs text-gray-400 mt-1 mb-6">Be the first to share a photograph with the family.</p>
            <button
              onClick={onAddTributeClick}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-warm-gold text-white"
            >
              Add a Photo & Story
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedPhotos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => setSelectedPhotoIndex(index)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer border aspect-4/3 sm:aspect-square ${
                  isDark ? 'border-white/10 bg-black/40' : 'border-warm-gold/20 bg-warm-cream/30'
                }`}
              >
                <img 
                  src={photo.url} 
                  alt={photo.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-medium line-clamp-1">{photo.caption}</span>
                    <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-md shrink-0">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Photo Container */}
            <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
              <div className="mt-4 text-center text-white">
                <p className="text-sm font-serif font-medium">{currentPhoto.caption}</p>
                <p className="text-xs text-gray-400 mt-1">Photo {selectedPhotoIndex + 1} of {displayedPhotos.length}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
