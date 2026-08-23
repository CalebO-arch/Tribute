import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Heart, Plus, ArrowLeft, Send, BookOpen, Sun, Shield, Quote, Check } from 'lucide-react';
import { collection, onSnapshot, addDoc, doc, updateDoc, increment, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Prayer, NavPage, DeceasedPersonInfo } from '../types';

interface PrayerWallPageProps {
  info: DeceasedPersonInfo;
  isDark: boolean;
  onNavigate: (page: NavPage) => void;
}

export default function PrayerWallPage({ info, isDark, onNavigate }: PrayerWallPageProps) {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [verseOrBlessing, setVerseOrBlessing] = useState('');
  const [candleLit, setCandleLit] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Firestore subscription for Prayer Wall items
  useEffect(() => {
    const prayersQuery = query(collection(db, 'prayers'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(prayersQuery, (snapshot) => {
      const docs: Prayer[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Prayer[];
      setPrayers(docs);
      setLoading(false);
    }, (error) => {
      console.warn("Prayer wall subscription error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmitPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !prayerText.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'prayers'), {
        authorName: authorName.trim(),
        prayerText: prayerText.trim(),
        verseOrBlessing: verseOrBlessing.trim(),
        candleLit: candleLit,
        createdAt: serverTimestamp(),
        likes: 1
      });

      setAuthorName('');
      setPrayerText('');
      setVerseOrBlessing('');
      setIsFormOpen(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error("Error submitting prayer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePrayer = async (id: string) => {
    const key = `liked_prayer_${id}`;
    if (localStorage.getItem(key)) return;

    try {
      localStorage.setItem(key, 'true');
      const docRef = doc(db, 'prayers', id);
      await updateDoc(docRef, {
        likes: increment(1)
      });
    } catch (err) {
      console.error("Error liking prayer:", err);
    }
  };

  // Pre-seeded inspirational scriptures for faith wall
  const scriptures = [
    {
      verse: "Psalm 23:1-3",
      text: "The LORD is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul."
    },
    {
      verse: "John 14:27",
      text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid."
    },
    {
      verse: "2 Corinthians 5:8",
      text: "We are confident, I say, and would prefer to be away from the body and at home with the Lord."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
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
        className={`rounded-3xl p-6 sm:p-10 border mb-8 text-center relative overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-b from-amber-950/40 via-memorial to-memorial border-warm-gold/30' 
            : 'bg-gradient-to-b from-amber-500/10 via-[#faf7f2] to-[#faf7f2] border-warm-gold/25'
        }`}
      >
        {/* Soft Sacred Flame Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-warm-gold/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Prayer Wall</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight mb-3">
          The Faith That Held Him
        </h1>

        <p className={`text-xs sm:text-sm font-light max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          A sacred sanctuary for offering prayers, scriptures, and spiritual blessings in honor of {info.name}.
        </p>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-warm-gold to-yellow-600 text-white hover:brightness-110 shadow-lg cursor-pointer transition-all"
          >
            <Flame className="w-4 h-4 text-amber-200 fill-amber-200" />
            <span>Offer a Prayer & Light Candle</span>
          </button>
        </div>
      </motion.div>

      {/* Success Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Your prayer has been offered and added to the wall.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prayer Form Modal / Accordion */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitPrayer}
            className={`p-6 sm:p-8 rounded-3xl border mb-10 space-y-4 ${
              isDark ? 'bg-white/5 border-warm-gold/30' : 'bg-white border-warm-gold/25 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-warm-gold/20">
              <h3 className="font-serif text-lg font-semibold text-warm-gold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Offer Your Prayer or Blessing</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reverend Thomas & Family"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-black/30 border-white/10 focus:border-warm-gold' : 'bg-warm-cream/30 border-warm-gold/20'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">Bible Verse / Scripture / Blessing (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Psalm 23:4 or 'May eternal light shine upon him'"
                  value={verseOrBlessing}
                  onChange={(e) => setVerseOrBlessing(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-black/30 border-white/10 focus:border-warm-gold' : 'bg-warm-cream/30 border-warm-gold/20'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">Your Prayer or Reflection *</label>
              <textarea
                required
                rows={3}
                placeholder="Write your prayer, blessing, or words of comfort..."
                value={prayerText}
                onChange={(e) => setPrayerText(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                  isDark ? 'bg-black/30 border-white/10 focus:border-warm-gold' : 'bg-warm-cream/30 border-warm-gold/20'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="lightCandleCheck"
                checked={candleLit}
                onChange={(e) => setCandleLit(e.target.checked)}
                className="rounded accent-warm-gold cursor-pointer"
              />
              <label htmlFor="lightCandleCheck" className="text-xs font-medium cursor-pointer flex items-center gap-1.5 text-warm-gold">
                <Flame className="w-3.5 h-3.5 fill-warm-gold" />
                <span>Light a virtual prayer candle alongside this prayer</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-medium opacity-70 hover:opacity-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-full text-xs font-semibold bg-warm-gold text-white flex items-center gap-2 hover:bg-yellow-600 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Offering Prayer...' : 'Offer Prayer'}</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Featured Scripture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {scriptures.map((sc, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border text-center relative ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-warm-gold/20 shadow-xs'
            }`}
          >
            <BookOpen className="w-4 h-4 text-warm-gold mx-auto mb-2 opacity-80" />
            <p className="font-serif text-xs italic leading-relaxed text-warm-gold">
              "{sc.text}"
            </p>
            <span className="block mt-2 text-[10px] uppercase font-bold tracking-wider text-gray-400">
              {sc.verse}
            </span>
          </div>
        ))}
      </div>

      {/* Prayers List Feed */}
      <div className="space-y-6">
        <h3 className="font-serif text-xl font-semibold text-warm-gold flex items-center gap-2 border-b pb-3 border-black/5 dark:border-white/10">
          <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span>Prayers & Blessings Wall</span>
        </h3>

        {prayers.length === 0 ? (
          <div className={`p-10 rounded-3xl border text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-warm-gold/20'}`}>
            <Sparkles className="w-8 h-8 text-warm-gold/50 mx-auto mb-3 animate-pulse" />
            <h4 className="font-serif text-lg font-semibold text-warm-gold">Be the First to Offer a Prayer</h4>
            <p className="text-xs text-gray-400 mt-1 mb-4">Your prayers and blessings provide comfort to the family.</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-warm-gold text-white"
            >
              Offer a Prayer Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prayers.map((pr) => (
              <motion.div
                key={pr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-3xl border relative flex flex-col justify-between ${
                  isDark 
                    ? 'bg-memorial/90 border-warm-gold/20 shadow-lg' 
                    : 'bg-white border-warm-gold/20 shadow-sm'
                }`}
              >
                {/* Candle Flame Glow Indicator */}
                {pr.candleLit && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-amber-400">Prayer Candle Lit</span>
                  </div>
                )}

                <div>
                  <div className="mb-3 pr-20">
                    <h4 className="font-serif font-semibold text-base text-warm-gold">{pr.authorName}</h4>
                    {pr.verseOrBlessing && (
                      <span className="text-xs font-serif italic text-amber-500 block mt-0.5">
                        "{pr.verseOrBlessing}"
                      </span>
                    )}
                  </div>

                  <p className={`text-xs sm:text-sm font-light leading-relaxed mb-4 ${
                    isDark ? 'text-gray-200' : 'text-warm-slate'
                  }`}>
                    {pr.prayerText}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Sacred Prayer Offered</span>

                  <button
                    onClick={() => handleLikePrayer(pr.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isDark ? 'bg-white/5 hover:bg-white/10 text-amber-300' : 'bg-warm-cream hover:bg-warm-gold/20 text-warm-slate'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/30" />
                    <span>Say Amen ({pr.likes || 1})</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
