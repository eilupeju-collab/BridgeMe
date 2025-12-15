

export enum UserRole {
  GEN_Z = 'Gen Z',
  MILLENNIAL = 'Millennial',
  GEN_X = 'Gen X',
  BOOMER = 'Boomer',
  SILENT = 'Silent Gen'
}

export enum SkillCategory {
  TECH = 'Tech Support',
  LANGUAGE = 'Language',
  COOKING = 'Cooking',
  CULTURE = 'Cultural Advice',
  RELIGION = 'Religion',
  CAREER = 'Career Advice',
  LIFE = 'Life Skills',
  COUNSELING = 'General Counseling'
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  role: UserRole;
  location: string;
  avatar: string;
  offers: SkillCategory[];
  needs: SkillCategory[];
  bio: string;
  isPremium?: boolean;
}

export interface RequestPost {
  id: string;
  userId: string;
  category: SkillCategory;
  title: string;
  description: string;
  exchangeOffer: string;
  createdAt: string;
}

export type ItemCondition = 'New' | 'Used - Like New' | 'Used - Good' | 'Used - Fair';

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  videoUrl?: string;
  category: 'Handmade' | 'Vintage' | 'Tech' | 'Art' | 'Home' | 'Other';
  condition: ItemCondition;
  likes: number;
  isSold?: boolean;
  createdAt: string;
}

export interface Purchase {
  id: string;
  itemId: string;
  sellerId: string;
  title: string;
  price: number;
  image: string;
  purchaseDate: string;
  paymentMethod?: string;
}

export interface Review {
  id: string;
  sellerId: string;
  authorId: string;
  itemId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface ChatReaction {
  emoji: string;
  userId: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isTranslated?: boolean;
  isTranslating?: boolean;
  originalText?: string;
  reactions?: ChatReaction[];
  type?: 'text' | 'scheduled_call' | 'image' | 'audio' | 'call_log';
  callType?: 'video' | 'audio';
  scheduledTime?: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  replyTo?: {
    id: string;
    text: string;
    senderId: string;
  };
}

export interface CallLog {
  id: string;
  participantId: string;
  timestamp: string;
  duration: string;
  type: 'video' | 'audio';
  status: 'completed' | 'missed' | 'declined';
  direction: 'incoming' | 'outgoing';
  recordingUrl?: string;
}