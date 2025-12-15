

import { UserProfile, UserRole, SkillCategory, RequestPost, CallLog, MarketplaceItem, Purchase, Review } from './types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'u1',
    name: 'Kenji Tanaka',
    age: 72,
    role: UserRole.BOOMER,
    location: 'Kyoto, Japan',
    avatar: 'https://picsum.photos/200/200?random=1',
    offers: [SkillCategory.LANGUAGE, SkillCategory.CULTURE, SkillCategory.COOKING],
    needs: [SkillCategory.TECH],
    bio: 'Retired history teacher. I love sharing stories about old Kyoto and making Soba. Need help with my new smartphone.',
    isPremium: true
  },
  {
    id: 'u2',
    name: 'Sarah Jenkins',
    age: 22,
    role: UserRole.GEN_Z,
    location: 'Austin, USA',
    avatar: 'https://picsum.photos/200/200?random=2',
    offers: [SkillCategory.TECH, SkillCategory.CAREER],
    needs: [SkillCategory.COOKING, SkillCategory.LANGUAGE],
    bio: 'CS Student. I can fix any computer issue! Looking to learn authentic Japanese cooking.',
    isPremium: false
  },
  {
    id: 'u3',
    name: 'Maria Rossi',
    age: 65,
    role: UserRole.BOOMER,
    location: 'Rome, Italy',
    avatar: 'https://picsum.photos/200/200?random=3',
    offers: [SkillCategory.COOKING, SkillCategory.RELIGION, SkillCategory.COUNSELING],
    needs: [SkillCategory.TECH, SkillCategory.LANGUAGE],
    bio: 'Grandmother of 4. I make the best Lasagna. Want to learn English to speak with my grandkids in London.',
    isPremium: false
  },
  {
    id: 'u4',
    name: 'David Chen',
    age: 19,
    role: UserRole.GEN_Z,
    location: 'Toronto, Canada',
    avatar: 'https://picsum.photos/200/200?random=4',
    offers: [SkillCategory.TECH, SkillCategory.LANGUAGE],
    needs: [SkillCategory.CULTURE, SkillCategory.LIFE],
    bio: 'Aspiring travel vlogger. Tech savvy. Want to learn about traditional Chinese festivals.',
    isPremium: true
  }
];

export const MOCK_REQUESTS: RequestPost[] = [
  {
    id: 'r1',
    userId: 'u1',
    category: SkillCategory.TECH,
    title: 'Help setting up Zoom on iPad',
    description: 'I want to call my daughter but I cannot figure out the account settings.',
    exchangeOffer: 'I can teach you basic Japanese phrases.',
    createdAt: '2 hours ago'
  },
  {
    id: 'r2',
    userId: 'u3',
    category: SkillCategory.LANGUAGE,
    title: 'Conversational English Practice',
    description: 'Looking for someone patient to practice basic English conversation.',
    exchangeOffer: 'I will share my family secret pasta sauce recipe.',
    createdAt: '5 hours ago'
  },
  {
    id: 'r3',
    userId: 'u2',
    category: SkillCategory.COOKING,
    title: 'Authentic Miso Soup',
    description: 'Grocery store packets are boring. Teach me the real deal!',
    exchangeOffer: 'I can optimize your PC or help with social media.',
    createdAt: '1 day ago'
  },
  {
    id: 'r4',
    userId: 'u4',
    category: SkillCategory.COUNSELING,
    title: 'Need a listening ear',
    description: 'Feeling overwhelmed with college applications. Looking for general life advice and counseling from someone experienced.',
    exchangeOffer: 'I can teach you how to use TikTok or Instagram.',
    createdAt: '30 minutes ago'
  }
];

