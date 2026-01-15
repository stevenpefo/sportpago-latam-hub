import React from 'react';
import { 
  Dumbbell, 
  Trophy, 
  Bike, 
  Waves, 
  Heart,
  Music,
  Target,
  Flame,
  PersonStanding,
  CircleDot,
  Swords,
  Medal
} from 'lucide-react';

// Sport emoji and icon mapping
export const SPORT_ICONS: Record<string, { emoji: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Fútbol': { emoji: '⚽', icon: Trophy },
  'Fútbol de Salón': { emoji: '⚽', icon: Trophy },
  'Baloncesto': { emoji: '🏀', icon: Target },
  'Tenis': { emoji: '🎾', icon: Target },
  'Natación': { emoji: '🏊', icon: Waves },
  'Boxeo': { emoji: '🥊', icon: Swords },
  'Artes Marciales': { emoji: '🥋', icon: Swords },
  'GYM / Fitness': { emoji: '💪', icon: Dumbbell },
  'Ciclismo': { emoji: '🚴', icon: Bike },
  'Atletismo': { emoji: '🏃', icon: PersonStanding },
  'Voleibol': { emoji: '🏐', icon: Target },
  'Gimnasia': { emoji: '🤸', icon: Medal },
  'CrossFit': { emoji: '🏋️', icon: Flame },
  'Yoga': { emoji: '🧘', icon: Heart },
  'Pilates': { emoji: '🧘', icon: Heart },
  'Danza': { emoji: '💃', icon: Music },
  'Otros': { emoji: '🏅', icon: Medal },
};

// Default icon for custom sports
const DEFAULT_SPORT = { emoji: '🏅', icon: Medal };

export function getSportIcon(sport: string): { emoji: string; icon: React.ComponentType<{ className?: string }> } {
  return SPORT_ICONS[sport] || DEFAULT_SPORT;
}

interface SportIconDisplayProps {
  sport: string;
  showText?: boolean;
  className?: string;
  iconClassName?: string;
}

export function SportIconDisplay({ sport, showText = true, className = '', iconClassName = 'h-4 w-4' }: SportIconDisplayProps) {
  const { emoji } = getSportIcon(sport);
  
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="text-base">{emoji}</span>
      {showText && <span>{sport}</span>}
    </span>
  );
}
