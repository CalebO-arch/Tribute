export interface DeceasedPersonInfo {
  name: string;
  birthDate: string;
  deathDate: string;
  transitionToGlory?: string;
  bio: string;
  quote: string;
  profileImage: string;
  bannerImage: string;
  gallery?: string[];
  videos?: string[];
  nameColor?: string;
  letterColors?: Record<number, string>;
}

export interface Tribute {
  id: string;
  name: string;
  relationship: string;
  text: string;
  message?: string;
  image?: string;
  video?: string;
  location?: string;
  category?: string;
  fontStyle?: string;
  audioUrl?: string;
  audioDuration?: number;
  isPinned?: boolean;
  createdAt: any; // Firestore Timestamp or ISO string
  likes: number;
  theme: 'amber' | 'rose' | 'lavender' | 'slate' | 'gold';
  isCandle?: boolean;
}

export interface Candle {
  id: string;
  name: string;
  message: string;
  createdAt: any;
  color: string;
}

export interface Prayer {
  id: string;
  authorName: string;
  prayerText: string;
  verseOrBlessing?: string;
  createdAt: any;
  likes?: number;
  candleLit?: boolean;
}

export type NavPage = 'home' | 'story' | 'tributes' | 'gallery' | 'prayer';
