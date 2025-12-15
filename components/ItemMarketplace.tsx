import React, { useState, useRef, useEffect } from 'react';
import { MOCK_MARKETPLACE_ITEMS, MOCK_USERS, MOCK_PURCHASES, MOCK_REVIEWS } from '../constants';
import { MarketplaceItem, Purchase, Review, ItemCondition, UserProfile } from '../types';
import { generateItemShowcaseVideo } from '../services/geminiService';

interface ItemMarketplaceProps {
  onChat: (userId: string) => void;
}

const CATEGORIES = ['All', 'Handmade', 'Vintage', 'Tech', 'Art', 'Home', 'Other'];
const CONDITIONS: ItemCondition[] = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'];

// Helper to highlight matching text in search results
const highlightText = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    try {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
        return parts.map((part, index) => 
            part.toLowerCase() === query.toLowerCase() ? 
                <mark key={index} className="bg-amber-200 text-slate-900 rounded-sm px-0.5 font-medium">{part}</mark> : 
                part
        );
    } catch (e) {
        return text;
    }
};

// Sub-component for individual Marketplace Card to handle internal carousel state
const MarketplaceItemCard: React.FC<{
    item: MarketplaceItem;
    seller: UserProfile;
    isLiked: boolean;
    isInCart: boolean;
    searchQuery: string;
    getConditionColor: (c: ItemCondition) => string;
    onView: (item: MarketplaceItem) => void;
    onToggleLike: (e: React.MouseEvent, itemId: string, isSold?: boolean) => void;
    onAddCart: (e: React.MouseEvent, item: MarketplaceItem) => void;
    onChat: (sellerId: string) => void;
    onReport: (e: React.MouseEvent, item: MarketplaceItem) => void;
    setViewingSellerId: (id: string) => void;
}> = ({ item, seller, isLiked, isInCart, searchQuery, getConditionColor, onView, onToggleLike, onAddCart, onChat, onReport, setViewingSellerId }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Reset carousel index when the item changes (essential for filtering/sorting)
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [item.id]);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev + 1) % item.images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev - 1 + item.images.length) % item.images.length);
    };

    return (
        <div 
            onClick={() => onView(item)}
            className={`group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer h-full ${item.isSold ? 'opacity-60 grayscale-[0.5]' : ''}`}
        >
            {/* Image Area */}
            <div className="aspect-square bg-slate-100 relative overflow-hidden group/image">
                <img 
                    src={item.images[currentImageIndex] || item.images[0]} 
                    alt={item.title} 
                    className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${item.isSold ? 'grayscale' : 'group-hover:scale-110'}`}
                />
                
                {/* Video Badge */}
                {item.videoUrl && (
                    <div className="absolute top-3 left-3 z-20 animate-pulse">
                         <span className="bg-slate-900/80 backdrop-blur-md text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/20">
                            <span>🎥</span> Veo Video
                         </span>
                    </div>
                )}
                
                {item.images.length > 1 && !item.isSold && (
                    <>
                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-sm hover:bg-white opacity-0 group-hover/image:opacity-100 transition z-10">
                            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-sm hover:bg-white opacity-0 group-hover/image:opacity-100 transition z-10">
                            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
                            {item.images.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                    className={`w-1.5 h-1.5 rounded-full shadow-sm cursor-pointer hover:scale-125 transition-all ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} 
                                />
                            ))}
                        </div>
                    </>
                )}

                {item.isSold && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[2px] z-10">
                        <span className="bg-white/90 text-slate-900 px-6 py-2 rounded-lg font-extrabold text-xl shadow-lg border-2 border-slate-900 transform -rotate-12 uppercase tracking-widest">
                            Sold
                        </span>
                    </div>
                )}
                
                <div className={`absolute top-3 ${item.videoUrl ? 'left-24' : 'left-3'} flex gap-2 z-10 pointer-events-none transition-all`}>
                    <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-slate-700 shadow-sm border border-white/50">
                        {item.category}
                    </span>
                    {item.condition && !item.isSold && (
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm border ${getConditionColor(item.condition)}`}>
                            {item.condition}
                        </span>
                    )}
                </div>
                
                {/* Like/Favorite Button */}
                <button 
                    onClick={(e) => onToggleLike(e, item.id, item.isSold)}
                    disabled={!!item.isSold}
                    title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
                    className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-200 group/like z-10 ${
                        item.isSold
                            ? 'bg-slate-200/50 text-slate-400 cursor-not-allowed'
                            : isLiked 
                                ? 'bg-red-50 text-white shadow-md' 
                                : 'bg-white/90 backdrop-blur-md text-slate-500 hover:text-red-500 hover:bg-white shadow-sm'
                    }`}
                >
                    <svg 
                        className={`w-4 h-4 transition-transform ${!item.isSold ? 'group-active/like:scale-75' : ''} ${isLiked ? 'fill-current' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className={`text-xs font-bold ${isLiked && !item.isSold ? 'text-white' : item.isSold ? 'text-slate-500' : 'text-slate-600 group-hover/like:text-red-500'}`}>
                        {item.likes}
                    </span>
                </button>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-3 mb-3">
                    <h3 className={`font-bold text-slate-900 leading-tight text-lg line-clamp-2 transition-colors ${!item.isSold ? 'group-hover:text-indigo-600' : ''}`}>
                        {highlightText(item.title, searchQuery)}
                    </h3>
                    <span className={`font-extrabold text-xl shrink-0 ${item.isSold ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>
                        ${item.price}
                    </span>
                </div>

                <div 
                    className="flex items-center gap-2 mb-4 group/seller w-fit cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setViewingSellerId(item.sellerId); }}
                >
                    <img src={seller.avatar} className="w-6 h-6 rounded-full object-cover ring-2 ring-white shadow-sm group-hover/seller:ring-indigo-100 transition" alt={seller.name} />
                    <span className="text-xs font-semibold text-slate-500 group-hover/seller:text-indigo-600 transition">
                        {seller.id === 'me' ? 'You' : seller.name}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-slate-400">{item.createdAt}</span>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-6 leading-relaxed">
                    {highlightText(item.description, searchQuery)}
                </p>

                <div className="mt-auto flex gap-2 pt-4 border-t border-slate-50">
                    <button 
                        onClick={(e) => onAddCart(e, item)}
                        disabled={isInCart || !!item.isSold}
                        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 transform active:scale-95
                            ${item.isSold
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                : isInCart 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' 
                                    : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-indigo-200'
                            }`}
                    >
                        {item.isSold ? 'Sold' : isInCart ? (
                            <><span>✓</span> Added</>
                        ) : (
                            'Add to Cart'
                        )}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onChat(item.sellerId); }}
                        className="p-2.5 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition"
                        title="Contact Seller"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </button>
                    <button 
                        onClick={(e) => onReport(e, item)}
                        className="p-2.5 border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition"
                        title="Report Item"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 01-2-1.85V19l6-1 6 1 6-1V5a2 2 0 10-2 2h-6l-4 1-6-1z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

const ItemMarketplace: React.FC<ItemMarketplaceProps> = ({ onChat }) => {
  const [items, setItems] = useState<MarketplaceItem[]>(MOCK_MARKETPLACE_ITEMS);
  const [filter, setFilter] = useState('All');
  const [showListModal, setShowListModal] = useState(false);
  const [viewingSellerId, setViewingSellerId] = useState<string | null>(null);

  // View Mode: Market, History, or Favorites
  const [viewMode, setViewMode] = useState<'market' | 'history' | 'favorites'>('market');

  // Item Details & Recently Viewed State
  const [viewingItem, setViewingItem] = useState<MarketplaceItem | null>(null);
  const [viewingItemImageIndex, setViewingItemImageIndex] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState<MarketplaceItem[]>([]);

  // Purchase History & Reviews State
  const [purchases, setPurchases] = useState<Purchase[]>(MOCK_PURCHASES);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<Purchase | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Purchase | null>(null);
  
  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price_asc', 'price_desc'
  const [conditionFilter, setConditionFilter] = useState('All');

  // Likes/Favorites State with LocalStorage
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(() => {
    try {
        const saved = localStorage.getItem('bridgeMe_favorites');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch(e) {
        return new Set();
    }
  });

  // Persist likes
  useEffect(() => {
      try {
        localStorage.setItem('bridgeMe_favorites', JSON.stringify(Array.from(likedItemIds)));
      } catch(e) {
        console.error("Failed to save favorites", e);
      }
  }, [likedItemIds]);

  // Cart State with LocalStorage Persistence
  const [cartItems, setCartItems] = useState<MarketplaceItem[]>(() => {
      try {
          const saved = localStorage.getItem('bridgeMe_cart_items');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          console.error("Failed to load cart items from localStorage", e);
          return [];
      }
  });

  // Persist Cart
  useEffect(() => {
      try {
        localStorage.setItem('bridgeMe_cart_items', JSON.stringify(cartItems));
      } catch (e) {
        console.error("Failed to save cart items", e);
      }
  }, [cartItems]);

  const [showCart, setShowCart] = useState(false);
  const [itemToAdd, setItemToAdd] = useState<MarketplaceItem | null>(null);

  // Checkout / Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Shipping Form State
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingZip, setShippingZip] = useState('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  
  // Card Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  // Save Payment Info State
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [savedCard, setSavedCard] = useState<{last4: string, brand: string} | null>(() => {
      try {
          const s = localStorage.getItem('bridgeMe_saved_card');
          return s ? JSON.parse(s) : null;
      } catch(e) { return null; }
  });
  const [useSavedCard, setUseSavedCard] = useState(false); // Toggle to use saved card

  // Form State
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Handmade');
  const [newItemCondition, setNewItemCondition] = useState<ItemCondition>('New');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImages, setNewItemImages] = useState<string[]>([]);
  const [newItemVideo, setNewItemVideo] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-Save State
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isDraftInitialized = useRef(false);

  // Report Item State
  const [itemToReport, setItemToReport] = useState<MarketplaceItem | null>(null);

  // Detect First Time Buyer based on Purchase History
  const isFirstTimeBuyer = purchases.length === 0 || !savedCard;

  // Ref to store latest draft for synchronous saving on unmount
  const draftRef = useRef({
      title: newItemTitle,
      price: newItemPrice,
      category: newItemCategory,
      condition: newItemCondition,
      desc: newItemDesc,
      images: newItemImages,
      video: newItemVideo
  });

  // Update draftRef whenever form changes
  useEffect(() => {
      draftRef.current = {
          title: newItemTitle,
          price: newItemPrice,
          category: newItemCategory,
          condition: newItemCondition,
          desc: newItemDesc,
          images: newItemImages,
          video: newItemVideo
      };
  }, [newItemTitle, newItemPrice, newItemCategory, newItemCondition, newItemDesc, newItemImages, newItemVideo]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('bridgeMe_listing_draft');
    if (savedDraft) {
        try {
            const draft = JSON.parse(savedDraft);
            if (draft.title) setNewItemTitle(draft.title);
            if (draft.price) setNewItemPrice(draft.price);
            if (draft.category) setNewItemCategory(draft.category);
            if (draft.condition) setNewItemCondition(draft.condition);
            if (draft.desc) setNewItemDesc(draft.desc);
            if (draft.images) setNewItemImages(draft.images);
            if (draft.video) setNewItemVideo(draft.video);
            setLastSaved(new Date()); 
        } catch (e) {
            console.error("Failed to load draft", e);
        }
    }
    isDraftInitialized.current = true;
  }, []);

  // Helper function to persist draft
  const persistDraft = (draft: any): boolean => {
      const isFormEmpty = !draft.title && !draft.price && !draft.desc && (!draft.images || draft.images.length === 0) && !draft.video;
      
      if (isFormEmpty) {
          localStorage.removeItem('bridgeMe_listing_draft');
          return false;
      }

      try {
          localStorage.setItem('bridgeMe_listing_draft', JSON.stringify(draft));
          return true;
      } catch (e) {
          try {
              const textDraft = { ...draft, images: [], video: null };
              localStorage.setItem('bridgeMe_listing_draft', JSON.stringify(textDraft));
              return true;
          } catch (e2) {
              console.error("Failed to save draft", e2);
              return false;
          }
      }
  };

  // Save draft on changes (debounced)
  useEffect(() => {
    if (!isDraftInitialized.current) return;

    const timer = setTimeout(() => {
        const saved = persistDraft(draftRef.current);
        if (saved) {
            setLastSaved(new Date());
        } else {
            setLastSaved(null);
        }
    }, 1000);

    return () => clearTimeout(timer);
  }, [newItemTitle, newItemPrice, newItemCategory, newItemCondition, newItemDesc, newItemImages, newItemVideo]);

  // Save draft on unmount (navigation away) to capture latest changes instantly
  useEffect(() => {
      return () => {
          if (isDraftInitialized.current) {
              persistDraft(draftRef.current);
          }
      };
  }, []);

  const handleClearDraft = () => {
      setNewItemTitle('');
      setNewItemPrice('');
      setNewItemCategory('Handmade');
      setNewItemCondition('New');
      setNewItemDesc('');
      setNewItemImages([]);
      setNewItemVideo(null);
      localStorage.removeItem('bridgeMe_listing_draft');
      setLastSaved(null);
  };

  const getSeller = (id: string) => MOCK_USERS.find(u => u.id === id) || MOCK_USERS[0];
  const getUser = (id: string) => MOCK_USERS.find(u => u.id === id) || { name: 'Unknown', avatar: 'https://picsum.photos/200/200?random=99' };

  // Helper to parse relative time strings into timestamps for sorting
  const parseRelativeTime = (timeStr: string): number => {
    const now = Date.now();
    const str = timeStr.toLowerCase();
    
    if (str === 'just now') return now;
    
    const numMatch = str.match(/(\d+)/);
    const num = numMatch ? parseInt(numMatch[0]) : 0;
    
    if (str.includes('hour')) return now - num * 60 * 60 * 1000;
    if (str.includes('day')) return now - num * 24 * 60 * 60 * 1000;
    if (str.includes('week')) return now - num * 7 * 24 * 60 * 60 * 1000;
    if (str.includes('month')) return now - num * 30 * 24 * 60 * 60 * 1000;
    
    return now - 1000000000; // Fallback for old items
  };

  const checkIsTrusted = (sellerId: string): boolean => {
      const seller = getSeller(sellerId);
      if (!seller) return false;
      
      const sellerReviews = reviews.filter(r => r.sellerId === sellerId);
      const avgRating = sellerReviews.length > 0 
        ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length
        : 0;
      
      return seller.isPremium || (sellerReviews.length >= 3 && avgRating >= 4.5);
  };

  const processedItems = items
    .filter(item => {
        const matchesCategory = filter === 'All' || item.category === filter;
        const matchesCondition = conditionFilter === 'All' || item.condition === conditionFilter;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch && matchesCondition;
    })
    .sort((a, b) => {
        switch (sortBy) {
            case 'price_asc':
                return a.price - b.price;
            case 'price_desc':
                return b.price - a.price;
            case 'newest':
            default:
                return parseRelativeTime(b.createdAt) - parseRelativeTime(a.createdAt);
        }
    });
  
  const favoriteItems = items.filter(item => likedItemIds.has(item.id));

  const handleViewItem = (item: MarketplaceItem) => {
      setViewingItem(item);
      setViewingItemImageIndex(0);
      setRecentlyViewed(prev => {
          const filtered = prev.filter(i => i.id !== item.id);
          return [item, ...filtered].slice(0, 4);
      });
  };

  const handleToggleLike = (e: React.MouseEvent, itemId: string, isSold?: boolean) => {
      e.stopPropagation();
      if (isSold) return;
      
      const isLiked = likedItemIds.has(itemId);
      const newLikedIds = new Set(likedItemIds);
      
      if (isLiked) {
          newLikedIds.delete(itemId);
      } else {
          newLikedIds.add(itemId);
      }
      
      setLikedItemIds(newLikedIds);
      
      setItems(items.map(item => {
          if (item.id === itemId) {
              return {
                  ...item,
                  likes: isLiked ? Math.max(0, item.likes - 1) : item.likes + 1
              };
          }
          return item;
      }));
  };

  const handleAddToCart = (e: React.MouseEvent, item: MarketplaceItem) => {
      e.stopPropagation();
      if (item.isSold) return;

      if (cartItems.some(i => i.id === item.id)) {
          return;
      }
      setItemToAdd(item);
  };

  const confirmAddToCart = () => {
      if (itemToAdd) {
          setCartItems([...cartItems, itemToAdd]);
          setItemToAdd(null);
      }
  };

  const handleRemoveFromCart = (itemId: string) => {
      setCartItems(cartItems.filter(i => i.id !== itemId));
  };

  const handleReportClick = (e: React.MouseEvent, item: MarketplaceItem) => {
      e.stopPropagation();
      setItemToReport(item);
  };

  const confirmReport = () => {
      setTimeout(() => {
        alert("Thank you for your report. We will investigate this item.");
        setItemToReport(null);
      }, 500);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleCheckoutClick = () => {
      if (cartItems.length === 0) return;
      setShowCart(false);
      if (savedCard) {
          setUseSavedCard(true);
      }
      setShowPaymentModal(true);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const truncated = val.slice(0, 16);
    const formatted = truncated.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) return;
    
    if (val.length >= 3) {
        setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
        setCardExpiry(val);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessingPayment(true);
      
      if (savePaymentInfo && paymentMethod === 'card') {
          const info = { last4: cardNumber.slice(-4), brand: 'Card' };
          localStorage.setItem('bridgeMe_saved_card', JSON.stringify(info));
          setSavedCard(info);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      finalizeTransaction();
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
      
      setShippingName('');
      setShippingAddress('');
      setShippingCity('');
      setShippingZip('');
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setPaymentMethod('card');
      setSavePaymentInfo(false);
  };

  const finalizeTransaction = () => {
      let paymentLabel = '';
      if (useSavedCard && savedCard) {
          paymentLabel = `Saved ${savedCard.brand} ending in ${savedCard.last4}`;
      } else {
          paymentLabel = paymentMethod === 'paypal' 
            ? 'PayPal' 
            : `Credit Card ending in ${cardNumber.slice(-4) || 'xxxx'}`;
      }

      const newPurchases: Purchase[] = cartItems.map(item => ({
          id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          itemId: item.id,
          sellerId: item.sellerId,
          title: item.title,
          price: item.price,
          image: item.images[0],
          purchaseDate: new Date().toISOString(),
          paymentMethod: paymentLabel
      }));
      
      setPurchases([...newPurchases, ...purchases]);
      
      setItems(prevItems => prevItems.map(item => 
          cartItems.some(c => c.id === item.id) ? { ...item, isSold: true } : item
      ));

      setCartItems([]);
      setViewMode('history');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          if (newItemImages.length + files.length > 5) {
              alert("You can only upload a maximum of 5 images.");
              if (fileInputRef.current) fileInputRef.current.value = '';
              return;
          }

          const validFiles = Array.from(files).filter((file: any) => file.type.startsWith('image/'));
          if (validFiles.length < files.length) {
              alert("Some files were ignored because they are not images.");
          }

          const promises = validFiles.map((file: any) => {
              return new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                      if (reader.result) resolve(reader.result as string);
                  };
                  reader.readAsDataURL(file);
              });
          });

          Promise.all(promises).then(newImages => {
              setNewItemImages(prev => [...prev, ...newImages]);
          });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateVideo = async () => {
      if (newItemImages.length === 0) {
          alert("Please upload at least one image first to serve as a reference.");
          return;
      }
      if (!newItemTitle || !newItemDesc) {
          alert("Please fill in the title and description first.");
          return;
      }
      
      setIsGeneratingVideo(true);
      const videoUri = await generateItemShowcaseVideo(newItemImages[0], newItemTitle, newItemDesc);
      
      if (videoUri) {
          setNewItemVideo(videoUri);
      } else {
          alert("Could not generate video. Please try again or select a valid API key.");
      }
      setIsGeneratingVideo(false);
  };

  const removeUploadedImage = (indexToRemove: number) => {
      setNewItemImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleListItem = (e: React.FormEvent) => {
      e.preventDefault();
      const newItem: MarketplaceItem = {
          id: `new_${Date.now()}`,
          sellerId: 'me',
          title: newItemTitle,
          price: Number(newItemPrice),
          category: newItemCategory as any,
          condition: newItemCondition,
          description: newItemDesc,
          images: newItemImages.length > 0 ? newItemImages : [`https://picsum.photos/400/400?random=${Date.now()}`], 
          videoUrl: newItemVideo || undefined,
          likes: 0,
          isSold: false,
          createdAt: 'Just now'
      };

      setItems([newItem, ...items]);
      setShowListModal(false);
      handleClearDraft();
      alert('Your item has been listed successfully!');
  };

  const handleOpenReview = (purchase: Purchase) => {
      setReviewTarget(purchase);
      setReviewRating(5);
      setReviewComment('');
      setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
      if (!reviewTarget) return;

      const newReview: Review = {
          id: `rev_${Date.now()}`,
          sellerId: reviewTarget.sellerId,
          itemId: reviewTarget.itemId,
          authorId: 'me',
          rating: reviewRating,
          comment: reviewComment,
          createdAt: new Date().toISOString()
      };

      setReviews([newReview, ...reviews]);
      setShowReviewModal(false);
      setReviewTarget(null);
  };

  const getConditionColor = (condition: ItemCondition) => {
      switch (condition) {
          case 'New': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          case 'Used - Like New': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'Used - Good': return 'bg-amber-100 text-amber-700 border-amber-200';
          case 'Used - Fair': return 'bg-orange-100 text-orange-700 border-orange-200';
          default: return 'bg-slate-100 text-slate-700 border-slate-200';
      }
  };

  const viewingSeller = viewingSellerId ? getSeller(viewingSellerId) : null;
  const sellerItems = viewingSellerId ? items.filter(i => i.sellerId === viewingSellerId) : [];
  
  const sellerReviews = viewingSellerId 
    ? reviews
        .filter(r => r.sellerId === viewingSellerId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];
  
  const avgRatingNumeric = sellerReviews.length > 0 
    ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length
    : 0;
  const avgRating = sellerReviews.length > 0 ? avgRatingNumeric.toFixed(1) : "New";

  const isTrustedViewingSeller = viewingSeller ? checkIsTrusted(viewingSeller.id) : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Generational Marketplace</h2>
          <p className="mt-2 text-lg text-slate-600 max-w-2xl">
            Discover unique handcrafted items, vintage treasures, and pre-loved tools passed down through generations.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
            <button 
                onClick={() => setShowCart(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition relative group"
            >
                <span className="group-hover:scale-110 transition-transform">🛒</span> Cart
                {cartItems.length > 0 && (
                    <span className="bg-red-50 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center absolute -top-1.5 -right-1.5 shadow-sm ring-2 ring-white">
                        {cartItems.length}
                    </span>
                )}
            </button>
            
            {/* Navigation Group */}
            <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                <button 
                    onClick={() => setViewMode('market')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition ${viewMode === 'market' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Browse
                </button>
                <button 
                    onClick={() => setViewMode('history')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-1 ${viewMode === 'history' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <span>📦</span> My Orders
                </button>
                <button 
                    onClick={() => setViewMode('favorites')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-1 ${viewMode === 'favorites' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <span>❤️</span> Favorites
                </button>
            </div>

            {viewMode === 'market' && (
                <button 
                    onClick={() => setShowListModal(true)}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    <span>+</span> List an Item
                </button>
            )}
        </div>
      </div>

      {viewMode === 'history' ? (
        // PURCHASE HISTORY VIEW
        <div className="animate-fadeIn">
             <div className="flex items-center gap-2 mb-6">
                 <button onClick={() => setViewMode('market')} className="text-slate-500 hover:text-indigo-600 text-sm font-medium">Marketplace</button>
                 <span className="text-slate-300">/</span>
                 <span className="text-slate-900 font-bold">Purchase History</span>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                 {purchases.length === 0 ? (
                     <div className="p-16 text-center text-slate-500">
                         <span className="text-5xl block mb-4">🛍️</span>
                         <p className="text-lg text-slate-700 font-medium">You haven't purchased anything yet.</p>
                         <p className="text-sm text-slate-500 mb-6">Discover amazing items from our community.</p>
                         <button onClick={() => setViewMode('market')} className="px-6 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 transition">Start Shopping</button>
                     </div>
                 ) : (
                     <div className="divide-y divide-slate-100">
                         {purchases.map(purchase => {
                             const seller = getSeller(purchase.sellerId);
                             const hasReviewed = reviews.some(r => r.itemId === purchase.itemId && r.authorId === 'me'); 

                             return (
                                 <div key={purchase.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-slate-50 transition">
                                     <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                         <img src={purchase.image} alt={purchase.title} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 mb-1">{purchase.title}</h3>
                                                <p className="text-xs text-slate-400 mb-2">Order #{purchase.id.slice(-8).toUpperCase()}</p>
                                            </div>
                                            <span className="font-bold text-emerald-600 text-lg">${purchase.price}</span>
                                         </div>
                                         <p className="text-sm text-slate-500 mb-2">
                                             Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}
                                         </p>
                                         <div className="flex items-center gap-2 mb-3">
                                             <span className="text-xs text-slate-400 font-medium uppercase">Paid via</span>
                                             <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-semibold text-slate-700">
                                                 <span>{purchase.paymentMethod?.toLowerCase().includes('paypal') ? '🅿️' : '💳'}</span>
                                                 <span>{purchase.paymentMethod || 'Credit Card'}</span>
                                             </div>
                                         </div>
                                         <div className="flex items-center gap-2 text-sm">
                                             <span className="text-slate-500">Sold by:</span>
                                             <div className="flex items-center gap-1.5 cursor-pointer hover:bg-indigo-50 px-2 py-1 rounded-full transition" onClick={() => {
                                                 setViewingSellerId(purchase.sellerId);
                                             }}>
                                                 <img src={seller.avatar} alt={seller.name} className="w-5 h-5 rounded-full object-cover" />
                                                 <span className="font-medium text-slate-700 hover:text-indigo-600">{seller.name}</span>
                                             </div>
                                         </div>
                                     </div>
                                     <div className="flex flex-col gap-2 w-full md:w-auto">
                                         <button 
                                             onClick={() => setViewingReceipt(purchase)}
                                             className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:border-slate-400 hover:text-slate-900 transition text-sm flex items-center justify-center gap-2"
                                         >
                                             <span>🧾</span> View Receipt
                                         </button>
                                         <button 
                                             onClick={() => onChat(purchase.sellerId)}
                                             className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:border-indigo-300 hover:text-indigo-600 transition text-sm"
                                         >
                                             Contact Seller
                                         </button>
                                         {hasReviewed ? (
                                             <button disabled className="w-full px-4 py-2 bg-slate-100 text-slate-400 rounded-lg font-medium text-sm cursor-default border border-slate-200">
                                                 ★ Reviewed
                                             </button>
                                         ) : (
                                            <button 
                                                onClick={() => handleOpenReview(purchase)}
                                                className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium text-sm hover:bg-indigo-100 transition border border-indigo-100"
                                            >
                                                ★ Write Review
                                            </button>
                                         )}
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                 )}
             </div>
        </div>
      ) : viewMode === 'favorites' ? (
        // FAVORITES VIEW
        <div className="animate-fadeIn">
             <div className="flex items-center gap-2 mb-6">
                 <button onClick={() => setViewMode('market')} className="text-slate-500 hover:text-indigo-600 text-sm font-medium">Marketplace</button>
                 <span className="text-slate-300">/</span>
                 <span className="text-slate-900 font-bold">My Favorites</span>
             </div>

             {favoriteItems.length === 0 ? (
                 <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                     <span className="text-5xl block mb-4 opacity-50 text-red-300">❤️</span>
                     <h3 className="text-lg font-bold text-slate-900">No favorites yet</h3>
                     <p className="text-slate-500 mt-2">Save items you love to find them easily later.</p>
                     <button onClick={() => setViewMode('market')} className="mt-6 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">Browse Items</button>
                 </div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favoriteItems.map(item => {
                        const seller = getSeller(item.sellerId);
                        const isInCart = cartItems.some(i => i.id === item.id);
                        
                        return (
                            <MarketplaceItemCard 
                                key={item.id}
                                item={item}
                                seller={seller}
                                isLiked={true} // Always liked in this view
                                isInCart={isInCart}
                                searchQuery={searchQuery}
                                getConditionColor={getConditionColor}
                                onView={handleViewItem}
                                onToggleLike={handleToggleLike}
                                onAddCart={handleAddToCart}
                                onChat={onChat}
                                onReport={handleReportClick}
                                setViewingSellerId={setViewingSellerId}
                            />
                        );
                    })}
                </div>
             )}
        </div>
      ) : (
        // MAIN MARKETPLACE VIEW
        <>
            {/* Search & Sort Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100 animate-fadeIn items-center">
                <div className="flex-1 relative w-full">
                    <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search items by title or description..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 transition-colors focus:bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search items"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 flex-1 md:flex-none">
                        <span className="text-sm font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Category:</span>
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full md:w-40 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 cursor-pointer text-sm font-medium hover:bg-white transition-colors"
                            aria-label="Filter by category"
                            title="Filter items by category"
                        >
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Condition Filter */}
                    <div className="flex items-center gap-2 flex-1 md:flex-none">
                        <span className="text-sm font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Condition:</span>
                        <select 
                            value={conditionFilter}
                            onChange={(e) => setConditionFilter(e.target.value)}
                            className="w-full md:w-40 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 cursor-pointer text-sm font-medium hover:bg-white transition-colors"
                            aria-label="Filter by condition"
                            title="Filter items by condition"
                        >
                            <option value="All">All Conditions</option>
                            {CONDITIONS.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 flex-1 md:flex-none">
                        <span className="text-sm font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Sort by:</span>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full md:w-48 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 cursor-pointer text-sm font-medium hover:bg-white transition-colors"
                            aria-label="Sort items"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {processedItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn pb-12">
                    {processedItems.map(item => {
                        const seller = getSeller(item.sellerId);
                        const isLiked = likedItemIds.has(item.id);
                        const isInCart = cartItems.some(i => i.id === item.id);

                        return (
                            <MarketplaceItemCard 
                                key={item.id}
                                item={item}
                                seller={seller}
                                isLiked={isLiked}
                                isInCart={isInCart}
                                searchQuery={searchQuery}
                                getConditionColor={getConditionColor}
                                onView={handleViewItem}
                                onToggleLike={handleToggleLike}
                                onAddCart={handleAddToCart}
                                onChat={onChat}
                                onReport={handleReportClick}
                                setViewingSellerId={setViewingSellerId}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 animate-fadeIn">
                    <span className="text-5xl block mb-4 opacity-50">🔍</span>
                    <h3 className="text-lg font-bold text-slate-900">No items found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
                    <button onClick={() => {setFilter('All'); setSearchQuery(''); setConditionFilter('All');}} className="mt-4 text-indigo-600 font-bold hover:underline">Clear Filters</button>
                </div>
            )}

            {/* Recently Viewed Items Section */}
            {recentlyViewed.length > 0 && (
                <div className="mt-16 animate-fadeIn">
                    <div className="flex items-center gap-4 mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Recently Viewed</h3>
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <button 
                            onClick={() => setRecentlyViewed([])} 
                            className="text-xs text-slate-400 hover:text-red-500 font-medium transition flex items-center gap-1"
                        >
                            <span>✕</span> Clear History
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {recentlyViewed.map(item => (
                            <div 
                                key={`recent-${item.id}`} 
                                onClick={() => handleViewItem(item)}
                                className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col overflow-hidden"
                            >
                                <div className="aspect-square bg-slate-100 relative">
                                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                    {item.isSold && (
                                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                            <span className="text-white text-[10px] font-bold uppercase border border-white px-2 py-0.5 rounded tracking-wider">Sold</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h4 className="font-bold text-slate-800 text-xs truncate mb-1">{item.title}</h4>
                                    <span className="text-emerald-600 font-bold text-sm">${item.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
      )}

      {/* Add to Cart Confirmation Modal */}
      {itemToAdd && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        🛒
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Add to Cart?</h3>
                    <p className="text-slate-600 mb-6">
                        Do you want to add <span className="font-bold text-slate-800">{itemToAdd.title}</span> for <span className="font-bold text-emerald-600">${itemToAdd.price}</span>?
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setItemToAdd(null)} 
                            className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition border border-slate-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmAddToCart}
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Report Confirmation Modal */}
      {itemToReport && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        ⚠️
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Report Item?</h3>
                    <p className="text-slate-600 mb-6">
                        Are you sure you want to report <span className="font-bold text-slate-800">{itemToReport.title}</span> for violating our policies?
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setItemToReport(null)} 
                            className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition border border-slate-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmReport}
                            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg"
                        >
                            Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* List Item Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-xl text-slate-900">List an Item for Sale</h3>
                        {lastSaved && <p className="text-xs text-slate-400 font-medium mt-0.5 animate-pulse">Auto-saved at {lastSaved.toLocaleTimeString()}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleClearDraft}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition mr-2"
                        >
                            Reset Form
                        </button>
                        <button onClick={() => setShowListModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                </div>
                <form onSubmit={handleListItem} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Item Title</label>
                        <input 
                            required
                            type="text" 
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Hand-knit Sweater"
                            value={newItemTitle}
                            onChange={e => setNewItemTitle(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                            <input 
                                required
                                type="number" 
                                min="0"
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="0.00"
                                value={newItemPrice}
                                onChange={e => setNewItemPrice(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select 
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                value={newItemCategory}
                                onChange={e => setNewItemCategory(e.target.value)}
                            >
                                {CATEGORIES.filter(c => c !== 'All').map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                        <select 
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={newItemCondition}
                            onChange={e => setNewItemCondition(e.target.value as ItemCondition)}
                        >
                            {CONDITIONS.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea 
                            required
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            rows={3}
                            placeholder="Tell the story behind this item..."
                            value={newItemDesc}
                            onChange={e => setNewItemDesc(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Item Photos (Max 5)</label>
                        <div className="grid grid-cols-3 gap-3">
                             {newItemImages.map((img, idx) => (
                                 <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                     <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                     <button
                                        type="button"
                                        onClick={() => removeUploadedImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                                     >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                     </button>
                                 </div>
                             ))}
                             
                             {newItemImages.length < 5 && (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border-dashed border-2 border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition text-slate-400 hover:text-indigo-600 group"
                                >
                                    <div className="bg-indigo-100 p-2 rounded-full mb-1 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <span className="text-xs font-bold">Add Photo</span>
                                </div>
                             )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                        />
                    </div>

                    {/* AI Video Showcase Section */}
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <label className="block text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                             <span>🎥</span> AI Video Showcase (Beta)
                        </label>
                        
                        {!newItemVideo ? (
                             <div className="text-center">
                                 <p className="text-xs text-slate-600 mb-3">Generate a cinematic 4K preview of your item using Google Veo.</p>
                                 <button
                                    type="button"
                                    onClick={handleGenerateVideo}
                                    disabled={isGeneratingVideo || newItemImages.length === 0}
                                    className={`w-full py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2
                                        ${isGeneratingVideo 
                                            ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed' 
                                            : newItemImages.length === 0
                                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                 >
                                     {isGeneratingVideo ? (
                                         <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Creating cinematic preview...
                                         </>
                                     ) : (
                                        "Generate Video with Veo"
                                     )}
                                 </button>
                                 {newItemImages.length === 0 && <p className="text-[10px] text-red-400 mt-2">* Upload an image first to use as reference</p>}
                             </div>
                        ) : (
                            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                                <video src={newItemVideo} controls className="w-full h-full" />
                                <button
                                    type="button"
                                    onClick={() => setNewItemVideo(null)}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-md"
                                    title="Remove video"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg">
                        List Item
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {viewingItem && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl overflow-hidden animate-scale-in flex flex-col md:flex-row relative">
                <button 
                    onClick={() => setViewingItem(null)} 
                    className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white text-slate-600 p-2 rounded-full backdrop-blur-md transition shadow-sm"
                >
                    ✕
                </button>

                {/* Left: Gallery */}
                <div className="w-full md:w-1/2 bg-slate-100 flex flex-col">
                    {/* Main Image or Video */}
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
                        {viewingItemImageIndex < viewingItem.images.length ? (
                             <>
                                <img 
                                    src={viewingItem.images[viewingItemImageIndex]} 
                                    alt={viewingItem.title} 
                                    className={`w-full h-full object-cover ${viewingItem.isSold ? 'grayscale opacity-75' : ''}`} 
                                />
                                {viewingItem.isSold && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30">
                                        <span className="bg-white/90 text-slate-900 px-8 py-3 rounded-xl font-extrabold text-3xl shadow-lg border-4 border-slate-900 transform -rotate-12 uppercase tracking-widest">
                                            Sold
                                        </span>
                                    </div>
                                )}
                             </>
                        ) : (
                            // Render Video
                             <video 
                                src={viewingItem.videoUrl} 
                                controls 
                                autoPlay 
                                className="w-full h-full object-contain" 
                             />
                        )}
                        
                        {/* Navigation Arrows (Big Image) */}
                        {/* Only show arrows if total items (images + video) > 1 */}
                        {(viewingItem.images.length + (viewingItem.videoUrl ? 1 : 0)) > 1 && (
                            <>
                                <button 
                                    onClick={() => setViewingItemImageIndex(prev => {
                                        const total = viewingItem.images.length + (viewingItem.videoUrl ? 1 : 0);
                                        return (prev - 1 + total) % total;
                                    })}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/80 text-white hover:text-slate-900 p-2 rounded-full backdrop-blur-md transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button 
                                    onClick={() => setViewingItemImageIndex(prev => {
                                        const total = viewingItem.images.length + (viewingItem.videoUrl ? 1 : 0);
                                        return (prev + 1) % total;
                                    })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/80 text-white hover:text-slate-900 p-2 rounded-full backdrop-blur-md transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </>
                        )}
                    </div>
                    
                    {/* Thumbnails */}
                    {(viewingItem.images.length > 1 || viewingItem.videoUrl) && (
                        <div className="h-20 bg-white border-t border-slate-200 p-3 flex gap-2 overflow-x-auto">
                            {viewingItem.images.map((img, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setViewingItemImageIndex(idx)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${idx === viewingItemImageIndex ? 'border-indigo-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                            {/* Video Thumbnail */}
                            {viewingItem.videoUrl && (
                                <button
                                    onClick={() => setViewingItemImageIndex(viewingItem.images.length)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition bg-black flex items-center justify-center ${viewingItemImageIndex === viewingItem.images.length ? 'border-indigo-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <span className="text-white text-2xl">🎥</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Details */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col h-full overflow-y-auto">
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-2">
                             <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">
                                {viewingItem.category}
                             </span>
                             {viewingItem.condition && (
                                <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getConditionColor(viewingItem.condition)}`}>
                                    {viewingItem.condition}
                                </span>
                             )}
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{viewingItem.title}</h2>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-emerald-600">${viewingItem.price}</span>
                            <span className="text-sm text-slate-400">Listed {viewingItem.createdAt}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-4 border-y border-slate-100 mb-6">
                        <img 
                            src={getSeller(viewingItem.sellerId).avatar} 
                            alt="Seller" 
                            className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-slate-500 font-bold uppercase">Seller</p>
                                {checkIsTrusted(viewingItem.sellerId) && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        Trusted
                                    </span>
                                )}
                            </div>
                            <button 
                                onClick={() => { setViewingSellerId(viewingItem.sellerId); setViewingItem(null); }}
                                className="text-slate-900 font-bold hover:text-indigo-600 transition"
                            >
                                {getSeller(viewingItem.sellerId).name}
                            </button>
                        </div>
                         <button 
                            onClick={() => onChat(viewingItem.sellerId)}
                            className="text-indigo-600 border border-indigo-200 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-indigo-50 transition"
                        >
                            Message
                        </button>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-900 mb-2">Description</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {viewingItem.description}
                        </p>
                    </div>

                    {/* Item Reviews */}
                    {reviews.some(r => r.itemId === viewingItem.id) && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-900 mb-3">Item Reviews</h3>
                            <div className="space-y-3">
                                {reviews.filter(r => r.itemId === viewingItem.id).map(r => (
                                    <div key={r.id} className="bg-slate-50 p-3 rounded-lg text-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-700">{getUser(r.authorId).name}</span>
                                            <div className="flex text-amber-400 text-xs">
                                                {[...Array(5)].map((_, i) => <span key={i}>{i < r.rating ? '★' : '☆'}</span>)}
                                            </div>
                                        </div>
                                        <p className="text-slate-600">{r.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-auto flex gap-4 pt-4 border-t border-slate-100">
                        <button 
                            onClick={(e) => handleAddToCart(e, viewingItem)}
                            disabled={cartItems.some(i => i.id === viewingItem.id) || !!viewingItem.isSold}
                            className={`flex-1 py-3.5 rounded-xl font-bold text-lg shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2
                                ${viewingItem.isSold
                                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                    : cartItems.some(i => i.id === viewingItem.id) 
                                        ? 'bg-green-600 text-white cursor-default' 
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                        >
                            {viewingItem.isSold ? 'Sold' : cartItems.some(i => i.id === viewingItem.id) ? 'Added to Cart' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
         </div>
      )}

      {/* Seller Profile Modal */}
      {viewingSeller && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                {/* Modal Header/Cover */}
                <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600 shrink-0">
                    <button 
                        onClick={() => setViewingSellerId(null)} 
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition z-10"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                {/* Profile Content */}
                <div className="px-8 pb-8 flex-1 overflow-y-auto">
                    <div className="relative -mt-16 mb-4 flex justify-between items-end">
                        <img 
                            src={viewingSeller.avatar} 
                            alt={viewingSeller.name} 
                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white" 
                        />
                        <div className="flex gap-2 mb-2">
                             <button 
                                onClick={() => onChat(viewingSeller.id)}
                                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-md"
                            >
                                Message
                            </button>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-extrabold text-slate-900">{viewingSeller.name}</h2>
                            {viewingSeller.isPremium && (
                                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-200">PRO</span>
                            )}
                        </div>
                        <p className="text-slate-500 font-medium mb-1">{viewingSeller.role} • {viewingSeller.location}</p>
                        
                         {/* Average Rating Display */}
                         <div className="flex items-center gap-2 mb-2">
                            <span className="text-amber-500 text-lg">★</span>
                            <span className="font-bold text-slate-800">{avgRating}</span>
                            <span className="text-slate-400 text-sm">({sellerReviews.length} reviews)</span>
                        </div>

                         {/* Buy with Confidence Badge */}
                         {isTrustedViewingSeller && (
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full shadow-sm mt-2">
                                <div className="bg-indigo-100 p-1 rounded-full text-indigo-600">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                </div>
                                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Buy with Confidence</span>
                            </div>
                         )}

                        <p className="mt-4 text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                            "{viewingSeller.bio}"
                        </p>
                    </div>
                    
                    {/* Listings */}
                    <h3 className="font-bold text-lg text-slate-900 mb-4 border-b border-slate-100 pb-2">Active Listings ({sellerItems.length})</h3>
                    {sellerItems.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {sellerItems.map(item => (
                                <div 
                                    key={`profile-${item.id}`} 
                                    onClick={() => { setViewingSellerId(null); handleViewItem(item); }}
                                    className="border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition bg-white"
                                >
                                    <div className="aspect-square bg-slate-100">
                                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-slate-800 text-xs truncate mb-1">{item.title}</h4>
                                        <span className="text-emerald-600 font-bold text-sm">${item.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 italic mb-8">No active listings.</p>
                    )}

                    {/* Recent Reviews */}
                    <h3 className="font-bold text-lg text-slate-900 mb-4 border-b border-slate-100 pb-2">Recent Reviews</h3>
                    {sellerReviews.length > 0 ? (
                        <div className="space-y-4">
                            {sellerReviews.map(review => (
                                <div key={review.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 text-sm">{getUser(review.authorId).name}</span>
                                            <span className="text-xs text-slate-400">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex text-amber-400 text-xs">
                                            {[...Array(5)].map((_, i) => <span key={i}>{i < review.rating ? '★' : '☆'}</span>)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 italic">No reviews yet.</p>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* View Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 relative">
                <button onClick={() => setViewingReceipt(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">✕</button>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span>🧾</span> Receipt
                </h3>
                <div className="space-y-4 text-sm">
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                         <span className="text-slate-500">Order ID</span>
                         <span className="font-mono text-slate-700">{viewingReceipt.id.slice(-8).toUpperCase()}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                         <span className="text-slate-500">Date</span>
                         <span className="text-slate-700">{new Date(viewingReceipt.purchaseDate).toLocaleDateString()}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                         <span className="text-slate-500">Item</span>
                         <span className="font-bold text-slate-900">{viewingReceipt.title}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                         <span className="text-slate-500">Amount</span>
                         <span className="font-bold text-emerald-600">${viewingReceipt.price}</span>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                         <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Mode of Payment</span>
                         <div className="flex items-center gap-2">
                             <span className="text-xl">{viewingReceipt.paymentMethod?.includes('PayPal') ? '🅿️' : '💳'}</span>
                             <span className="font-medium text-slate-700">{viewingReceipt.paymentMethod || 'Credit Card'}</span>
                         </div>
                     </div>
                </div>
                <button onClick={() => setViewingReceipt(null)} className="w-full mt-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition">Close Receipt</button>
            </div>
        </div>
      )}

    </div>
  );
};

export default ItemMarketplace;