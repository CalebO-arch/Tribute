import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Search, 
  Plus, 
  Copy, 
  Check, 
  Moon, 
  Sun, 
  Settings, 
  Flame, 
  Eye, 
  EyeOff, 
  Share2, 
  TrendingUp,
  AlertCircle,
  Trash
} from 'lucide-react';
import { doc, collection, onSnapshot, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, increment, query, orderBy, serverTimestamp } from 'firebase/firestore';

import { db } from './firebase';
import { DeceasedPersonInfo, Tribute, Candle, NavPage } from './types';
import MemorialHeader from './components/MemorialHeader';
import TributeCard from './components/TributeCard';
import AddTributeModal from './components/AddTributeModal';
import EditTributeModal from './components/EditTributeModal';
import CandleTray from './components/CandleTray';
import CustomizerPanel from './components/CustomizerPanel';
import EmptyState from './components/EmptyState';
import TopNavbar from './components/TopNavbar';
import StoryPage from './components/StoryPage';
import TributesPage from './components/TributesPage';
import GalleryPage from './components/GalleryPage';
import PrayerWallPage from './components/PrayerWallPage';

// Import our beautiful generated assets
import defaultBanner from './assets/images/memorial_banner_bg_1784300992708.jpg';
import defaultPortrait from './assets/images/memorial_portrait_placeholder_1784301007320.jpg';

// Helper to guarantee Firestore document payload size stays under 800KB (max Firestore limit is 1,048,576 bytes)
function fitMemorialPayloadWithinLimit(info: DeceasedPersonInfo, maxSizeBytes = 800000): DeceasedPersonInfo {
  const payload = { ...info };
  
  if (JSON.stringify(payload).length <= maxSizeBytes) {
    return payload;
  }

  // If size exceeds maxSizeBytes, prune base64 gallery items until payload fits
  const gallery = [...(payload.gallery || [])];
  while (JSON.stringify({ ...payload, gallery }).length > maxSizeBytes && gallery.length > 0) {
    const base64Index = gallery.findIndex(img => img.startsWith('data:image'));
    if (base64Index !== -1) {
      gallery.splice(base64Index, 1);
    } else {
      gallery.pop();
    }
  }

  payload.gallery = gallery;
  return payload;
}