export const MOCK_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'i1',
    sellerId: 'u1',
    title: 'Hand-Carved Kokeshi Doll',
    description: 'Authentic vintage wooden doll from the 1980s. Signed by the artisan in Naruko. A beautiful piece of traditional Japanese folk art.',
    price: 45,
    images: [
        'https://images.unsplash.com/photo-1543166548-c89b7b719463?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1616789069699-2a93910c64d4?auto=format&fit=crop&q=80&w=400'
    ],
    category: 'Vintage',
    condition: 'Used - Good',
    likes: 12,
    isSold: false,
    createdAt: '2 days ago'
  },
  {
    id: 'i2',
    sellerId: 'u3',
    title: 'Nonna\'s Hand-Knit Wool Scarf',
    description: 'Made with premium merino wool. Warm, soft, and durable. Perfect for winter. Color: Burgundy.',
    price: 35,
    images: [
        'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1606296763486-42d87e029c78?auto=format&fit=crop&q=80&w=400'
    ],
    category: 'Handmade',
    condition: 'New',
    likes: 28,
    isSold: false,
    createdAt: '1 day ago'
  },
  {
    id: 'i3',
    sellerId: 'u4',
    title: 'Wireless Noise Cancelling Headphones',
    description: 'Barely used. Great sound quality. I upgraded to a newer model so I don\'t need these anymore.',
    price: 80,
    images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400'
    ],
    category: 'Tech',
    condition: 'Used - Like New',
    likes: 5,
    isSold: true,
    createdAt: '5 hours ago'
  },
  {
    id: 'i4',
    sellerId: 'u1',
    title: 'Ceramic Tea Set (Matcha Bowl)',
    description: 'Hand-thrown pottery bowl for tea ceremonies. Glazed with a traditional shino glaze.',
    price: 55,
    images: [
        'https://images.unsplash.com/photo-1536638421372-c6c748281358?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1628264567215-442875b22986?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1616365922378-d56b063e0018?auto=format&fit=crop&q=80&w=400'
    ],
    category: 'Home',
    condition: 'New',
    likes: 19,
    isSold: false,
    createdAt: '3 days ago'
  },
  {
    id: 'i5',
    sellerId: 'u2',
    title: 'Custom Digital Pet Portrait',
    description: 'I will draw your cat or dog in a cute cartoon style! Digital delivery within 48 hours.',
    price: 25,
    images: [
        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?auto=format&fit=crop&q=80&w=400'
    ],
    category: 'Art',
    condition: 'New',
    likes: 42,
    isSold: false,
    createdAt: '1 week ago'
  },
  {
    id: 'i6',
    sellerId: 'u3',
    title: 'Vintage 35mm Film Camera',
    description: 'Classic SLR camera. Fully mechanical. Includes 50mm lens. Great condition for its age.',
    price: 150,
    images: [
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&q=80&w=400'
    ],
    category: 'Vintage',
    condition: 'Used - Fair',
    likes: 67,
    isSold: false,
    createdAt: '12 hours ago'
  }
];

export const MOCK_PURCHASES: Purchase[] = [
  {
    id: 'p1',
    itemId: 'i99',
    sellerId: 'u3',
    title: 'Handmade Pasta Maker',
    price: 40,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=400',
    purchaseDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    paymentMethod: 'Credit Card ending in 4242'
  },
  {
    id: 'p2',
    itemId: 'i98',
    sellerId: 'u4',
    title: 'Vintage Vinyl Records (Jazz)',
    price: 65,
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400',
    purchaseDate: new Date(Date.now() - 86400000 * 20).toISOString(), // 20 days ago
    paymentMethod: 'PayPal'
  }
];

export const MOCK_CALL_LOGS: CallLog[] = [
  {
    id: 'c1',
    participantId: 'u1',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    duration: '15:30',
    type: 'video',
    status: 'completed',
    direction: 'outgoing'
  },
  {
    id: 'c2',
    participantId: 'u1',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    duration: '00:00',
    type: 'video',
    status: 'missed',
    direction: 'incoming'
  },
  {
    id: 'c3',
    participantId: 'u2',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    duration: '45:12',
    type: 'video',
    status: 'completed',
    direction: 'incoming'
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev1',
    sellerId: 'u3',
    authorId: 'u2',
    itemId: 'i99',
    rating: 5,
    comment: 'The pasta maker works perfectly! Maria even sent a recipe card along with it. Amazing seller.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'rev2',
    sellerId: 'u1',
    authorId: 'u4',
    itemId: 'i1',
    rating: 5,
    comment: 'Beautiful craftsmanship. It looks exactly like the photos.',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'rev3',
    sellerId: 'u3',
    authorId: 'u1',
    itemId: 'i2',
    rating: 4,
    comment: 'Very warm scarf, but the color was slightly darker than I expected. Still love it though!',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  }
];