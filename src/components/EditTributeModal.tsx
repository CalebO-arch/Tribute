import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Upload, AlertCircle, Edit3, Trash2, Video, Link } from 'lucide-react';
import { Tribute } from '../types';
import { renderVideoMedia } from '../utils/mediaUtils';

interface EditTributeModalProps {
  tribute: Tribute | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updatedData: Partial<Tribute>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
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

export default function EditTributeModal({
  tribute,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  isDark
}: EditTributeModalProps) {
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Populate form fields when tribute changes
  useEffect(() => {
    if (tribute) {
      setName(tribute.name || '');
      setText(tribute.text || '');
      setImage(tribute.image);
      setVideo(tribute.video);
      setVideoUrlInput(tribute.video && !tribute.video.startsWith('data:') ? tribute.video : '');
      setTheme(tribute.theme || 'slate');

      if (tribute.relationship) {
        if (RELATIONSHIPS.includes(tribute.relationship)) {
          setRelationship(tribute.relationship);
          setCustomRelationship('');
        } else {
          setRelationship('Other');
          setCustomRelationship(tribute.relationship);
        }
      } else {
        setRelationship('Friend');
        setCustomRelationship('');
      }
    }
  }, [tribute]);

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
            width = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
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
    if (!tribute) return;

    if (!name.trim()) {
      setError('Please specify the author name.');
      return;
    }
    if (!text.trim()) {
      setError('Please write the tribute message.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const finalRelationship = relationship === 'Other' ? (customRelationship.trim() || 'Other') : relationship;
      await onUpdate(tribute.id, {
        name: name.trim(),
        relationship: finalRelationship,
        text: text.trim(),
        image: image || '',
        video: video || '',
        theme
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update tribute.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!tribute || !onDelete) return;
    if (!window.confirm("Are you sure you want to delete this tribute?")) return;

    setIsDeleting(true);
    try {
      await onDelete(tribute.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete tribute.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !tribute) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border z-10 max-h-[90vh] overflow-y-auto ${
            isDark 
              ? 'bg-memorial border-warm-gold/30 text-warm-cream' 
              : 'bg-white border-warm-gold/20 text-warm-slate'
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-full cursor-pointer transition-colors ${
              isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2 mb-1">
            <Edit3 className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif text-2xl font-semibold tracking-tight">
              Edit Tribute
            </h3>
          </div>
          <p className={`text-xs mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Creator Mode: Correct typos, update photos, or refine shared memories.
          </p>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Author Name */}
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">
                Author Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                  isDark 
                    ? 'bg-black/30 border-white/10 focus:border-warm-gold text-white' 
                    : 'bg-warm-cream/30 border-warm-gold/20 focus:border-warm-gold text-warm-slate'
                }`}
              />
            </div>

            {/* Relationship */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  Relationship to Loved One
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                    isDark 
                      ? 'bg-memorial border-white/10 focus:border-warm-gold text-white' 
                      : 'bg-warm-cream/30 border-warm-gold/20 focus:border-warm-gold text-warm-slate'
                  }`}
                >
                  {RELATIONSHIPS.map((rel) => (
                    <option key={rel} value={rel} className={isDark ? 'bg-memorial text-white' : 'bg-white text-warm-slate'}>
                      {rel}
                    </option>
                  ))}
                </select>
              </div>

              {relationship === 'Other' && (
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    Specify Relationship
                  </label>
                  <input
                    type="text"
                    value={customRelationship}
                    onChange={(e) => setCustomRelationship(e.target.value)}
                    placeholder="e.g. Goddaughter"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                      isDark 
                        ? 'bg-black/30 border-white/10 focus:border-warm-gold text-white' 
                        : 'bg-warm-cream/30 border-warm-gold/20 focus:border-warm-gold text-warm-slate'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Tribute Text */}
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">
                Memory or Tribute Message *
              </label>
              <textarea
                required
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your cherished story, message, or blessing..."
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                  isDark 
                    ? 'bg-black/30 border-white/10 focus:border-warm-gold text-white' 
                    : 'bg-warm-cream/30 border-warm-gold/20 focus:border-warm-gold text-warm-slate'
                }`}
              />
            </div>

            {/* Card Theme */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 opacity-80">
                Card Accent Theme
              </label>
              <div className="flex items-center gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      theme === t.id
                        ? 'border-warm-gold ring-1 ring-warm-gold scale-105'
                        : isDark ? 'border-white/10 opacity-60 hover:opacity-100' : 'border-black/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
                    <span className="hidden sm:inline">{t.name.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload / Change */}
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">
                Memory Photo (Optional)
              </label>
              
              {image ? (
                <div className="relative rounded-2xl overflow-hidden border border-warm-gold/30 aspect-[16/9] group">
                  <img src={image} alt="Tribute photo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-warm-cream cursor-pointer"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setImage(undefined)}
                      className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-warm-gold bg-warm-gold/10'
                      : isDark
                        ? 'border-white/10 hover:border-warm-gold/50 bg-black/20'
                        : 'border-warm-gold/20 hover:border-warm-gold bg-warm-cream/20'
                  }`}
                >
                  <Upload className="w-5 h-5 text-warm-gold mx-auto mb-1 opacity-80" />
                  <p className="text-xs font-medium">Click or drag an image here</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG or WebP</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="pt-3 flex items-center justify-between border-t border-black/5 dark:border-white/10">
              {onDelete ? (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={isDeleting || isSubmitting}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-xs font-medium opacity-70 hover:opacity-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-warm-gold to-yellow-600 text-white hover:brightness-110 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
