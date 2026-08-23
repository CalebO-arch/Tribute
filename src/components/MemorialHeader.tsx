import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Quote, Heart, Award, Sparkles, Flame, ChevronLeft, ChevronRight, Image as ImageIcon, X, Edit3 } from 'lucide-react';
import { DeceasedPersonInfo } from '../types';
import ColoredName from './ColoredName';

interface MemorialHeaderProps {
  info: DeceasedPersonInfo;
  stats: {
    tributesCount: number;
    candlesCount: number;
    heartsCount: number;
  };
  isAdmin: boolean;
  onEditClick: () => void;
  isDark: boolean;
}

export default function MemorialHeader({ info, stats, isAdmin, onEditClick, isDark }: MemorialHeaderProps) {
  const [itemsPerPage, setItemsPerPage] = useState<number>(3);
  const [page, setPage] = useState<number>(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  React.useEffect(() => {
    const handleResize = () => {
      const newItemsPerPage = window.innerWidth < 640 ? 2 : 3;
      setItemsPerPage((prev) => {
        if (prev !== newItemsPerPage) {
          setPage(0);
          return newItemsPerPage;
        }
        return prev;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format dates for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  const birthDateFormatted = formatDate(info.birthDate);
  const deathDateFormatted = formatDate(info.deathDate);

  // Calculate age from birth and death dates
  const getAgeText = () => {
    if (!info.birthDate || !info.deathDate) return "(83 Years)";
    try {
      const birth = new Date(info.birthDate);
      const death = new Date(info.deathDate);
      if (isNaN(birth.getTime()) || isNaN(death.getTime())) return "(83 Years)";
      let age = death.getFullYear() - birth.getFullYear();
      const m = death.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && death.getDate() < birth.getDate())) {
        age--;
      }
      return age > 0 ? `(${age} Years)` : "(83 Years)";
    } catch {
      return "(83 Years)";
    }
  };

  const gallery = info.gallery || [];
  const totalPages = Math.max(1, Math.ceil(gallery.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages - 1);

  const handleNext = () => {
    if (gallery.length === 0) return;
    setPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    if (gallery.length === 0) return;
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleImages = gallery.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const [bannerSrc, setBannerSrc] = useState<string>(info.bannerImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80');

  React.useEffect(() => {
    if (info.bannerImage) {
      setBannerSrc(info.bannerImage);
    }
  }, [info.bannerImage]);

  return (
    <div className="relative w-full">
      {/* Banner Background */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-neutral-900">
        <img
          src={bannerSrc}
          alt="Serene Memorial Banner"
          referrerPolicy="no-referrer"
          onError={() => {
            const fallback = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80';
            if (bannerSrc !== fallback) {
              setBannerSrc(fallback);
            }
          }}
          className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
        
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEditClick}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-warm-slate hover:bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium border border-warm-gold/20 cursor-pointer z-10"
          >
            <Sparkles className="w-4 h-4 text-warm-gold animate-pulse" />
            <span>Customize Memorial</span>
          </motion.button>
        )}
      </div>

      {/* Main Profile Info Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-28 relative z-10 pb-6">
        <div className="flex flex-col items-center text-center">
          {/* Profile Photo frame */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Elegant double gold rings */}
            {!isDark ? (
              <>
                <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-warm-gold/40 via-yellow-500/20 to-warm-gold/40 animate-[spin_20s_linear_infinite]" />
                <div className="absolute -inset-1 rounded-full bg-gradient-to-bl from-warm-gold/60 to-yellow-600/30 blur-xs" />
              </>
            ) : (
              <div className="absolute -inset-1.5 portrait-frame rounded-t-[120px] bg-gradient-to-tr from-warm-gold/10 to-yellow-600/5 opacity-50" />
            )}
            
            <div className={`relative overflow-hidden shadow-2xl bg-warm-cream transition-all duration-500 ${
              isDark 
                ? 'w-32 h-40 sm:w-36 sm:h-44 portrait-frame' 
                : 'w-40 h-40 sm:w-44 sm:h-44 rounded-full border-4 border-white'
            }`}>
              <img
                src={info.profileImage}
                alt={info.name || "Deceased Person"}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Name & Dates */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-6 w-full"
          >
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
              <ColoredName
                name={info.name || "A Beloved Soul"}
                nameColor={info.nameColor}
                letterColors={info.letterColors}
                fallbackColorClass={isDark ? 'text-warm-cream' : 'text-warm-slate'}
              />
            </h1>
            
            <div className={`mt-3 flex flex-wrap justify-center items-center gap-2 text-sm sm:text-base font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Calendar className="w-4 h-4 text-warm-gold" />
              <span>{birthDateFormatted || "..."}</span>
              <span className="mx-1 text-warm-gold/60">—</span>
              <span>{deathDateFormatted || "..."}</span>
            </div>

            <div className={`mt-1.5 text-sm sm:text-base font-medium tracking-wide ${isDark ? 'text-warm-gold/90' : 'text-warm-gold'}`}>
              {getAgeText()}
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={onEditClick}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/30 transition-all cursor-pointer"
                title="Edit Name, Dates & Memorial Settings"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Memorial Details</span>
              </button>
            )}
          </motion.div>

          {/* Dividing floral element (elegant svg) */}
          <div className="my-5 opacity-40">
            <svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-warm-gold">
              <path d="M60 4C58 4 55 9 53 11C51 9 48 4 46 4C42 4 41 8 45 10C49 12 55 12 57 12C55 12 51 14 47 14C44 14 44 16 47 16C50 16 53 14 55 13C53 15 52 18 52 20C52 22 54 22 54 20C54 18 55 15 57 13C56 15 56 18 58 18C60 18 60 15 61 13C63 15 64 18 64 20C64 22 66 22 66 20C66 18 65 15 63 13C65 14 68 16 71 16C74 16 74 14 71 14C67 14 63 12 61 12C63 12 69 12 73 10C77 8 76 4 72 4C70 4 67 9 65 11C63 9 60 4 60 4Z" fill="currentColor"/>
              <line x1="0" y1="12" x2="40" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
              <line x1="80" y1="12" x2="120" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
            </svg>
          </div>

          {/* Moving Tribute Quote */}
          {info.quote && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className={`max-w-3xl px-6 py-4 rounded-2xl relative mb-6 ${isDark ? 'masonry-card' : 'bg-warm-cream/80 border border-warm-gold/15'}`}
            >
              <Quote className="absolute -top-3 left-4 w-6 h-6 text-warm-gold/40" />
              <div className="flex items-center justify-between gap-3">
                <p className={`font-serif italic text-base sm:text-lg leading-relaxed flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{info.quote}"
                </p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={onEditClick}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/30 transition-all cursor-pointer shrink-0"
                    title="Edit Quote"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Transition to Glory Text */}
          {(info.transitionToGlory || info.bio) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className={`w-full max-w-7xl mb-8 rounded-2xl border p-5 sm:p-6 text-left relative shadow-sm ${
                isDark 
                  ? 'bg-white/3 border-white/10 text-gray-300' 
                  : 'bg-warm-cream/90 border-warm-gold/20 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-warm-gold/15">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-warm-gold" />
                  <h3 className="font-serif text-xs sm:text-sm font-semibold tracking-wider uppercase text-warm-gold">
                    Transition to Glory: Celebrating a Life Well-Lived
                  </h3>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={onEditClick}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/30 transition-all cursor-pointer shrink-0"
                    title="Edit Transition to Glory in Customizer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Text</span>
                  </button>
                )}
              </div>

              <div className={`max-h-52 sm:max-h-64 overflow-y-auto pr-2 text-sm sm:text-base leading-relaxed font-light space-y-3 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {(info.transitionToGlory || info.bio).split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Photo Gallery Carousel Section */}
          {gallery.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full mt-6 max-w-7xl"
            >
              <div className="flex items-center gap-2 mb-4 justify-center">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-warm-gold/20 to-warm-gold/40" />
                <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-warm-gold/5 border border-warm-gold/15">
                  <ImageIcon className="w-4 h-4 text-warm-gold" />
                  <h3 className="font-serif text-xs sm:text-sm font-semibold tracking-wider uppercase text-warm-gold">
                    Remembrance Gallery
                  </h3>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-warm-gold/20 to-warm-gold/40" />
              </div>

              <div className="relative group px-1 sm:px-12">
                {/* Navigation Arrows */}
                {totalPages > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className={`absolute left-0 sm:left-1 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full shadow-lg border backdrop-blur-md transition-all cursor-pointer ${
                        isDark 
                          ? 'bg-black/70 border-white/10 text-white hover:bg-black hover:border-warm-gold/50' 
                          : 'bg-white/90 border-warm-gold/30 text-warm-slate hover:bg-white hover:border-warm-gold'
                      }`}
                      aria-label="Previous photos"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleNext}
                      className={`absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full shadow-lg border backdrop-blur-md transition-all cursor-pointer ${
                        isDark 
                          ? 'bg-black/70 border-white/10 text-white hover:bg-black hover:border-warm-gold/50' 
                          : 'bg-white/90 border-warm-gold/30 text-warm-slate hover:bg-white hover:border-warm-gold'
                      }`}
                      aria-label="Next photos"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Grid displaying 2 images on mobile (<640px) or 3 images on tablet/desktop */}
                <div className="overflow-hidden py-2 px-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.3 }}
                      className={`grid gap-3 sm:gap-4 ${
                        itemsPerPage === 2 ? 'grid-cols-2' : 'grid-cols-3'
                      }`}
                    >
                      {visibleImages.map((img, idx) => {
                        const globalIdx = currentPage * itemsPerPage + idx;
                        return (
                          <motion.div
                            key={globalIdx}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setLightboxImage(img)}
                            className={`relative aspect-[2/3] rounded-xl overflow-hidden border cursor-zoom-in group shadow-md transition-all flex items-center justify-center ${
                              isDark 
                                ? 'border-white/10 bg-neutral-900/90 hover:border-warm-gold/40' 
                                : 'border-warm-gold/20 bg-stone-900/90 hover:border-warm-gold'
                            }`}
                          >
                            {/* Ambient blurred backdrop for seamless fit */}
                            <img
                              src={img}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 w-full h-full object-cover blur-lg opacity-35 scale-110 pointer-events-none"
                            />
                            {/* Main image fit completely without zooming or cropping landscape photos */}
                            <img
                              src={img}
                              alt={`Remembrance ${globalIdx + 1}`}
                              className="relative z-10 max-w-full max-h-full object-contain transition-transform duration-300"
                            />
                            <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                              <span className="text-white text-xs font-medium bg-black/70 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
                                View Photo
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Pagination dots & counter */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 px-2 text-xs text-gray-400">
                    <span className="font-mono text-[11px] text-gray-400">
                      {currentPage * itemsPerPage + 1}–{Math.min((currentPage + 1) * itemsPerPage, gallery.length)} of {gallery.length} photos
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPage(idx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            currentPage === idx 
                              ? 'w-6 bg-warm-gold' 
                              : 'w-2 bg-gray-500/30 hover:bg-gray-500/60'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full mt-8 p-8 text-center rounded-2xl border border-dashed border-warm-gold/20 bg-black/5 dark:bg-white/2"
              >
                <ImageIcon className="w-8 h-8 text-warm-gold/60 mx-auto mb-2" />
                <h4 className="font-serif text-sm font-semibold mb-1">Upload Gallery Photos</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Click the 'Customize Memorial' button on the banner to upload photos to the dynamic photo gallery.
                </p>
              </motion.div>
            )
          )}

          {/* Lightbox Modal */}
          <AnimatePresence>
            {lightboxImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLightboxImage(null)}
                className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              >
                <button
                  onClick={() => setLightboxImage(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="max-w-4xl max-h-[85vh] overflow-hidden rounded-xl shadow-2xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={lightboxImage}
                    alt="Gallery Enlarged"
                    className="max-w-full max-h-[85vh] object-contain rounded-xl"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
