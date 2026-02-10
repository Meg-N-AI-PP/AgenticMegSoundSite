export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  imageUrl: string;
  audioUrl: string;
  color: string;
  tags?: string[];        // From Supabase
  play_count?: number;    // From Supabase
}

// Draft music data with anime-themed placeholder images from picsum/placeholder services
// In Phase 3 these will be loaded from a vector database
const allTracks: MusicTrack[] = [
  {
    id: '1',
    title: 'Neon Dreams',
    artist: 'Agentic Beats',
    genre: 'Synthwave',
    duration: '3:42',
    imageUrl: 'https://picsum.photos/seed/neon1/400/400',
    audioUrl: '',
    color: '#00e5ff',
  },
  {
    id: '2',
    title: 'Digital Horizon',
    artist: 'Cyber Pulse',
    genre: 'Electronic',
    duration: '4:15',
    imageUrl: 'https://picsum.photos/seed/digital2/400/400',
    audioUrl: '',
    color: '#7c3aed',
  },
  {
    id: '3',
    title: 'Midnight Protocol',
    artist: 'Ghost Signal',
    genre: 'Ambient',
    duration: '5:08',
    imageUrl: 'https://picsum.photos/seed/midnight3/400/400',
    audioUrl: '',
    color: '#ff6b35',
  },
  {
    id: '4',
    title: 'Neural Cascade',
    artist: 'Deep Circuit',
    genre: 'Techno',
    duration: '3:55',
    imageUrl: 'https://picsum.photos/seed/neural4/400/400',
    audioUrl: '',
    color: '#00e676',
  },
  {
    id: '5',
    title: 'Sakura Rain',
    artist: 'Miku Waves',
    genre: 'Lo-fi',
    duration: '4:30',
    imageUrl: 'https://picsum.photos/seed/sakura5/400/400',
    audioUrl: '',
    color: '#ff69b4',
  },
  {
    id: '6',
    title: 'Void Walker',
    artist: 'Binary Shade',
    genre: 'Dark Synth',
    duration: '3:18',
    imageUrl: 'https://picsum.photos/seed/void6/400/400',
    audioUrl: '',
    color: '#8b5cf6',
  },
  {
    id: '7',
    title: 'Electric Garden',
    artist: 'Pixel Flora',
    genre: 'Chillstep',
    duration: '4:52',
    imageUrl: 'https://picsum.photos/seed/garden7/400/400',
    audioUrl: '',
    color: '#10b981',
  },
  {
    id: '8',
    title: 'Starlight Express',
    artist: 'Cosmo Drift',
    genre: 'Future Bass',
    duration: '3:38',
    imageUrl: 'https://picsum.photos/seed/star8/400/400',
    audioUrl: '',
    color: '#f59e0b',
  },
  {
    id: '9',
    title: 'Crystal Memory',
    artist: 'Echo Glass',
    genre: 'Dream Pop',
    duration: '5:22',
    imageUrl: 'https://picsum.photos/seed/crystal9/400/400',
    audioUrl: '',
    color: '#06b6d4',
  },
  {
    id: '10',
    title: 'Phantom Code',
    artist: 'Hex Runner',
    genre: 'Cyberpunk',
    duration: '4:05',
    imageUrl: 'https://picsum.photos/seed/phantom10/400/400',
    audioUrl: '',
    color: '#ef4444',
  },
  {
    id: '11',
    title: 'Ocean of Data',
    artist: 'Wave Function',
    genre: 'Trance',
    duration: '6:10',
    imageUrl: 'https://picsum.photos/seed/ocean11/400/400',
    audioUrl: '',
    color: '#3b82f6',
  },
  {
    id: '12',
    title: 'Firefly Network',
    artist: 'Lumina AI',
    genre: 'Electronica',
    duration: '3:48',
    imageUrl: 'https://picsum.photos/seed/firefly12/400/400',
    audioUrl: '',
    color: '#eab308',
  },
  {
    id: '13',
    title: 'Silent Algorithm',
    artist: 'Zero Noise',
    genre: 'Minimal',
    duration: '4:42',
    imageUrl: 'https://picsum.photos/seed/algo13/400/400',
    audioUrl: '',
    color: '#64748b',
  },
  {
    id: '14',
    title: 'Astral Projection',
    artist: 'Nebula Drive',
    genre: 'Psytrance',
    duration: '7:15',
    imageUrl: 'https://picsum.photos/seed/astral14/400/400',
    audioUrl: '',
    color: '#a855f7',
  },
  {
    id: '15',
    title: 'Ruby Storm',
    artist: 'Crimson Beat',
    genre: 'Drum & Bass',
    duration: '4:20',
    imageUrl: 'https://picsum.photos/seed/ruby15/400/400',
    audioUrl: '',
    color: '#dc2626',
  },
  {
    id: '16',
    title: 'Frost Byte',
    artist: 'Arctic Pulse',
    genre: 'Ambient',
    duration: '5:55',
    imageUrl: 'https://picsum.photos/seed/frost16/400/400',
    audioUrl: '',
    color: '#22d3ee',
  },
  {
    id: '17',
    title: 'Solar Flare',
    artist: 'Helio Beat',
    genre: 'House',
    duration: '3:30',
    imageUrl: 'https://picsum.photos/seed/solar17/400/400',
    audioUrl: '',
    color: '#f97316',
  },
  {
    id: '18',
    title: 'Quantum Leap',
    artist: 'Particle Groove',
    genre: 'Progressive',
    duration: '6:42',
    imageUrl: 'https://picsum.photos/seed/quantum18/400/400',
    audioUrl: '',
    color: '#14b8a6',
  },
  {
    id: '19',
    title: 'Twilight Sync',
    artist: 'Dusk Module',
    genre: 'Downtempo',
    duration: '4:58',
    imageUrl: 'https://picsum.photos/seed/twilight19/400/400',
    audioUrl: '',
    color: '#6366f1',
  },
  {
    id: '20',
    title: 'Emerald Circuit',
    artist: 'Jade Machine',
    genre: 'Tech House',
    duration: '5:15',
    imageUrl: 'https://picsum.photos/seed/emerald20/400/400',
    audioUrl: '',
    color: '#059669',
  },
];

/**
 * Returns a shuffled subset of tracks
 */
export function getRandomTracks(count: number = 8): MusicTrack[] {
  const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Returns all tracks (for future use)
 */
export function getAllTracks(): MusicTrack[] {
  return allTracks;
}

/**
 * Random animation presets for cards
 */
export const cardAnimations = [
  'float-up',
  'float-down',
  'sway-left',
  'sway-right',
  'pulse-glow',
  'tilt-rock',
  'drift-diagonal',
  'bounce-soft',
] as const;

export type CardAnimation = typeof cardAnimations[number];

export function getRandomAnimation(): CardAnimation {
  return cardAnimations[Math.floor(Math.random() * cardAnimations.length)];
}
