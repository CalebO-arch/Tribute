import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Menu, 
  X, 
  BookOpen, 
  Heart, 
  Image as ImageIcon, 
  Sparkles, 
  Home, 
  Share2, 
  Check, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  ChevronRight
} from 'lucide-react';
import { NavPage } from '../types';

interface TopNavbarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  isDevWorkspace: boolean;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  handleCopyLink: () => void;
  copiedLink: boolean;
}

export default function TopNavbar({
  activePage,
  onNavigate,
  isDark,
  setIsDark,
  isDevWorkspace,
  isAdminMode,
  setIsAdminMode,
  handleCopyLink,
  copiedLink
}: TopNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems: { id: NavPage; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      desc: 'Main memorial overview & tributes',
      icon: <Home className="w-4 h-4 text-warm-gold" />
    },
    {
      id: 'story',
      label: 'His Story',
      desc: 'The story of his life',
      icon: <BookOpen className="w-4 h-4 text-amber-500" />
    },
    {
      id: 'tributes',
      label: 'Tributes & Memories',
      desc: 'What people remember from knowing him',
      icon: <Heart className="w-4 h-4 text-rose-500" />
    },
    {
      id: 'gallery',
      label: 'Gallery',
      desc: 'The photographs people are gathering',
      icon: <ImageIcon className="w-4 h-4 text-emerald-500" />
    },
    {
      id: 'prayer',
      label: 'Prayer Wall',
      desc: 'The faith that held him',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />
    }
  ];

  const handleSelect = (page: NavPage) => {
    onNavigate(page);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={`w-full border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 ${
      isDark ? 'bg-memorial/95 border-white/10' : 'bg-[#faf7f2]/95 border-warm-gold/15'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Logo / Home Link */}
        <button 
          onClick={() => handleSelect('home')}
          className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
        >
          <div className="p-1.5 rounded-full bg-warm-gold/10 group-hover:bg-warm-gold/20 transition-all">
            <Flame className="w-5 h-5 text-warm-gold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-semibold tracking-wide text-base block leading-tight">
                Eternal Tribute
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">v2.1-live</span>
            </div>
            <span className={`text-[10px] tracking-wider uppercase block font-sans opacity-70 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Living Memory
            </span>
          </div>
        </button>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3" ref={menuRef}>
          
          {/* Creator Setup Toggle (In Dev Workspace) */}
          {isDevWorkspace && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  isAdminMode 
                    ? 'bg-amber-500 text-white shadow-sm' 
                    : isDark 
                      ? 'bg-white/5 hover:bg-white/10 text-gray-300' 
                      : 'bg-black/5 hover:bg-black/10 text-gray-700'
                }`}
                title={isAdminMode ? "Disable Creator Mode" : "Enable Creator Setup Mode"}
              >
                {isAdminMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{isAdminMode ? 'Creator Active' : 'Setup'}</span>
              </button>
            </div>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-full cursor-pointer transition-all ${
              isDark 
                ? 'hover:bg-white/10 text-gray-300 hover:text-white' 
                : 'hover:bg-black/5 text-gray-600 hover:text-warm-slate'
            }`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4.5 h-4.5 text-amber-300" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Share Link Button */}
          <button
            onClick={handleCopyLink}
            className={`hidden sm:flex px-3.5 py-1.5 rounded-full text-xs font-semibold items-center gap-1.5 transition-all cursor-pointer ${
              copiedLink 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : isDark 
                  ? 'bg-white/10 hover:bg-white/15 text-warm-cream' 
                  : 'bg-warm-gold hover:bg-yellow-600 text-white shadow-sm'
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Top Right Menu Icon Button */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 sm:px-3.5 sm:py-2 rounded-full font-medium text-xs flex items-center gap-2 cursor-pointer transition-all border ${
                isMenuOpen
                  ? 'bg-warm-gold text-white border-warm-gold shadow-md'
                  : isDark
                    ? 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                    : 'bg-white hover:bg-warm-cream text-warm-slate border-warm-gold/25 shadow-xs'
              }`}
              aria-label="Navigation Menu"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4 text-warm-gold" />
              )}
              <span className="hidden sm:inline font-serif font-medium tracking-wide">
                Menu
              </span>
            </button>

            {/* Dropdown Menu Overlay */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-2xl border p-2 z-50 overflow-hidden ${
                    isDark 
                      ? 'bg-[#1a1815] border-white/15 text-gray-200 shadow-black/80' 
                      : 'bg-white border-warm-gold/20 text-warm-slate shadow-amber-900/10'
                  }`}
                >
                  <div className={`px-3 py-2 border-b mb-1 flex items-center justify-between ${
                    isDark ? 'border-white/10' : 'border-black/5'
                  }`}>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-warm-gold font-serif">
                      Memorial Navigation
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Select a section
                    </span>
                  </div>

                  <div className="space-y-1">
                    {menuItems.map((item) => {
                      const isActive = activePage === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer group ${
                            isActive
                              ? isDark
                                ? 'bg-warm-gold/20 text-warm-gold border border-warm-gold/30'
                                : 'bg-warm-cream text-warm-slate border border-warm-gold/25'
                              : isDark
                                ? 'hover:bg-white/5 text-gray-300 hover:text-white'
                                : 'hover:bg-warm-cream/50 text-gray-700 hover:text-black'
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 mt-0.5 transition-transform group-hover:scale-110 ${
                            isActive 
                              ? 'bg-warm-gold text-white shadow-xs' 
                              : isDark 
                                ? 'bg-white/5' 
                                : 'bg-warm-cream/80'
                          }`}>
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-serif font-semibold block leading-tight ${
                                isActive ? 'text-warm-gold' : ''
                              }`}>
                                {item.label}
                              </span>
                              {isActive && (
                                <ChevronRight className="w-3.5 h-3.5 text-warm-gold" />
                              )}
                            </div>
                            <span className={`text-[11px] block mt-0.5 font-sans line-clamp-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              ({item.desc})
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Share button in dropdown for mobile */}
                  <div className={`mt-2 pt-2 border-t sm:hidden ${isDark ? 'border-white/10' : 'border-black/5'}`}>
                    <button
                      onClick={handleCopyLink}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-warm-gold text-white"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Share Memorial Link'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </nav>
  );
}
