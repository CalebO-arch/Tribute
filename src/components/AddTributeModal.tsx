import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image, Upload, AlertCircle, Sparkles, Video, Link, Film } from 'lucide-react';
import { Tribute } from '../types';
import { renderVideoMedia } from '../utils/mediaUtils';

interface AddTributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tributeData: Omit<Tribute, 'id' | 'createdAt' | 'likes'>) => Promise<void>;
  isDark: boolean;
}

const RELATIONSHIPS = [
  'Son',
  'Daughter',
  'Spouse / Partner',
  'Family Member',
  'Sibling',
  'Grandchild',
  'Friend',
  'Colleague',
  'Neighbor',
  'Classmate',
  'Other'
];

const THEMES = [
  { id: 'slate', name: 'Minimal Slate', color: 'bg-slate-400' },
  { id: 'amber', name: 'Warm Amber', color: 'bg-amber-400' },
  { id: 'rose', name: 'Heart Rose', color: 'bg-rose-400' },
  { id: 'lavender', name: 'Serene Lavender', color: 'bg-indigo-400' },
  { id: 'gold', name: 'Sacred Gold', color: 'bg-yellow-500' }
] as const;

export default function AddTributeModal({ isOpen, onClose, onSubmit, isDark }: AddTributeModalProps) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [customRelationship, setCustomRelationship] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [video, setVideo] = useState<string | undefined>(undefined);
  const [videoMode, setVideoMode] = useState<'link' | 'upload'>('link');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [theme, setTheme] = useState<'amber' | 'rose' | 'lavender' | 'slate' | 'gold'>('slate');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const processVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('Video file is too large. Please upload a file under 25MB or paste a YouTube / Vimeo link.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setVideo(e.target.result as string);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processVideoFile(e.target.files[0]);
    }
  };

  const handleVideoUrlAdd = () => {
    if (!videoUrlInput.trim()) return;
    setVideo(videoUrlInput.trim());
    setError(null);
  };

  // Compress and resize image client-side to fit Firestore nicely
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
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

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
          setImage(compressedBase64);
          setError(null);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!text.trim()) {
      setError('Please write your tribute message.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const messageContent = text.trim();
      const payload: any = {
        name: name.trim(),
        relationship: relationship === 'Other' ? (customRelationship.trim() || 'Other') : relationship,
        text: messageContent,
        message: messageContent,
        theme
      };
      if (image && typeof image === 'string' && image.trim()) {
        payload.image = image.trim();
      }
      if (video && typeof video === 'string' && video.trim()) {
        payload.video = video.trim();
      }

      await onSubmit(payload);
      
      // Reset form
      setName('');
      setRelationship('Friend');
      setCustomRelationship('');
      setText('');
      setImage(undefined);
      setVideo(undefined);
      setVideoUrlInput('');
      setTheme('slate');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to share your tribute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
              isDark 
                ? 'bg-[#121212] border-white/10 text-warm-cream' 
                : 'bg-white border-warm-gold/15 text-warm-slate'
            }`}
          >
            {/* Header */}
            <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-warm-gold/10'}`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-warm-gold" />
                <h3 className="font-serif text-xl font-semibold">Share a Loving Tribute</h3>
              </div>
              <button 
                onClick={onClose} 
                className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {error && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Your Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oluwole Ajiboye"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-hidden transition-all text-sm focus:ring-2 focus:ring-warm-gold/30 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 focus:border-warm-gold/40' 
                      : 'bg-warm-cream/30 border-warm-gold/15 focus:border-warm-gold'
                  }`}
                />
              </div>

              {/* Relationship */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Relationship to Loved One</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-hidden transition-all text-sm focus:ring-2 focus:ring-warm-gold/30 cursor-pointer ${
                    isDark 
                      ? 'bg-[#121212] border-white/10 focus:border-warm-gold/40' 
                      : 'bg-warm-cream/30 border-warm-gold/15 focus:border-warm-gold'
                  }`}
                >
                  {RELATIONSHIPS.map((rel) => (
                    <option key={rel} value={rel} className={isDark ? 'bg-[#121212] text-warm-cream' : 'bg-white text-warm-slate'}>
                      {rel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Relationship Specify */}
              <AnimatePresence>
                {relationship === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Specify Relationship</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Godparent, Lifelong Mentor, etc."
                      value={customRelationship}
                      onChange={(e) => setCustomRelationship(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border outline-hidden transition-all text-sm focus:ring-2 focus:ring-warm-gold/30 ${
                        isDark 
                          ? 'bg-[#121212] border-white/10 focus:border-warm-gold/40' 
                          : 'bg-warm-cream/30 border-warm-gold/15 focus:border-warm-gold'
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tribute Message */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Your Tribute Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share a touching memory, anecdote, or expression of love..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-hidden transition-all text-sm focus:ring-2 focus:ring-warm-gold/30 resize-none ${
                    isDark 
                      ? 'bg-white/5 border-white/10 focus:border-warm-gold/40' 
                      : 'bg-warm-cream/30 border-warm-gold/15 focus:border-warm-gold'
                  }`}
                />
              </div>

              {/* Photo Upload Area */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Share a Photo (Optional)</label>
                
                {image ? (
                  <div className="relative w-full rounded-xl overflow-hidden aspect-video border border-warm-gold/10 bg-black/10">
                    <img src={image} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage(undefined)}
                      className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full p-6 rounded-xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center cursor-pointer gap-2 ${
                      dragActive
                        ? 'border-warm-gold bg-warm-gold/5'
                        : isDark
                          ? 'border-white/10 hover:border-warm-gold/40 hover:bg-white/5'
                          : 'border-warm-gold/20 hover:border-warm-gold hover:bg-warm-gold/5'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-xs font-medium">Drag & drop an image or click to browse</span>
                    <span className="text-[10px] text-gray-500">Supports JPEG, PNG, WEBP</span>
                  </div>
                )}
              </div>

              {/* Video Upload or Link Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Share a Video (Optional)</label>
                  {!video && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setVideoMode('link')}
                        className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                          videoMode === 'link'
                            ? 'bg-warm-gold text-white font-medium'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Video Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode('upload')}
                        className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                          videoMode === 'upload'
                            ? 'bg-warm-gold text-white font-medium'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Upload Video
                      </button>
                    </div>
                  )}
                </div>

                {video ? (
                  <div className="relative w-full rounded-xl overflow-hidden border border-warm-gold/20 bg-black/40">
                    {renderVideoMedia(video)}
                    <button
                      type="button"
                      onClick={() => {
                        setVideo(undefined);
                        setVideoUrlInput('');
                      }}
                      className="absolute top-2 right-2 bg-black/80 text-white p-1.5 rounded-full hover:bg-black transition-colors cursor-pointer z-20 shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : videoMode === 'link' ? (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Link className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="Paste YouTube, Vimeo, or MP4 video URL..."
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-hidden transition-all ${
                          isDark
                            ? 'bg-white/5 border-white/10 focus:border-warm-gold/40'
                            : 'bg-warm-cream/30 border-warm-gold/15 focus:border-warm-gold'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVideoUrlAdd}
                      disabled={!videoUrlInput.trim()}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-warm-gold text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                    >
                      Attach
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => videoFileInputRef.current?.click()}
                    className={`w-full p-4 rounded-xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center cursor-pointer gap-1.5 ${
                      isDark
                        ? 'border-white/10 hover:border-warm-gold/40 hover:bg-white/5'
                        : 'border-warm-gold/20 hover:border-warm-gold hover:bg-warm-gold/5'
                    }`}
                  >
                    <input
                      type="file"
                      ref={videoFileInputRef}
                      onChange={handleVideoFileChange}
                      accept="video/*"
                      className="hidden"
                    />
                    <Video className="w-5 h-5 text-gray-400" />
                    <span className="text-xs font-medium">Click to upload a video file</span>
                    <span className="text-[10px] text-gray-500">Supports MP4, WebM, MOV (up to 25MB)</span>
                  </div>
                )}
              </div>

              {/* Card Theme Color Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Select Card Style Theme</label>
                <div className="flex flex-wrap gap-3">
                  {THEMES.map((themeOption) => (
                    <button
                      type="button"
                      key={themeOption.id}
                      onClick={() => setTheme(themeOption.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                        theme === themeOption.id
                          ? isDark
                            ? 'border-warm-gold bg-warm-gold/20 text-warm-cream'
                            : 'border-warm-gold bg-soft-amber text-yellow-900 shadow-xs'
                          : isDark
                            ? 'border-white/5 bg-white/5 text-gray-400 hover:border-white/15'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${themeOption.color}`} />
                      <span>{themeOption.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                    isDark
                      ? 'border-white/10 bg-transparent text-gray-300 hover:bg-white/5'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-warm-gold via-yellow-600 to-warm-gold text-white shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Share Tribute</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
