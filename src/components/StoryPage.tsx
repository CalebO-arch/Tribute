import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Calendar, Heart, ArrowLeft, Quote, Sparkles, Flame, Briefcase, Users, Church, GraduationCap, Shield, Edit3 } from 'lucide-react';
import { DeceasedPersonInfo, NavPage } from '../types';

interface StoryPageProps {
  info: DeceasedPersonInfo;
  isDark: boolean;
  isAdmin?: boolean;
  onOpenCustomizer?: () => void;
  onNavigate: (page: NavPage) => void;
  onAddTributeClick: () => void;
}

interface BioSection {
  id: string;
  title: string;
  iconKey: string;
  paragraphs: string[];
}

export default function StoryPage({ info, isDark, isAdmin, onOpenCustomizer, onNavigate, onAddTributeClick }: StoryPageProps) {
  // Format birth and death dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Calculate age text
  const getAgeText = () => {
    if (!info.birthDate || !info.deathDate) return "(83 Years)";
    try {
      const birth = new Date(info.birthDate);
      const death = new Date(info.deathDate);
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

  // Parse raw bio text into structured sections
  const parseBioSections = (bioText: string): BioSection[] => {
    if (!bioText) return [];

    const rawBlocks = bioText.split('\n\n').map(p => p.trim()).filter(Boolean);
    const sections: BioSection[] = [];

    let currentSection: BioSection = {
      id: 'sec-0',
      title: 'Biography & Early Life',
      iconKey: 'book',
      paragraphs: []
    };

    const getIconKey = (heading: string) => {
      const t = heading.toLowerCase();
      if (t.includes('marriage') || t.includes('family') || t.includes('wedding')) return 'heart';
      if (t.includes('work') || t.includes('career') || t.includes('profession') || t.includes('employment')) return 'briefcase';
      if (t.includes('activit') || t.includes('community') || t.includes('union')) return 'users';
      if (t.includes('religion') || t.includes('church') || t.includes('faith') || t.includes('spiritual')) return 'church';
      if (t.includes('education') || t.includes('school')) return 'graduation';
      return 'book';
    };

    const formatTitle = (rawTitle: string) => {
      const t = rawTitle.toUpperCase();
      if (t.includes('BIOGRAPHY')) return 'Biography & Early Life';
      if (t.includes('MARRIAGE')) return 'Marriage & Family Life';
      if (t.includes('WORKING LIFE') || t.includes('CAREER')) return 'Working Life & Career';
      if (t.includes('ACTIVITIES')) return 'Community Leadership & Activities';
      if (t.includes('RELIGION')) return 'Faith, Religion & Christian Service';
      return rawTitle;
    };

    for (const block of rawBlocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const firstLine = lines[0];
        const isHeaderLine = (
          firstLine === firstLine.toUpperCase() &&
          firstLine.length < 50 &&
          !firstLine.endsWith('.')
        );

        if (isHeaderLine) {
          if (currentSection.paragraphs.length > 0) {
            sections.push(currentSection);
          }

          const restParagraphs = lines.slice(1).join('\n').trim();
          currentSection = {
            id: `sec-${sections.length + 1}`,
            title: formatTitle(firstLine),
            iconKey: getIconKey(firstLine),
            paragraphs: restParagraphs ? [restParagraphs] : []
          };
          continue;
        }
      }

      currentSection.paragraphs.push(block);
    }

    if (currentSection.paragraphs.length > 0) {
      sections.push(currentSection);
    }

    return sections.length > 0 ? sections : [{
      id: 'sec-default',
      title: 'Life Story & Biography',
      iconKey: 'book',
      paragraphs: [bioText]
    }];
  };

  const sections = parseBioSections(info.bio || '');

  const renderSectionIcon = (iconKey: string) => {
    switch (iconKey) {
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-500" />;
      case 'briefcase':
        return <Briefcase className="w-5 h-5 text-amber-500" />;
      case 'users':
        return <Users className="w-5 h-5 text-emerald-500" />;
      case 'church':
        return <Church className="w-5 h-5 text-warm-gold" />;
      case 'graduation':
        return <GraduationCap className="w-5 h-5 text-blue-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-warm-gold" />;
    }
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

      {/* Page Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-6 sm:p-10 border mb-8 text-center relative overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-b from-amber-950/30 via-memorial to-memorial border-warm-gold/20' 
            : 'bg-gradient-to-b from-amber-500/10 via-[#faf7f2] to-[#faf7f2] border-warm-gold/25'
        }`}
      >
        {/* Soft background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-warm-gold/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Creator Mode Quick Edit Button */}
        {isAdmin && onOpenCustomizer && (
          <div className="absolute top-4 right-4 z-20">
            <button
              type="button"
              onClick={onOpenCustomizer}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all cursor-pointer"
              title="Edit Biography & Life Story"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Biography</span>
            </button>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-warm-gold bg-warm-gold/10 border border-warm-gold/20 mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          <span>His Story & Biography</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight mb-3">
          The Life & Legacy of Elder Ajiboye
        </h1>
        <p className={`text-sm sm:text-base font-light max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          A structured chronicle of faith, academic pursuit, public service, and devoted family leadership.
        </p>

        {/* Profile photo & dates badge */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-tr from-warm-gold/80 via-amber-300 to-warm-gold shadow-xl overflow-hidden mb-4">
              <img 
                src={info.profileImage} 
                alt={info.name} 
                className="w-full h-full object-cover rounded-full filter brightness-105"
              />
            </div>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-warm-gold">
            {info.name}
          </h2>

          <div className={`mt-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Calendar className="w-4 h-4 text-warm-gold" />
            <span>{formatDate(info.birthDate)} — {formatDate(info.deathDate)}</span>
          </div>

          <span className="mt-1 text-xs font-semibold text-warm-gold/90 bg-warm-gold/10 px-3 py-1 rounded-full border border-warm-gold/20">
            {getAgeText()}
          </span>
        </div>
      </motion.div>

      {/* Quote Banner */}
      {info.quote && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`p-6 sm:p-8 rounded-2xl border mb-8 text-center relative ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-warm-gold/20 shadow-xs'
          }`}
        >
          <Quote className="w-8 h-8 text-warm-gold/30 mx-auto mb-2" />
          <p className="font-serif text-lg sm:text-xl italic text-warm-gold max-w-3xl mx-auto leading-relaxed">
            "{info.quote}"
          </p>
        </motion.div>
      )}

      {/* Section Quick Jump Bar */}
      {sections.length > 1 && (
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold uppercase tracking-wider text-warm-gold/80 flex items-center gap-1 shrink-0 mr-2">
            <Sparkles className="w-3.5 h-3.5" /> Chapters:
          </span>
          {sections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all border ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                  : 'bg-white hover:bg-warm-cream/80 text-warm-slate border-warm-gold/20 shadow-2xs'
              }`}
            >
              {renderSectionIcon(sec.iconKey)}
              <span>{sec.title}</span>
            </a>
          ))}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Main Structured Biography Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {sections.map((sec, idx) => (
            <motion.div
              key={sec.id}
              id={sec.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                isDark 
                  ? 'bg-memorial/90 border-white/10 hover:border-warm-gold/30' 
                  : 'bg-white border-warm-gold/20 shadow-xs hover:border-warm-gold/40'
              }`}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-warm-gold/20">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-warm-cream/60 border-warm-gold/20'
                  }`}>
                    {renderSectionIcon(sec.iconKey)}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-warm-gold">
                      {sec.title}
                    </h3>
                  </div>
                </div>

                {isAdmin && onOpenCustomizer && (
                  <button
                    type="button"
                    onClick={onOpenCustomizer}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/30 transition-all cursor-pointer shrink-0"
                    title="Edit Story Text in Creator Panel"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Text</span>
                  </button>
                )}
              </div>

              {/* Section Content Paragraphs */}
              <div className={`space-y-4 leading-relaxed text-sm sm:text-base font-light ${
                isDark ? 'text-gray-200' : 'text-warm-slate'
              }`}>
                {sec.paragraphs.map((para, pIdx) => {
                  const isFirstOfBio = idx === 0 && pIdx === 0;
                  return (
                    <p 
                      key={pIdx} 
                      className={`whitespace-pre-line ${
                        isFirstOfBio 
                          ? 'first-letter:float-left first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:mr-3 first-letter:text-warm-gold leading-relaxed' 
                          : 'leading-relaxed'
                      }`}
                    >
                      {para}
                    </p>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Core Values & Pillars */}
          <div className={`p-6 sm:p-8 rounded-3xl border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-warm-cream/40 border-warm-gold/20'
          }`}>
            <h3 className="font-serif text-xl font-semibold mb-4 text-warm-gold flex items-center gap-2">
              <Shield className="w-5 h-5 text-warm-gold" />
              <span>What Defined His Journey</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-warm-gold/10'}`}>
                <span className="font-semibold text-warm-gold block mb-1">Gentle Wisdom & Guidance</span>
                <p className="opacity-80">Known for his patience, thoughtful advice, and ability to make everyone feel listened to and valued.</p>
              </div>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-warm-gold/10'}`}>
                <span className="font-semibold text-warm-gold block mb-1">Unwavering Faith</span>
                <p className="opacity-80">Guided by strong principles and spiritual strength that anchored his church and family through every season.</p>
              </div>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-warm-gold/10'}`}>
                <span className="font-semibold text-warm-gold block mb-1">Devotion to Family</span>
                <p className="opacity-80">A constant source of warmth and support, serving as the patriarch and rally point for the entire Ajiboye family.</p>
              </div>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-warm-gold/10'}`}>
                <span className="font-semibold text-warm-gold block mb-1">Grassroots Community Service</span>
                <p className="opacity-80">His leadership extended into decades of selfless service to Aran-Orin development and church growth.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Info & Action Cards */}
        <div className="space-y-6">
          
          {/* Quick Life Facts */}
          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-warm-gold/20 shadow-xs'
          }`}>
            <h4 className="font-serif text-lg font-semibold mb-4 text-warm-gold">
              In Loving Memory
            </h4>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5">
                <span className="text-gray-400">Full Name</span>
                <span className="font-semibold text-right">{info.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5">
                <span className="text-gray-400">Born</span>
                <span className="font-semibold">{formatDate(info.birthDate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5">
                <span className="text-gray-400">Entered Rest</span>
                <span className="font-semibold">{formatDate(info.deathDate)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Age</span>
                <span className="font-semibold text-warm-gold">{getAgeText()}</span>
              </div>
            </div>
          </div>

          {/* Key Milestones Summary */}
          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-warm-gold/20 shadow-xs'
          }`}>
            <h4 className="font-serif text-lg font-semibold mb-4 text-warm-gold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-warm-gold" />
              <span>Life Highlights</span>
            </h4>

            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-warm-gold mt-1.5 shrink-0" />
                <span><strong>B.Sc Mass Communication</strong> — University of Lagos (1981) &amp; <strong>MBA</strong> — Adekunle Ajasin University (2001)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-warm-gold mt-1.5 shrink-0" />
                <span><strong>Distinguished Career at NTA</strong> — Rose to Chief Training Officer &amp; Manager Planning</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-warm-gold mt-1.5 shrink-0" />
                <span><strong>Church Leader</strong> — ECWA Church Aran-Orin (Lagos Branch) Chairman &amp; Akute Elder</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-warm-gold mt-1.5 shrink-0" />
                <span><strong>Community Titan</strong> — President Aran-Orin Students' Union &amp; Chairman Aran-Orin Progressive Union</span>
              </li>
            </ul>
          </div>

          {/* Navigation CTA Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-warm-gold to-yellow-600 text-white shadow-lg space-y-4">
            <Flame className="w-8 h-8 text-amber-200" />
            <h4 className="font-serif text-xl font-semibold leading-tight">
              Honour His Memory
            </h4>
            <p className="text-xs text-amber-100 font-light leading-relaxed">
              Share a treasured story, upload a photograph, or light a candle on his prayer wall.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={onAddTributeClick}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-warm-slate hover:bg-amber-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Write a Tribute</span>
              </button>

              <button
                onClick={() => onNavigate('prayer')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-amber-900/30 text-amber-100 hover:bg-amber-900/40 border border-amber-300/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Visit Prayer Wall</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

