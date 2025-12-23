
export interface PresentStats {
  hp: number;
  romance: number;
  joy: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical';
  catchphrase: string;
}

export interface Present {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  createdAt: number;
  overlayColor: string;
  stats?: PresentStats;
}

export enum OverlayType {
  SILVER = '#b0b0b0',
  GOLD = '#d4af37',
  ROSE = '#ff4d6d',
  HEART = '#c9184a'
}