export default function App() {
  // Detect if running in development workspace / dev server
  const isDevWorkspace = typeof window !== 'undefined' && (
    window.location.hostname.includes('ais-dev-') || 
    window.location.hostname.includes('localhost') || 
    window.location.hostname.includes('127.0.0.1')
  );

  // Theme and Admin state
  const [isDark, setIsDark] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(() => {
    try {
      const saved = localStorage.getItem('living_memorial_admin');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return isDevWorkspace;
  });

  const handleToggleAdminMode = (val: boolean) => {
    setIsAdminMode(val);
    try {
      localStorage.setItem('living_memorial_admin', JSON.stringify(val));
    } catch (e) {}
  };
  
  // Data State
  const [memorialInfo, setMemorialInfo] = useState<DeceasedPersonInfo | null>(null);
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState('All');

  // Navigation Page state
  const [activePage, setActivePage] = useState<NavPage>('home');

  // Modals state
  const [isTributeModalOpen, setIsTributeModalOpen] = useState(false);
  const [editingTribute, setEditingTribute] = useState<Tribute | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  
  // Interaction response state
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Listen or initialize Memorial Info from Firestore
  useEffect(() => {
    const infoDocRef = doc(db, 'memorial_info', 'main');
    
    const unsubscribe = onSnapshot(infoDocRef, async (snapshot) => {
      if (snapshot.exists()) {
        let cloudInfo = snapshot.data() as DeceasedPersonInfo;
        
        // Ensure the first line of the name is pure white (#ffffff)
        const currentName = cloudInfo.name || "Elder Joseph Folagboye\nOlugboyega Ajiboye";
        const nameWithNewline = currentName.includes('\n')
          ? currentName
          : (currentName.includes("Olugboyega")
              ? currentName.replace("Olugboyega", "\nOlugboyega")
              : currentName);

        const line1Length = nameWithNewline.includes('\n')
          ? nameWithNewline.indexOf('\n')
          : nameWithNewline.length;

        const updatedLetterColors: Record<number, string> = { ...(cloudInfo.letterColors || {}) };
        for (let i = 0; i < line1Length; i++) {
          updatedLetterColors[i] = '#ffffff';
        }

        // Auto-update cloud document if bio or name first-line color needs syncing
        const requestedBioHead = "BIOGRAPHY ELDER AJIBOYE";
        const needsBioUpdate = !cloudInfo.bio || !cloudInfo.bio.includes(requestedBioHead);
        const needsNameColorUpdate = cloudInfo.name !== nameWithNewline || JSON.stringify(cloudInfo.letterColors) !== JSON.stringify(updatedLetterColors);

        if (needsBioUpdate || needsNameColorUpdate) {
          cloudInfo = {
            ...cloudInfo,
            name: nameWithNewline,
            nameColor: cloudInfo.nameColor || '#D4AF37',
            letterColors: updatedLetterColors,
            bio: needsBioUpdate
              ? `BIOGRAPHY ELDER AJIBOYE\n\nElder Joseph Folagboye Olugboyega Oladosu, Olabanji Ajide Omo Ajiboye was born on 2nd January, 1948, to the family of Chief and Mrs. Oyinloye Ajiboye of the Olupo Compound, Aran-Odin, Irepodun LGA, Kwara State. Between 1957 and 1962, young Oluwagboyega attended Community Primary School, Aran-Orin. From 1965 to 1969, he was a student of Igbaja Teachers' College, Igbaja Irelodun LGA, Kwara State. He did his Higher School Programme at Ilesa Grammar School, Osun State from 1975 to 1977. From September 1977 to June 1981, Joseph read Mass Communication at the University of Lagos and obtained B.Sc Mass Comm. degree. Also from 1999 to 2001, Joseph attended Adekunle Ajasin University, Akungba Akoko, where he obtained MBA Master in Business Administration.\n\nMARRIAGE\nElder Joseph Fola Olugboyea Ajiboye got married to former Miss (Dr.) Lydia Moradejo Bola Fakayode on 22nd December, 1979. And the Marriage was blessed with Children.\n\nWORKING LIFE\nFrom 1970 to 1974, Elder Ajiboye worked as a Primary School Teacher ECWA prings school. After the completion of his B.Sc. Mass Comm. In 1981, Joseph did his NYSC with the Nigerian Television Authority (NTA) and was employed after the NYSC Programme. He rose along the ranks within years from P.R.O. to S.P.R.O, Principal P.R.O to Manager Planning Contender Planning and Chief Training Officer. He voluntarily retired from service on 2nd January, 2007.\n\nACTIVITIES\nYoung Joseph Gboyega Ajiboye was the President, Aran-Orin Students' Union 1978/1979; Vice President, Aran-Orin Progressive Union 2010 to 2015; Secretary, Aran-Orin Progressive Union, Lagos Branch 1982-2005; Vice President, Aran-Orin Progressive Union, Lagos Branch 2006-2016 and Chairman Aran-Orin Progressive Union, Lagos Branch, 2016 to date.\n\nRELIGION\nElder Joseph Ajiboye was baptized at ECWA Church Aran-Orin in 1962 by Rev. Ijagbemi. From 19666 and 1974, Young Joseph was the Choir Secretary at ECWA Church Aran-Orin. Also, as a student at Igbaja Teachers' College 1965-1967, Joseph was the Secretary to the Choir (ECWA Church Igbaja). From 1967 to 1969, Ajiboye was the acting Choir Master, ECWA Church, Igbaja.\n\nHe joined the ECWA Church, Mushin in 1982. By 1986, he moved to Ogba and joined ECWA Agege only to move to Akute in December, 2003 and joined ECWA Akute, where he served as an Elder from 2008 to 2014. From 1982 to 2000, Elder Ajiboye was the Secretary and Coordinator of ECWA Church, Aran-Orin, Lagos Branch. From 2001 to 2010, he was the Vice Chairman, ECWA Church, Aran-Orin, Lagos Branch, and from 2010 to date, Elder Ajiboye is the Chairman, ECWA Church Aran-Orin, Lagos Branch.\n\nAn Icon, Elder Ajiboye remains the pillar of Ajiboye family. He remains the rally point of everybody, both young and old. A socialite and a grass-root man to the core, Elder Ajiboye was the Secretary, Elite Club, Aran-Orin from 1984-1996. A man of many friends, Elder Ajiboye made so many friends within Aran-Orin, in schools he attended, in his working life or his places of residences, including the churches he has attended. He is still in close touch with at least twelve out of his secondary school classmates, the school he left in 1969.`
              : cloudInfo.bio
          };
          try {
            await setDoc(infoDocRef, cloudInfo, { merge: true });
          } catch (e) {
            console.warn("Could not sync updated info to Firestore:", e);
          }
        }

        setMemorialInfo(cloudInfo);
        // Sync local storage with official cloud data
        try {
          localStorage.setItem('local_memorial_info', JSON.stringify(cloudInfo));
        } catch (e) {
          console.warn("Could not write to localStorage:", e);
        }
        setLoading(false);
      } else {
        // Check if local storage has fallback data before seeding
        const savedLocalStr = localStorage.getItem('local_memorial_info');
        let initialInfo: DeceasedPersonInfo;

        const defaultAjiboyeInfo: DeceasedPersonInfo = {
          name: "Elder Joseph Folagboye Olugboyega Ajiboye",
          birthDate: "1948-01-02",
          deathDate: "2026-01-02",
          transitionToGlory: `Elder Joseph Folagboye Olugboyega Ajiboye transitioned peacefully to glory on 2nd January, 2026. A devout Christian leader, esteemed public servant, and community titan, he served as the Chairman of ECWA Church Aran-Orin (Lagos Branch) and Vice President of Aran-Orin Progressive Union.

He lived a life of unwavering faith, wisdom, and selfless service, serving as the beloved patriarch and rally point for the entire Ajiboye family, his church, and his community. We celebrate a triumph of faith and a life gloriously lived.`,
          quote: "An Icon and a pillar of strength — the rally point for family, church, and community.",
          bio: `BIOGRAPHY ELDER AJIBOYE

Elder Joseph Folagboye Olugboyega Oladosu, Olabanji Ajide Omo Ajiboye was born on 2nd January, 1948, to the family of Chief and Mrs. Oyinloye Ajiboye of the Olupo Compound, Aran-Odin, Irepodun LGA, Kwara State. Between 1957 and 1962, young Oluwagboyega attended Community Primary School, Aran-Orin. From 1965 to 1969, he was a student of Igbaja Teachers' College, Igbaja Irelodun LGA, Kwara State. He did his Higher School Programme at Ilesa Grammar School, Osun State from 1975 to 1977. From September 1977 to June 1981, Joseph read Mass Communication at the University of Lagos and obtained B.Sc Mass Comm. degree. Also from 1999 to 2001, Joseph attended Adekunle Ajasin University, Akungba Akoko, where he obtained MBA Master in Business Administration.

MARRIAGE
Elder Joseph Fola Olugboyea Ajiboye got married to former Miss (Dr.) Lydia Moradejo Bola Fakayode on 22nd December, 1979. And the Marriage was blessed with Children.

WORKING LIFE
From 1970 to 1974, Elder Ajiboye worked as a Primary School Teacher ECWA prings school. After the completion of his B.Sc. Mass Comm. In 1981, Joseph did his NYSC with the Nigerian Television Authority (NTA) and was employed after the NYSC Programme. He rose along the ranks within years from P.R.O. to S.P.R.O, Principal P.R.O to Manager Planning Contender Planning and Chief Training Officer. He voluntarily retired from service on 2nd January, 2007.

ACTIVITIES
Young Joseph Gboyega Ajiboye was the President, Aran-Orin Students' Union 1978/1979; Vice President, Aran-Orin Progressive Union 2010 to 2015; Secretary, Aran-Orin Progressive Union, Lagos Branch 1982-2005; Vice President, Aran-Orin Progressive Union, Lagos Branch 2006-2016 and Chairman Aran-Orin Progressive Union, Lagos Branch, 2016 to date.

RELIGION
Elder Joseph Ajiboye was baptized at ECWA Church Aran-Orin in 1962 by Rev. Ijagbemi. From 19666 and 1974, Young Joseph was the Choir Secretary at ECWA Church Aran-Orin. Also, as a student at Igbaja Teachers' College 1965-1967, Joseph was the Secretary to the Choir (ECWA Church Igbaja). From 1967 to 1969, Ajiboye was the acting Choir Master, ECWA Church, Igbaja.

He joined the ECWA Church, Mushin in 1982. By 1986, he moved to Ogba and joined ECWA Agege only to move to Akute in December, 2003 and joined ECWA Akute, where he served as an Elder from 2008 to 2014. From 1982 to 2000, Elder Ajiboye was the Secretary and Coordinator of ECWA Church, Aran-Orin, Lagos Branch. From 2001 to 2010, he was the Vice Chairman, ECWA Church, Aran-Orin, Lagos Branch, and from 2010 to date, Elder Ajiboye is the Chairman, ECWA Church Aran-Orin, Lagos Branch.

An Icon, Elder Ajiboye remains the pillar of Ajiboye family. He remains the rally point of everybody, both young and old. A socialite and a grass-root man to the core, Elder Ajiboye was the Secretary, Elite Club, Aran-Orin from 1984-1996. A man of many friends, Elder Ajiboye made so many friends within Aran-Orin, in schools he attended, in his working life or his places of residences, including the churches he has attended. He is still in close touch with at least twelve out of his secondary school classmates, the school he left in 1969.`,
          profileImage: defaultPortrait,
          bannerImage: defaultBanner,
          gallery: [
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800"
          ]
        };

        if (savedLocalStr) {
          try {
            initialInfo = JSON.parse(savedLocalStr) as DeceasedPersonInfo;
          } catch (e) {
            initialInfo = defaultAjiboyeInfo;
          }
        } else {
          initialInfo = defaultAjiboyeInfo;
        }

        try {
          await setDoc(infoDocRef, initialInfo);
          setMemorialInfo(initialInfo);
        } catch (e) {
          console.error("Error seeding default memorial info:", e);
          setMemorialInfo(initialInfo);
        }
        setLoading(false);
      }
    }, (error) => {
      console.error("Error subscribing to memorial info snapshot:", error);
      // Fallback to local storage if Firestore subscription errors out
      const savedLocalStr = localStorage.getItem('local_memorial_info');
      if (savedLocalStr) {
        try {
          setMemorialInfo(JSON.parse(savedLocalStr));
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen to Tributes collection in Real Time
  useEffect(() => {
    const tributesQuery = query(collection(db, 'tributes'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(tributesQuery, (snapshot) => {
      const fetchedTributes: Tribute[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const tributeMsg = data.text || data.message || '';
        fetchedTributes.push({
          id: docSnap.id,
          ...data,
          text: tributeMsg,
          message: tributeMsg
        } as Tribute);
      });
      setTributes(fetchedTributes);
    });

    return () => unsubscribe();
  }, []);

  // 3. Listen to Candles collection in Real Time
  useEffect(() => {
    const candlesQuery = query(collection(db, 'candles'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(candlesQuery, (snapshot) => {
      const fetchedCandles: Candle[] = [];
      snapshot.forEach((doc) => {
        fetchedCandles.push({
          id: doc.id,
          ...doc.data()
        } as Candle);
      });
      setCandles(fetchedCandles);
    });

    return () => unsubscribe();
  }, []);

  // Add new tribute to Firestore
  const handleAddTributeSubmit = async (tributeData: any) => {
    // Extract message content from either text or message
    const messageContent = (tributeData.text || tributeData.message || '').trim();

    // Sanitize payload: Firestore throws an error if any property has value `undefined`
    const cleanData: Record<string, any> = {
      name: tributeData.name ? String(tributeData.name).trim() : 'Anonymous',
      relationship: tributeData.relationship || 'Family',
      text: messageContent,
      message: messageContent,
      theme: tributeData.theme || 'slate',
      likes: 0,
      createdAt: serverTimestamp()
    };

    if (tributeData.location && typeof tributeData.location === 'string' && tributeData.location.trim()) {
      cleanData.location = tributeData.location.trim();
    }
    if (tributeData.category && typeof tributeData.category === 'string' && tributeData.category.trim()) {
      cleanData.category = tributeData.category.trim();
    }
    if (tributeData.fontStyle && typeof tributeData.fontStyle === 'string') {
      cleanData.fontStyle = tributeData.fontStyle;
    }
    if (tributeData.image && typeof tributeData.image === 'string' && tributeData.image.trim()) {
      cleanData.image = tributeData.image.trim();
    }
    if (tributeData.video && typeof tributeData.video === 'string' && tributeData.video.trim()) {
      cleanData.video = tributeData.video.trim();
    }
    if (tributeData.audioUrl && typeof tributeData.audioUrl === 'string') {
      cleanData.audioUrl = tributeData.audioUrl;
      cleanData.audioDuration = tributeData.audioDuration || 0;
    }
    if (typeof tributeData.isPinned === 'boolean') {
      cleanData.isPinned = tributeData.isPinned;
    }

    try {
      await addDoc(collection(db, 'tributes'), cleanData);
    } catch (e: any) {
      console.error("Error adding tribute to Firestore:", e);
      const specificError = e?.message || e?.code || "Unknown error";
      throw new Error(`Could not save tribute: ${specificError}`);
    }
  };

  // Update existing tribute in Firestore (Creator Mode)
  const handleUpdateTribute = async (tributeId: string, updatedData: Partial<Tribute>) => {
    try {
      const tributeMsg = (updatedData.text || (updatedData as any).message || '').trim();
      const cleanUpdate: Record<string, any> = {
        ...updatedData
      };
      if (tributeMsg) {
        cleanUpdate.text = tributeMsg;
        cleanUpdate.message = tributeMsg;
      }
      const docRef = doc(db, 'tributes', tributeId);
      await updateDoc(docRef, cleanUpdate);
    } catch (e) {
      console.error("Error updating tribute:", e);
      throw new Error("Could not update tribute. Please try again.");
    }
  };

  // Delete tribute from Firestore (Creator Mode)
  const handleDeleteTribute = async (tributeId: string) => {
    try {
      const docRef = doc(db, 'tributes', tributeId);
      await deleteDoc(docRef);
    } catch (e) {
      console.error("Error deleting tribute:", e);
      throw new Error("Could not delete tribute. Please try again.");
    }
  };

  // Reset / Delete ALL tributes from Firestore
  const handleResetAllTributes = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'tributes'));
      const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(doc(db, 'tributes', docSnap.id)));
      await Promise.all(deletePromises);
      setTributes([]);
      // Clear local liked status items
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('liked_tribute_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (err) {
        console.warn("Could not clear localStorage liked keys:", err);
      }
    } catch (e) {
      console.error("Error resetting all tributes:", e);
      throw new Error("Could not reset tributes. Please try again.");
    }
  };

  // Reset / Delete ALL candles from Firestore
  const handleResetAllCandles = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'candles'));
      const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(doc(db, 'candles', docSnap.id)));
      await Promise.all(deletePromises);
      setCandles([]);
    } catch (e) {
      console.error("Error resetting all candles:", e);
      throw new Error("Could not reset candles. Please try again.");
    }
  };

  // Light a candle in Firestore
  const handleLightCandleSubmit = async (name: string, message: string) => {
    try {
      await addDoc(collection(db, 'candles'), {
        name,
        message,
        createdAt: serverTimestamp(),
        color: ['gold', 'rose', 'amber'][Math.floor(Math.random() * 3)]
      });
    } catch (e) {
      console.error("Error lighting candle:", e);
      throw new Error("Could not light candle.");
    }
  };

  // Save customized info to Firestore and Local Storage
  const handleSaveMemorialInfo = async (updatedInfo: DeceasedPersonInfo) => {
    // Instantly update app state
    setMemorialInfo(updatedInfo);

    // Persist in localStorage as reliable cache
    try {
      localStorage.setItem('local_memorial_info', JSON.stringify(updatedInfo));
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }

    // Prepare payload guaranteed to stay safely under Firestore 1MB document limit
    const safePayload = fitMemorialPayloadWithinLimit(updatedInfo, 800000);

    try {
      // Save to cloud Firestore
      await setDoc(doc(db, 'memorial_info', 'main'), safePayload);
    } catch (e) {
      console.error("Error updating memorial info in Firestore:", e);
      // Fallback rescue if Firestore still throws an error
      try {
        const emergencyPayload = fitMemorialPayloadWithinLimit(updatedInfo, 500000);
        await setDoc(doc(db, 'memorial_info', 'main'), emergencyPayload);
      } catch (retryErr) {
        console.error("Emergency save fallback failed:", retryErr);
      }
    }
  };

  // Increment individual tribute like counter
  const handleLikeTribute = async (id: string) => {
    // Check if liked in this session
    const storageKey = `liked_tribute_${id}`;
    if (localStorage.getItem(storageKey)) {
      return; // Already liked
    }

    try {
      localStorage.setItem(storageKey, 'true');
      const tributeDocRef = doc(db, 'tributes', id);
      await updateDoc(tributeDocRef, {
        likes: increment(1)
      });
    } catch (e) {
      console.error("Error liking tribute:", e);
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filter & Search logic
  const filteredTributes = tributes.filter((trib) => {
    const textContent = (trib.text || trib.message || '').toLowerCase();
    const nameContent = (trib.name || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = nameContent.includes(query) || textContent.includes(query);
    
    const matchesRelationship = 
      selectedRelationship === 'All' || 
      trib.relationship === selectedRelationship;
    
    return matchesSearch && matchesRelationship;
  });

  // Calculate statistics
  const totalTributes = tributes.length;
  const totalCandles = candles.length;
  const totalHearts = tributes.reduce((sum, trib) => sum + (trib.likes || 0), 0);

  const relationshipsList = ['All', 'Wife', 'Son', 'Daughter', 'Son in-law', 'Daughter in-law', 'Grandchild', 'Family', 'Friend', 'Other'];

  if (loading || !memorialInfo) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${isDark ? 'bg-memorial text-gray-200' : 'bg-[#faf7f2] text-warm-slate'}`}>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-warm-gold/20 border-t-warm-gold rounded-full animate-spin" />
          <Flame className="w-6 h-6 text-warm-gold absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="mt-4 font-serif text-sm font-medium tracking-wide">
          Entering sacred memory space...
        </p>
      </div>
    );
  }

  return (
    <div id="tribute-app" className={`min-h-screen transition-colors duration-300 relative ${isDark ? 'bg-memorial text-gray-200' : 'bg-[#faf7f2] text-warm-slate'}`}>
      
      {/* Sophisticated Dark Ambient Glows */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-900/10 rounded-full blur-[120px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900/10 rounded-full blur-[120px] -ml-32 -mb-32" />
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-yellow-900/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-900/5 rounded-full blur-[150px]" />
        </div>
      )}
      
      {/* Top Navigation Bar with Menu Icon Dropdown */}
      <TopNavbar 
        activePage={activePage}
        onNavigate={setActivePage}
        isDark={isDark}
        setIsDark={setIsDark}
        isDevWorkspace={isDevWorkspace}
        isAdminMode={isAdminMode}
        setIsAdminMode={handleToggleAdminMode}
        handleCopyLink={handleCopyLink}
        copiedLink={copiedLink}
      />

      {/* Creator Mode Banner Warning */}
      <AnimatePresence>
        {isAdminMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-b border-amber-500/20 text-center py-2.5 px-4 text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5 relative z-30"
          >
            <Settings className="w-4 h-4 animate-spin-slow" />
            <span>Creator Setup Mode active. Click the <strong>Customize Memorial</strong> button on the banner to change dates, profile pictures, and biography.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Routing Views */}
      {activePage === 'home' && (
        <>
          {/* Memorial Header with Quote, Bio, and Statistics */}
          <MemorialHeader 
            info={memorialInfo} 
            stats={{ tributesCount: totalTributes, candlesCount: totalCandles, heartsCount: totalHearts }}
            isAdmin={isAdminMode}
            onEditClick={() => setIsCustomizerOpen(true)}
            isDark={isDark}
          />

          {/* Main Content Area */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Virtual Candle Tray */}
            <CandleTray 
              onAddTributeClick={() => setIsTributeModalOpen(true)} 
              isDark={isDark} 
              tributesCount={totalTributes}
            />

            {/* Memorial Wall / Testimonials list */}
            <div className="border-t border-black/5 dark:border-white/5 pt-10">
              
              {/* Wall header and filters section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
                    The Memorial Wall
                  </h2>
                  <p className={`text-xs sm:text-sm font-light mt-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    A collection of beautiful memories, stories, and blessings shared by friends and family.
                  </p>
                </div>

                {/* Write a tribute and filter toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search memories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-9 pr-4 py-2 rounded-full border outline-hidden text-xs transition-all w-full sm:w-48 ${
                        isDark 
                          ? 'bg-white/5 border-white/10 focus:border-warm-gold focus:w-56' 
                          : 'bg-white border-warm-gold/15 focus:border-warm-gold focus:w-56'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Relationship Categories Pill filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
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

              {/* Masonry Layout Grid */}
              {filteredTributes.length === 0 ? (
                <EmptyState 
                  isFiltering={searchQuery.trim().length > 0 || selectedRelationship !== 'All'} 
                  onAddClick={() => setIsTributeModalOpen(true)}
                  isDark={isDark}
                />
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
                  <AnimatePresence mode="popLayout">
                    {filteredTributes.map((tribute) => (
                      <TributeCard 
                        key={tribute.id} 
                        tribute={tribute} 
                        onLike={handleLikeTribute} 
                        isDark={isDark} 
                        isAdmin={isAdminMode}
                        onEdit={(tribute) => setEditingTribute(tribute)}
                        onDelete={handleDeleteTribute}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

            </div>
          </main>
        </>
      )}

      {/* His Story Page */}
      {activePage === 'story' && (
        <StoryPage 
          info={memorialInfo}
          isDark={isDark}
          isAdmin={isAdminMode}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          onNavigate={setActivePage}
          onAddTributeClick={() => setIsTributeModalOpen(true)}
        />
      )}

      {/* Tributes & Memories Page */}
      {activePage === 'tributes' && (
        <TributesPage 
          tributes={tributes}
          info={memorialInfo}
          isDark={isDark}
          isAdmin={isAdminMode}
          onNavigate={setActivePage}
          onAddTributeClick={() => setIsTributeModalOpen(true)}
          onLikeTribute={handleLikeTribute}
          onEditTribute={(tribute) => setEditingTribute(tribute)}
          onDeleteTribute={handleDeleteTribute}
        />
      )}

      {/* Gallery Page */}
      {activePage === 'gallery' && (
        <GalleryPage 
          info={memorialInfo}
          tributes={tributes}
          isDark={isDark}
          onNavigate={setActivePage}
          onAddTributeClick={() => setIsTributeModalOpen(true)}
        />
      )}

      {/* Prayer Wall Page */}
      {activePage === 'prayer' && (
        <PrayerWallPage 
          info={memorialInfo}
          isDark={isDark}
          onNavigate={setActivePage}
        />
      )}

      {/* Sincere Memorial Footer */}
      <footer className={`border-t py-12 mt-12 text-center text-xs relative z-10 ${isDark ? 'bg-memorial/50 border-white/5 text-gray-500' : 'bg-warm-cream/40 border-warm-gold/10 text-gray-500'}`}>
        <div className="max-w-6xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-1.5 opacity-60">
            <Flame className="w-4 h-4 text-warm-gold" />
            <span className="font-serif tracking-wider uppercase text-[10px] font-bold">Living Memory Book</span>
          </div>
          <p className="font-light">
            In loving remembrance of {memorialInfo.name}. Celebrating a beautiful life that will never be forgotten.
          </p>
          <p className="text-[10px] opacity-60">
            Shared with love by family, friends, and the people whose lives they touched.
          </p>
        </div>
      </footer>

      {/* Add Tribute Modal */}
      <AddTributeModal 
        isOpen={isTributeModalOpen} 
        onClose={() => setIsTributeModalOpen(false)} 
        onSubmit={handleAddTributeSubmit} 
        isDark={isDark} 
      />

      {/* Edit Tribute Modal (Creator/Admin Mode) */}
      <EditTributeModal
        tribute={editingTribute}
        isOpen={!!editingTribute}
        onClose={() => setEditingTribute(null)}
        onUpdate={handleUpdateTribute}
        onDelete={handleDeleteTribute}
        isDark={isDark}
      />

      {/* Customize Memorial Panel (Admin/Creator only) */}
      <CustomizerPanel 
        isOpen={isCustomizerOpen} 
        onClose={() => setIsCustomizerOpen(false)} 
        info={memorialInfo} 
        onSave={handleSaveMemorialInfo} 
        onResetAllCandles={handleResetAllCandles}
        isDark={isDark} 
        defaultBanner={defaultBanner}
        defaultPortrait={defaultPortrait}
      />

    </div>
  );
}
