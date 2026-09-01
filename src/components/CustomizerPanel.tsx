import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Upload, AlertCircle, Sparkles, Image as ImageIcon, RotateCcw, Trash, Plus, Palette, Type } from 'lucide-react';
import { DeceasedPersonInfo } from '../types';
import ColoredName from './ColoredName';

interface CustomizerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  info: DeceasedPersonInfo;
  onSave: (updatedInfo: DeceasedPersonInfo) => Promise<void>;
  onResetAllCandles?: () => Promise<void>;
  isDark: boolean;
  defaultBanner: string;
  defaultPortrait: string;
}

export default function CustomizerPanel({ 
  isOpen, 
  onClose, 
  info, 
  onSave, 
  onResetAllCandles,
  isDark, 
  defaultBanner, 
  defaultPortrait 
}: CustomizerPanelProps) {
  const [name, setName] = useState(info.name);
  const [nameColor, setNameColor] = useState(info.nameColor || '');
  const [letterColors, setLetterColors] = useState<Record<number, string>>(info.letterColors || {});
  const [selectedCharIndex, setSelectedCharIndex] = useState<number | null>(null);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [colorToolTab, setColorToolTab] = useState<'base' | 'words' | 'letters'>('base');
  const [birthDate, setBirthDate] = useState(info.birthDate);
  const [deathDate, setDeathDate] = useState(info.deathDate);
  const [transitionToGlory, setTransitionToGlory] = useState(info.transitionToGlory || '');
  const [bio, setBio] = useState(info.bio);
  const [quote, setQuote] = useState(info.quote);
  const [profileImage, setProfileImage] = useState(info.profileImage);
  const [bannerImage, setBannerImage] = useState(info.bannerImage);
  const [gallery, setGallery] = useState<string[]>(info.gallery || []);

  const [isSaving, setIsSaving] = useState(false);
  const [isResettingCandles, setIsResettingCandles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetCandlesClick = async () => {
    if (!onResetAllCandles) return;
    if (window.confirm("Are you sure you want to reset all virtual candles?")) {
      setIsResettingCandles(true);
      try {
        await onResetAllCandles();
        setError(null);
        alert("All candles have been successfully reset!");
      } catch (e) {
        setError("Could not reset candles. Please try again.");
      } finally {
        setIsResettingCandles(false);
      }
    }
  };

  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local form state whenever panel opens or info updates
  React.useEffect(() => {
    if (isOpen) {
      setName(info.name);
      setNameColor(info.nameColor || '');
      setLetterColors(info.letterColors || {});
      setSelectedCharIndex(null);
      setSelectedWordIndex(null);
      setColorToolTab('base');
      setBirthDate(info.birthDate);
      setDeathDate(info.deathDate);
      setTransitionToGlory(info.transitionToGlory || '');
      setBio(info.bio);
      setQuote(info.quote);
      setProfileImage(info.profileImage);
      setBannerImage(info.bannerImage);
      setGallery(info.gallery || []);
      setError(null);
    }
  }, [isOpen, info]);

  const processImage = (file: File, type: 'profile' | 'banner') => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Compact resolutions to ensure document stays under Firestore 1MB limit
        const MAX_WIDTH = type === 'profile' ? 300 : 800;
        const MAX_HEIGHT = type === 'profile' ? 300 : 350;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Very light footprint (~20-35KB base64 string) while looking crisp
          const quality = type === 'profile' ? 0.55 : 0.50;
          const compressed = canvas.toDataURL('image/jpeg', quality);
          if (type === 'profile') {
            setProfileImage(compressed);
          } else {
            setBannerImage(compressed);
          }
          setError(null);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleProfileFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0], 'profile');
      e.target.value = '';
    }
  };

  const handleBannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0], 'banner');
      e.target.value = '';
    }
  };

  const handleGalleryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.45);
            setGallery(prev => [...prev, compressed]);
            setError(null);
          }
        };
        img.src = uploadEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handleResetProfile = () => {
    setProfileImage(defaultPortrait);
  };

  const handleResetBanner = () => {
    setBannerImage(defaultBanner);
  };

  // Apply color to character at global character index
  const applyColorToChar = (index: number, color: string) => {
    setLetterColors(prev => {
      const next = { ...prev };
      if (color) {
        next[index] = color;
      } else {
        delete next[index];
      }
      return next;
    });
  };

  // Apply color to word at word index
  const applyColorToWord = (wordIndex: number, color: string) => {
    const tokens = name.split(/(\s+)/);
    let charPos = 0;
    let wordCount = 0;

    setLetterColors(prev => {
      const next = { ...prev };
      tokens.forEach(token => {
        if (token.trim().length > 0) {
          if (wordCount === wordIndex) {
            for (let i = 0; i < token.length; i++) {
              if (color) {
                next[charPos + i] = color;
              } else {
                delete next[charPos + i];
              }
            }
          }
          wordCount++;
        }
        charPos += token.length;
      });
      return next;
    });
  };

  // Color Presets
  const applyPresetPattern = (type: 'first-line-white' | 'word-contrast' | 'gold-white' | 'sunrise' | 'reset') => {
    if (type === 'reset') {
      setLetterColors({});
      setSelectedCharIndex(null);
      setSelectedWordIndex(null);
      return;
    }

    if (type === 'first-line-white') {
      const line1Len = name.includes('\n') ? name.indexOf('\n') : name.length;
      const next: Record<number, string> = { ...letterColors };
      for (let i = 0; i < line1Len; i++) {
        next[i] = '#ffffff';
      }
      setLetterColors(next);
    } else if (type === 'word-contrast') {
      const tokens = name.split(/(\s+)/);
      const palette = ['#D4AF37', '#fecdd3', '#fed7aa', '#38bdf8', '#e2e8f0', '#a7f3d0'];
      let charPos = 0;
      let wordIdx = 0;
      const next: Record<number, string> = {};

      tokens.forEach(token => {
        if (token.trim().length > 0) {
          const color = palette[wordIdx % palette.length];
          for (let i = 0; i < token.length; i++) {
            next[charPos + i] = color;
          }
          wordIdx++;
        }
        charPos += token.length;
      });
      setLetterColors(next);
    } else if (type === 'gold-white') {
      const palette = ['#D4AF37', '#ffffff'];
      const next: Record<number, string> = {};
      for (let i = 0; i < name.length; i++) {
        if (name[i] !== ' ' && name[i] !== '\n') {
          next[i] = palette[i % 2];
        }
      }
      setLetterColors(next);
    } else if (type === 'sunrise') {
      const palette = ['#fbbf24', '#f97316', '#ef4444', '#ec4899', '#a855f7'];
      const next: Record<number, string> = {};
      let nonSpaceIdx = 0;
      for (let i = 0; i < name.length; i++) {
        if (name[i] !== ' ' && name[i] !== '\n') {
          next[i] = palette[nonSpaceIdx % palette.length];
          nonSpaceIdx++;
        }
      }
      setLetterColors(next);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('The name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        name: name.trim(),
        nameColor: nameColor.trim(),
        letterColors,
        birthDate,
        deathDate,
        transitionToGlory: transitionToGlory.trim(),
        bio: bio.trim(),
        quote: quote.trim(),
        profileImage,
        bannerImage,
        gallery
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Panel Container (Slides from right) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`relative w-full max-w-md h-full shadow-2xl flex flex-col z-10 overflow-hidden ${
              isDark 
                ? 'bg-[#121212] border-l border-white/5 text-warm-cream' 
                : 'bg-white border-l border-warm-gold/15 text-warm-slate'
            }`}
          >
            {/* Header */}
            <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-warm-gold/10'}`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-warm-gold" />
                <h3 className="font-serif text-lg font-semibold">Configure Memorial Info</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Loved One's Name (supports multi-line)</label>
                  <span className="text-[10px] text-gray-400">Press Enter for 2 lines</span>
                </div>
                <textarea
                  required
                  rows={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Evelyn&#10;Vance"
                  className={`w-full px-3 py-2 rounded-xl border outline-hidden text-sm focus:ring-2 focus:ring-warm-gold/30 resize-none ${
                    isDark 
                      ? 'bg-white/5 border-white/10 focus:border-warm-gold/40' 
                      : 'bg-warm-cream/30 border-warm-gold/15 focus:border-warm-gold'
                  }`}
                />
              </div>

              {/* Live Name Preview & Individual Text Color Customizer */}
              <div className="space-y-3 p-3.5 rounded-2xl border bg-black/5 dark:bg-white/2 border-warm-gold/20">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-warm-gold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Name Text Styling & Individual Colors</span>
                  </label>
                  {Object.keys(letterColors).length > 0 && (
                    <button
                      type="button"
                      onClick={() => applyPresetPattern('reset')}
                      className="text-[10px] font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      Reset Custom Letter Colors
                    </button>
                  )}
                </div>

                {/* Live Name Preview Box */}
                <div className={`p-3 rounded-xl border text-center transition-all ${isDark ? 'bg-black/40 border-white/10' : 'bg-white border-warm-gold/15'}`}>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Live Preview</span>
                  <div className="font-serif text-2xl font-bold py-1">
                    <ColoredName
                      name={name || "Loved One Name"}
                      nameColor={nameColor}
                      letterColors={letterColors}
                      fallbackColorClass={isDark ? 'text-warm-cream' : 'text-warm-slate'}
                    />
                  </div>
                </div>

                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/10 dark:bg-white/5 border border-white/5">
                  <button
                    type="button"
                    onClick={() => setColorToolTab('base')}
                    className={`py-1.5 text-[10px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      colorToolTab === 'base'
                        ? 'bg-warm-gold text-white shadow-xs'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Palette className="w-3 h-3" />
                    <span>Base Color</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setColorToolTab('words')}
                    className={`py-1.5 text-[10px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      colorToolTab === 'words'
                        ? 'bg-warm-gold text-white shadow-xs'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Type className="w-3 h-3" />
                    <span>By Words</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setColorToolTab('letters')}
                    className={`py-1.5 text-[10px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      colorToolTab === 'letters'
                        ? 'bg-warm-gold text-white shadow-xs'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Per Letter</span>
                  </button>
                </div>

                {/* Mode A: Base Color */}
                {colorToolTab === 'base' && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] text-gray-400 block">Overall fallback color for the entire name:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { value: '', label: 'Default' },
                        { value: '#ffffff', label: 'White' },
                        { value: '#D4AF37', label: 'Gold' },
                        { value: '#fecdd3', label: 'Rose' },
                        { value: '#fed7aa', label: 'Amber' },
                        { value: '#38bdf8', label: 'Cyan' },
                        { value: '#e2e8f0', label: 'Silver' },
                      ].map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setNameColor(color.value)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-all cursor-pointer ${
                            nameColor === color.value
                              ? 'border-warm-gold bg-warm-gold/15 text-warm-gold font-bold'
                              : isDark
                                ? 'border-white/5 bg-white/2 hover:bg-white/5 text-gray-400'
                                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {color.label}
                        </button>
                      ))}

                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-[10px] text-gray-400">Custom:</span>
                        <input
                          type="color"
                          value={nameColor || (isDark ? '#faf5e8' : '#1e1a15')}
                          onChange={(e) => setNameColor(e.target.value)}
                          className="w-6 h-6 rounded-md border border-white/10 cursor-pointer overflow-hidden p-0 bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode B: Word Colors */}
                {colorToolTab === 'words' && (
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[10px] text-gray-400 block">Click any word below to assign its custom color:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(() => {
                        const words = name.split(/(\s+)/).filter(w => w.trim().length > 0);
                        return words.map((w, wIdx) => (
                          <button
                            key={wIdx}
                            type="button"
                            onClick={() => setSelectedWordIndex(selectedWordIndex === wIdx ? null : wIdx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold border transition-all cursor-pointer ${
                              selectedWordIndex === wIdx
                                ? 'border-warm-gold ring-2 ring-warm-gold/50 bg-warm-gold/20 text-warm-gold'
                                : isDark
                                  ? 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-200'
                                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
                            }`}
                          >
                            {w}
                          </button>
                        ));
                      })()}
                    </div>

                    {selectedWordIndex !== null && (
                      <div className="p-2.5 rounded-xl border border-warm-gold/30 bg-warm-gold/10 space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-warm-gold">
                          <span>Pick Color for Word #{selectedWordIndex + 1}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedWordIndex(null)}
                            className="text-gray-400 hover:text-gray-200 cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {['#D4AF37', '#ffffff', '#fecdd3', '#fed7aa', '#38bdf8', '#a7f3d0', '#c084fc', '#e2e8f0'].map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => applyColorToWord(selectedWordIndex, hex)}
                              style={{ backgroundColor: hex }}
                              className="w-6 h-6 rounded-full border border-black/20 shadow-xs hover:scale-110 transition-transform cursor-pointer"
                            />
                          ))}
                          <input
                            type="color"
                            onChange={(e) => applyColorToWord(selectedWordIndex, e.target.value)}
                            className="w-6 h-6 rounded-md cursor-pointer border border-white/20 p-0 bg-transparent"
                            title="Custom word color"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => applyPresetPattern('word-contrast')}
                        className="w-full py-1.5 px-3 rounded-xl text-[11px] font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Color Each Word Distinctly</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Mode C: Individual Letter Colors */}
                {colorToolTab === 'letters' && (
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[10px] text-gray-400 block">Click any individual letter to set its color:</span>
                    
                    <div className="flex flex-wrap items-center gap-1 max-h-28 overflow-y-auto p-2 rounded-xl bg-black/20 border border-white/5">
                      {name.split('').map((char, charIdx) => {
                        if (char === ' ') return <span key={charIdx} className="w-2" />;
                        if (char === '\n') return <div key={charIdx} className="w-full h-0 basis-full" />;

                        const isSelected = selectedCharIndex === charIdx;
                        const charColor = letterColors[charIdx] || nameColor;

                        return (
                          <button
                            key={charIdx}
                            type="button"
                            onClick={() => setSelectedCharIndex(isSelected ? null : charIdx)}
                            style={{ color: charColor || undefined }}
                            className={`w-7 h-8 rounded-lg font-serif font-bold text-base flex items-center justify-center transition-all border cursor-pointer ${
                              isSelected
                                ? 'border-warm-gold ring-2 ring-warm-gold bg-warm-gold/30 scale-110 z-10'
                                : isDark
                                  ? 'border-white/10 bg-white/5 hover:bg-white/10'
                                  : 'border-gray-200 bg-white hover:bg-gray-100'
                            }`}
                          >
                            {char}
                          </button>
                        );
                      })}
                    </div>

                    {selectedCharIndex !== null && (
                      <div className="p-2.5 rounded-xl border border-warm-gold/30 bg-warm-gold/10 space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-warm-gold">
                          <span>
                            Color for letter '{name[selectedCharIndex]}' (Pos {selectedCharIndex + 1})
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedCharIndex(null)}
                            className="text-gray-400 hover:text-gray-200 cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {['#D4AF37', '#ffffff', '#fecdd3', '#fed7aa', '#38bdf8', '#a7f3d0', '#c084fc', '#e2e8f0'].map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => applyColorToChar(selectedCharIndex, hex)}
                              style={{ backgroundColor: hex }}
                              className="w-6 h-6 rounded-full border border-black/20 shadow-xs hover:scale-110 transition-transform cursor-pointer"
                            />
                          ))}
                          <input
                            type="color"
                            onChange={(e) => applyColorToChar(selectedCharIndex, e.target.value)}
                            className="w-6 h-6 rounded-md cursor-pointer border border-white/20 p-0 bg-transparent"
                            title="Custom character color"
                          />
                          <button
                            type="button"
                            onClick={() => applyColorToChar(selectedCharIndex, '')}
                            className="px-2 py-0.5 rounded-md text-[9px] bg-gray-600 text-white hover:bg-gray-500 cursor-pointer ml-auto"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick Presets */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => applyPresetPattern('first-line-white')}
                        className="py-1.5 px-2 rounded-xl text-[10px] font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Sparkles className="w-3 h-3 text-white" />
                        <span>First Line White</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applyPresetPattern('gold-white')}
                        className="py-1.5 px-2 rounded-xl text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-warm-gold" />
                        <span>Gold & White</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applyPresetPattern('sunrise')}
                        className="py-1.5 px-2 rounded-xl text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Sunrise</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Birth Date</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-hidden text-sm cursor-pointer ${
                      isDark 
                        ? 'bg-white/5 border-white/10' 
                        : 'bg-warm-cream/30 border-warm-gold/15'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Date of Passing</label>
                  <input
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-hidden text-sm cursor-pointer ${
                      isDark 
                        ? 'bg-white/5 border-white/10' 
                        : 'bg-warm-cream/30 border-warm-gold/15'
                    }`}
                  />
                </div>
              </div>

              {/* Quote */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Memorial Quote / Verse</label>
                <textarea
                  rows={2}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border outline-hidden text-sm resize-none focus:ring-2 focus:ring-warm-gold/30 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 focus:border-warm-gold/40' 
                      : 'bg-warm-cream/30 border-warm-gold/15 focus:border-warm-gold'
                  }`}
                />
              </div>

              {/* Transition to Glory */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-warm-gold">Transition to Glory: Celebrating a Life Well-Lived (Home Page Summary)</label>
                <textarea
                  rows={4}
                  value={transitionToGlory}
                  onChange={(e) => setTransitionToGlory(e.target.value)}
                  placeholder="Summary tribute / transition statement rendered on the home page..."
                  className={`w-full px-3 py-2 rounded-xl border outline-hidden text-sm resize-none focus:ring-2 focus:ring-warm-gold/30 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 focus:border-warm-gold/40' 
                      : 'bg-warm-cream/30 border-warm-gold/15 focus:border-warm-gold'
                  }`}
                />
              </div>

              {/* Life Story & Biography */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Life Story & Biography (Full Story Page)</label>
                <textarea
                  rows={5}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Detailed biography rendered on the Life Story page..."
                  className={`w-full px-3 py-2 rounded-xl border outline-hidden text-sm resize-none focus:ring-2 focus:ring-warm-gold/30 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 focus:border-warm-gold/40' 
                      : 'bg-warm-cream/30 border-warm-gold/15 focus:border-warm-gold'
                  }`}
                />
              </div>

              {/* Profile Image */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Portrait Photo</label>
                  <button
                    type="button"
                    onClick={handleResetProfile}
                    className="text-[10px] text-warm-gold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default</span>
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-warm-gold/20 bg-warm-cream shrink-0">
                    <img src={profileImage} alt="Portrait" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                      isDark 
                        ? 'border-white/10 hover:bg-white/5 text-gray-300' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New</span>
                  </button>
                  <input
                    type="file"
                    ref={profileInputRef}
                    onChange={handleProfileFile}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Banner Image */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Header Banner Background</label>
                  <button
                    type="button"
                    onClick={handleResetBanner}
                    className="text-[10px] text-warm-gold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default</span>
                  </button>
                </div>
                <div className="relative w-full rounded-xl overflow-hidden aspect-[3/1] border border-warm-gold/20 bg-black/15">
                  <img src={bannerImage} alt="Banner" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="bg-white/90 backdrop-blur-xs text-warm-slate text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white cursor-pointer shadow-sm flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Change Banner</span>
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    onChange={handleBannerFile}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Gallery Images */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Photo Gallery (Images of Person)</label>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="text-[10px] text-warm-gold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {gallery.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group bg-black/20">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-rose-500 cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Plus empty card */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className={`aspect-square rounded-lg border border-dashed flex flex-col items-center justify-center text-xs transition-colors cursor-pointer ${
                      isDark 
                        ? 'border-white/10 hover:bg-white/5 text-gray-500 hover:text-gray-300' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">Upload</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={galleryInputRef}
                  onChange={handleGalleryFile}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Data Reset Section */}
              {onResetAllCandles && (
                <div className="pt-4 border-t border-amber-500/20 space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Virtual Candles Management</span>
                  </label>
                  <p className="text-xs text-gray-400 font-light">
                    Clear lighted candles if you wish to start a new prayer & remembrance cycle.
                  </p>

                  <div>
                    <button
                      type="button"
                      disabled={isResettingCandles}
                      onClick={handleResetCandlesClick}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isResettingCandles ? (
                        <div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      <span>Reset All Candles</span>
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Footer Actions */}
            <div className={`p-4 border-t flex gap-3 ${isDark ? 'border-white/5' : 'border-warm-gold/10'}`}>
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isDark 
                    ? 'border-white/10 text-gray-300 hover:bg-white/5' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleFormSubmit}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-warm-gold via-yellow-600 to-warm-gold text-white shadow-lg flex items-center justify-center gap-1 cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
