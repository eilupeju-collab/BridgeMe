import React, { useState, useEffect, useRef } from 'react';
import { MOCK_USERS, MOCK_CALL_LOGS } from '../constants';
import { ChatMessage, UserProfile, ChatReaction, CallLog } from '../types';
import { translateMessage, getConversationStarters, generateAvatar } from '../services/geminiService';

interface ChatInterfaceProps {
  userId: string;
  onBack: () => void;
}

interface ChatSettings {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  notifications: {
    sound: boolean;
    vibration: boolean;
  };
}

const DEFAULT_SETTINGS: ChatSettings = {
  theme: 'light',
  fontSize: 'medium',
  notifications: {
    sound: true,
    vibration: true
  }
};

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥'];
const QUICK_REPLIES = ['Great!', 'Tell me more', 'I can help with that.'];
const SUPPORTED_LANGUAGES = ['English', 'Japanese', 'Spanish', 'French', 'German', 'Chinese', 'Italian', 'Portuguese', 'Hindi', 'Arabic', 'Korean', 'Russian'];

const STYLES = ['Cartoon', 'Realistic', '3D Render', 'Pixel Art', 'Watercolor', 'Anime', 'Cyberpunk', 'Oil Painting', 'Sketch', 'Retro', 'Pop Art', 'Minimalist'];
const MOODS = ['Cheerful', 'Serious', 'Mysterious', 'Energetic', 'Calm', 'Whimsical', 'Dark', 'Peaceful', 'Dramatic', 'Playful'];
const PALETTES = ['Vibrant', 'Pastel', 'Dark', 'Monochrome', 'Warm', 'Cool', 'Neon', 'Earth Tones', 'High Contrast', 'Muted'];
const HAIR_STYLES = ['Short', 'Long', 'Curly', 'Bald', 'Mohawk', 'Bob', 'Spiky', 'Wavy', 'Ponytail', 'Braids'];
const CLOTHING = ['Casual', 'Formal', 'Futuristic', 'Vintage', 'Streetwear', 'Business', 'Fantasy Armor', 'Hoodie', 'T-Shirt', 'Suit'];
const ACCESSORIES = ['Glasses', 'Sunglasses', 'Hat', 'Headphones', 'Jewelry', 'Scarf', 'Mask', 'Piercings', 'Bandana', 'None'];

// Helper to escape regex special characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

// Helper to highlight matching text
const highlightText = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    try {
        const escapedQuery = escapeRegExp(query);
        const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
        return parts.map((part, index) => 
            part.toLowerCase() === query.toLowerCase() ? 
                <mark key={index} className="bg-amber-200 text-slate-900 rounded-sm px-0.5">{part}</mark> : 
                part
        );
    } catch (e) {
        return text;
    }
};

// Helper to get font size class
const getFontSizeClass = (size: 'small' | 'medium' | 'large') => {
    switch(size) {
        case 'small': return 'text-xs';
        case 'large': return 'text-base md:text-lg';
        default: return 'text-sm md:text-base';
    }
};

// Sound Effect Helper
const playNotificationSound = () => {
    try {
        // Using a short, pleasant "pop" sound from a CDN
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.warn('Audio play blocked', e));
    } catch (e) {
        console.error("Audio error", e);
    }
};

// Settings Modal Component
const SettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    settings: ChatSettings;
    onSave: (newSettings: ChatSettings) => void;
}> = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [isOpen, settings]);

    if (!isOpen) return null;

    const isDark = localSettings.theme === 'dark';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className={`rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <span>⚙️</span> Chat Settings
                        </h3>
                        <button onClick={onClose} className={`p-1 rounded-full transition ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>✕</button>
                    </div>

                    {/* Theme */}
                    <div className="mb-6">
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Appearance</label>
                        <div className={`flex gap-2 p-1 rounded-xl ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                            {['light', 'dark'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setLocalSettings({...localSettings, theme: t as any})}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all flex items-center justify-center gap-2 
                                    ${localSettings.theme === t 
                                        ? (isDark ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'bg-white text-indigo-600 shadow-sm')
                                        : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                                >
                                    <span>{t === 'light' ? '☀️' : '🌙'}</span>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Size */}
                    <div className="mb-6">
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Font Size</label>
                        <div className={`rounded-xl p-4 border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex items-center justify-between px-1 mb-2">
                                <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Small</span>
                                <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Large</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="2" 
                                step="1" 
                                value={localSettings.fontSize === 'small' ? 0 : localSettings.fontSize === 'medium' ? 1 : 2}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    const size = val === 0 ? 'small' : val === 1 ? 'medium' : 'large';
                                    setLocalSettings({...localSettings, fontSize: size});
                                }}
                                className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-600 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                            />
                            <div className={`flex justify-between mt-3 items-end ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                <span className={`transition-all ${localSettings.fontSize === 'small' ? 'text-indigo-500 font-bold scale-110' : 'opacity-50'} text-xs`}>Aa</span>
                                <span className={`transition-all ${localSettings.fontSize === 'medium' ? 'text-indigo-500 font-bold scale-110' : 'opacity-50'} text-sm`}>Aa</span>
                                <span className={`transition-all ${localSettings.fontSize === 'large' ? 'text-indigo-500 font-bold scale-110' : 'opacity-50'} text-lg`}>Aa</span>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="mb-8">
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Notifications</label>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${localSettings.notifications.sound ? 'bg-indigo-100 text-indigo-600' : (isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400')}`}>
                                        🔊
                                    </div>
                                    <span className={`font-medium text-sm transition ${isDark ? 'text-slate-300 group-hover:text-indigo-400' : 'text-slate-700 group-hover:text-indigo-600'}`}>Play Sound</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {localSettings.notifications.sound && (
                                        <button 
                                            onClick={(e) => { e.preventDefault(); playNotificationSound(); }}
                                            className={`text-xs font-bold px-2 py-1 rounded transition ${isDark ? 'bg-slate-700 text-indigo-300 hover:bg-slate-600' : 'bg-slate-200 text-indigo-600 hover:bg-slate-300'}`}
                                        >
                                            Test
                                        </button>
                                    )}
                                    <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${localSettings.notifications.sound ? 'bg-indigo-600' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${localSettings.notifications.sound ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={localSettings.notifications.sound}
                                    onChange={(e) => setLocalSettings({
                                        ...localSettings, 
                                        notifications: {...localSettings.notifications, sound: e.target.checked}
                                    })}
                                />
                            </label>
                            
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${localSettings.notifications.vibration ? 'bg-indigo-100 text-indigo-600' : (isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400')}`}>
                                        📳
                                    </div>
                                    <span className={`font-medium text-sm transition ${isDark ? 'text-slate-300 group-hover:text-indigo-400' : 'text-slate-700 group-hover:text-indigo-600'}`}>Vibration</span>
                                </div>
                                <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${localSettings.notifications.vibration ? 'bg-indigo-600' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${localSettings.notifications.vibration ? 'translate-x-5' : ''}`}></div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={localSettings.notifications.vibration}
                                    onChange={(e) => setLocalSettings({
                                        ...localSettings, 
                                        notifications: {...localSettings.notifications, vibration: e.target.checked}
                                    })}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className={`flex-1 py-3 font-bold rounded-xl transition border ${isDark ? 'text-slate-300 border-slate-700 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50 border-slate-200'}`}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => { onSave(localSettings); onClose(); }}
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal for Report
const ReportModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void }> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        ⚠️
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Report User?</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        If this user is violating community guidelines, please let us know. We review all reports within 24 hours.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition border border-slate-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => { onConfirm(); onClose(); }}
                            className="flex-1 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-500/30"
                        >
                            Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal for Call History
const CallHistoryModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    logs: CallLog[];
}> = ({ isOpen, onClose, logs }) => {
    const [playingId, setPlayingId] = useState<string | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">Call History</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition">
                        ✕
                    </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-3">
                    {logs.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">No past calls found.</p>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="flex flex-col p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${log.status === 'missed' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {log.type === 'video' ? '📹' : '📞'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {log.direction === 'outgoing' ? 'Outgoing Call' : 'Incoming Call'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(log.timestamp).toLocaleDateString()} • {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-medium ${log.status === 'missed' ? 'text-red-500' : 'text-slate-600'}`}>
                                            {log.status === 'missed' ? 'Missed' : log.duration}
                                        </p>
                                        <p className="text-[10px] text-slate-400 capitalize">{log.status}</p>
                                    </div>
                                </div>
                                {log.recordingUrl && (
                                    <div className="mt-2 ml-11">
                                        {playingId === log.id ? (
                                            <video 
                                                src={log.recordingUrl} 
                                                controls 
                                                autoPlay 
                                                className="w-full rounded-lg border border-slate-200 mt-2 bg-black"
                                            />
                                        ) : (
                                            <button 
                                                onClick={() => setPlayingId(log.id)}
                                                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-700 transition shadow-sm"
                                            >
                                                <span>▶</span> Play Recording
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Modal for Scheduling Call
const ScheduleModal: React.FC<{ isOpen: boolean; onClose: () => void; onSchedule: (date: string, type: 'video' | 'audio') => void }> = ({ isOpen, onClose, onSchedule }) => {
    const [date, setDate] = useState('');
    const [type, setType] = useState<'video' | 'audio'>('video');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Schedule Call</h3>
                    <p className="text-sm text-slate-500 mb-4">Choose a call type and time to connect.</p>

                    <div className="flex gap-3 mb-4">
                        <label className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 transition ${type === 'video' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            <input type="radio" name="callType" value="video" checked={type === 'video'} onChange={() => setType('video')} className="hidden" />
                            <span>📹</span> <span className="font-bold text-sm">Video</span>
                        </label>
                        <label className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 transition ${type === 'audio' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            <input type="radio" name="callType" value="audio" checked={type === 'audio'} onChange={() => setType('audio')} className="hidden" />
                            <span>📞</span> <span className="font-bold text-sm">Audio</span>
                        </label>
                    </div>

                    <input 
                        type="datetime-local" 
                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-4 bg-slate-50"
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                if(date) {
                                    onSchedule(date, type);
                                    onClose();
                                }
                            }} 
                            disabled={!date}
                            className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Modal for Unsend Confirmation
const UnsendModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void }> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        🗑️
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Unsend Message?</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Are you sure you want to remove this message? This action can only be done within 30 seconds of sending.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition border border-slate-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30"
                        >
                            Unsend
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal for Avatar Generation
const AvatarGeneratorModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (avatarUrl: string) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Refinement states
    const [style, setStyle] = useState('');
    const [mood, setMood] = useState('');
    const [palette, setPalette] = useState('');
    const [hairStyle, setHairStyle] = useState('');
    const [clothing, setClothing] = useState('');
    const [accessory, setAccessory] = useState('');
    const [refinement, setRefinement] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPrompt('');
            setGeneratedImage(null);
            setStyle('');
            setMood('');
            setPalette('');
            setHairStyle('');
            setClothing('');
            setAccessory('');
            setRefinement('');
            setIsLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        
        let finalPrompt = prompt;
        if (style) finalPrompt += `, ${style} style`;
        if (mood) finalPrompt += `, ${mood} mood`;
        if (palette) finalPrompt += `, ${palette} color palette`;
        if (hairStyle) finalPrompt += `, ${hairStyle} hair`;
        if (clothing) finalPrompt += `, wearing ${clothing}`;
        if (accessory && accessory !== 'None') finalPrompt += `, with ${accessory}`;
        
        if (refinement) finalPrompt += `. Refinements: ${refinement}`;
        
        const image = await generateAvatar(finalPrompt);
        if (image) {
            setGeneratedImage(image);
        } else {
            alert("Failed to generate avatar. Please try again or check your API key.");
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shrink-0">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        ✨ AI Avatar Studio
                    </h3>
                    <p className="text-indigo-100 text-sm opacity-90">Create a unique profile picture with magic.</p>
                </div>
                
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Describe your avatar</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50"
                            placeholder="e.g. A friendly wise owl wearing glasses, digital art style..."
                            rows={3}
                        />
                    </div>

                    {/* Refinement Controls */}
                    <div className="animate-fadeIn space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Style</label>
                                <select 
                                    value={style} 
                                    onChange={(e) => setStyle(e.target.value)}
                                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Default</option>
                                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mood</label>
                                <select 
                                    value={mood} 
                                    onChange={(e) => setMood(e.target.value)}
                                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Default</option>
                                    {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Palette</label>
                                <select 
                                    value={palette} 
                                    onChange={(e) => setPalette(e.target.value)}
                                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Default</option>
                                    {PALETTES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hair Style</label>
                                <select 
                                    value={hairStyle} 
                                    onChange={(e) => setHairStyle(e.target.value)}
                                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Default</option>
                                    {HAIR_STYLES.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clothing</label>
                                <select 
                                    value={clothing} 
                                    onChange={(e) => setClothing(e.target.value)}
                                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Default</option>
                                    {CLOTHING.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Accessories</label>
                                <select 
                                    value={accessory} 
                                    onChange={(e) => setAccessory(e.target.value)}
                                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Default</option>
                                    {ACCESSORIES.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <input 
                                type="text" 
                                value={refinement}
                                onChange={(e) => setRefinement(e.target.value)}
                                placeholder="Specific tweaks (e.g. add glasses, make background blue)..."
                                className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center min-h-[200px] items-center bg-slate-50 rounded-xl border border-dashed border-slate-300 relative overflow-hidden group">
                        {generatedImage && (
                            <img 
                                src={generatedImage} 
                                alt="Generated Avatar" 
                                className={`w-full h-full object-cover transition-all duration-300 ${isLoading ? 'opacity-50 blur-sm scale-105' : 'scale-100'}`} 
                            />
                        )}
                        
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
                                <p className="text-sm text-indigo-600 font-medium animate-pulse">Conjuring pixel magic...</p>
                            </div>
                        )}

                        {!generatedImage && !isLoading && (
                            <div className="text-center text-slate-400">
                                <span className="text-4xl mb-2 block">🎨</span>
                                <p className="text-sm">Preview will appear here</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            onClick={onClose} 
                            className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition border border-slate-200"
                        >
                            Cancel
                        </button>
                        {generatedImage ? (
                            <>
                                <button 
                                    onClick={handleGenerate}
                                    disabled={!prompt.trim() || isLoading}
                                    className="flex-1 py-3 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition disabled:opacity-50"
                                >
                                    Regenerate
                                </button>
                                <button 
                                    onClick={() => { onSave(generatedImage); onClose(); }}
                                    className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-600/30"
                                >
                                    Use Avatar
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || isLoading}
                                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Generate
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component for individual message handling
const MessageBubble: React.FC<{ 
    msg: ChatMessage; 
    isMe: boolean; 
    isLastMyMessage: boolean;
    onTranslate: (id: string, text: string) => void; 
    onReact: (id: string, emoji: string) => void;
    onQuickReply: (text: string) => void;
    onUnsend: (id: string) => void;
    onReply: (msg: ChatMessage) => void;
    targetLanguage: string;
    searchQuery: string;
    otherUserName: string;
    settings: ChatSettings;
}> = ({ msg, isMe, isLastMyMessage, onTranslate, onReact, onQuickReply, onUnsend, onReply, targetLanguage, searchQuery, otherUserName, settings }) => {
    const [showOriginal, setShowOriginal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [canUnsend, setCanUnsend] = useState(false);
    
    // Audio Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [duration, setDuration] = useState(msg.audioDuration || 0);
    const audioRef = useRef<HTMLAudioElement>(null);
    
    // Long Press Logic
    const longPressTimer = useRef<any>(null);
    const isLongPress = useRef(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (pickerRef.current && !pickerRef.current.contains(target as Node) && !target.closest('.emoji-trigger')) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const startPress = () => {
        isLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            setShowEmojiPicker(true);
            if (navigator.vibrate && settings.notifications.vibration) navigator.vibrate(50);
        }, 500);
    };

    const cancelPress = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleTouchStart = () => startPress();
    const handleTouchEnd = (e: React.TouchEvent) => {
        cancelPress();
        if (isLongPress.current) e.preventDefault();
    };
    const handleTouchMove = () => cancelPress(); // Cancel on scroll
    const handleMouseDown = () => startPress();
    const handleMouseUp = () => cancelPress();
    const handleMouseLeave = () => cancelPress();

    useEffect(() => {
        if (searchQuery && msg.originalText && msg.originalText.toLowerCase().includes(searchQuery.toLowerCase())) {
            setShowOriginal(true);
        }
    }, [searchQuery, msg.originalText]);

    useEffect(() => {
        if (isMe && isLastMyMessage) {
            const checkRecallable = () => {
                const diff = Date.now() - msg.timestamp;
                setCanUnsend(diff < 30000); 
            };
            
            checkRecallable();
            const interval = setInterval(checkRecallable, 1000);
            return () => clearInterval(interval);
        } else {
            setCanUnsend(false);
        }
    }, [isMe, isLastMyMessage, msg.timestamp]);

    const handleAddToCalendar = (dateStr: string) => {
        const startDate = new Date(dateStr);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        
        const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
        
        const start = formatDate(startDate);
        const end = formatDate(endDate);
        const isVideo = msg.callType !== 'audio';
        const title = encodeURIComponent(isVideo ? "BridgeMe Video Call" : "BridgeMe Audio Call");
        const details = encodeURIComponent(`${isVideo ? 'Video' : 'Audio'} call scheduled via BridgeMe app.`);
        
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
        window.open(url, '_blank');
    };
    
    const toggleAudioPlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    
    const handleTimeUpdate = () => {
        if (audioRef.current && audioRef.current.duration) {
            const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setAudioProgress(progress || 0);
        }
    };
    
    const handleAudioEnded = () => {
        setIsPlaying(false);
        setAudioProgress(0);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current && isFinite(audioRef.current.duration)) {
             if (!duration) setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (audioRef.current && duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.min(Math.max(0, x / rect.width), 1);
            const newTime = percentage * duration;
            
            if (isFinite(newTime)) {
                audioRef.current.currentTime = newTime;
                setAudioProgress(percentage * 100);
            }
        }
    };

    if (msg.type === 'call_log') {
        return (
            <div className="flex justify-center mb-6 w-full animate-fade-in-up">
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-500 px-4 py-1.5 rounded-full text-xs font-medium shadow-sm">
                    <span>{msg.callType === 'video' ? '📹' : '📞'}</span>
                    <span>{msg.text}</span>
                </div>
            </div>
        );
    }

    if (msg.type === 'scheduled_call') {
        const isVideo = msg.callType !== 'audio';
        return (
            <div className="flex justify-center mb-6 w-full animate-fade-in-up">
                <div className={`border rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm max-w-xs w-full ${settings.theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${isVideo ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {isVideo ? '📹' : '📞'}
                    </div>
                    <div className="text-center">
                        <p className={`text-sm font-semibold ${settings.theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{isVideo ? 'Video' : 'Audio'} Call Scheduled</p>
                        <p className={`text-xs ${settings.theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {new Date(msg.scheduledTime!).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                            {' at '}
                            {new Date(msg.scheduledTime!).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <button 
                        onClick={() => msg.scheduledTime && handleAddToCalendar(msg.scheduledTime)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full mt-1 hover:shadow-sm transition ${settings.theme === 'dark' ? 'bg-slate-700 text-indigo-400 border border-slate-600 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200'}`}
                    >
                        Add to Calendar
                    </button>
                    <div className={`text-[10px] mt-1 ${settings.theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Scheduled by {isMe ? 'You' : 'Sender'}
                    </div>
                </div>
            </div>
        );
    }

    const groupedReactions = (msg.reactions || []).reduce((acc, r) => {
        if (!acc[r.emoji]) {
            acc[r.emoji] = { count: 0, hasReacted: false };
        }
        acc[r.emoji].count += 1;
        if (r.userId === 'me') {
            acc[r.emoji].hasReacted = true;
        }
        return acc;
    }, {} as Record<string, { count: number; hasReacted: boolean }>);

    const hasReactions = Object.keys(groupedReactions).length > 0;
    
    // Dynamic styling based on theme
    const bubbleClass = isMe 
        ? 'bg-indigo-600 text-white rounded-br-none' 
        : `${settings.theme === 'dark' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-white text-slate-800 border border-slate-100'} rounded-bl-none`;
        
    const textSizeClass = getFontSizeClass(settings.fontSize);

    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`relative max-w-[85%] md:max-w-[70%] group flex flex-col items-${isMe ? 'end' : 'start'}`}>
                
                <div 
                    className={`rounded-2xl px-4 py-3 shadow-sm relative transition-all cursor-pointer select-none touch-none ${bubbleClass}`}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onContextMenu={(e) => isLongPress.current && e.preventDefault()}
                >
                    
                    {msg.replyTo && (
                        <div className={`mb-2 p-2 rounded-lg border-l-4 text-xs cursor-pointer opacity-90
                            ${isMe 
                                ? 'bg-indigo-700/50 border-indigo-300 text-indigo-100' 
                                : settings.theme === 'dark' 
                                    ? 'bg-slate-700/50 border-slate-500 text-slate-400' 
                                    : 'bg-slate-100 border-slate-300 text-slate-500'}`}
                        >
                            <p className="font-bold mb-0.5">{msg.replyTo.senderId === 'me' ? 'You' : otherUserName}</p>
                            <p className="line-clamp-1 truncate">{msg.replyTo.text}</p>
                        </div>
                    )}

                    {msg.type === 'image' && msg.imageUrl ? (
                        <div className="mb-1">
                            <img 
                                src={msg.imageUrl} 
                                alt="Uploaded content" 
                                className="rounded-lg max-w-full max-h-64 object-cover border border-white/20" 
                            />
                        </div>
                    ) : msg.type === 'audio' && msg.audioUrl ? (
                        <div className="flex items-center gap-3 min-w-[200px] py-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleAudioPlay(); }}
                                className={`p-2 rounded-full transition-colors flex-shrink-0 ${isMe ? 'bg-white/20 hover:bg-white/30' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
                            >
                                {isPlaying ? (
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                ) : (
                                    <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                )}
                            </button>
                            <div className="flex-1 flex flex-col gap-1">
                                <div 
                                    className={`h-1.5 rounded-full overflow-hidden w-full cursor-pointer ${isMe ? 'bg-white/30' : 'bg-slate-200'}`}
                                    onClick={handleSeek}
                                >
                                    <div 
                                        className={`h-full transition-all duration-100 ${isMe ? 'bg-white' : 'bg-indigo-500'}`} 
                                        style={{width: `${audioProgress}%`}}
                                    ></div>
                                </div>
                                <span className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {duration ? `${Math.floor(duration / 60)}:${(Math.floor(duration) % 60).toString().padStart(2, '0')}` : '0:00'}
                                </span>
                            </div>
                            <audio 
                                ref={audioRef} 
                                src={msg.audioUrl} 
                                onTimeUpdate={handleTimeUpdate} 
                                onEnded={handleAudioEnded}
                                onLoadedMetadata={handleLoadedMetadata}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className={msg.isTranslated ? 'animate-[pulse_1s_ease-in-out_1]' : ''}>
                            <p className={`${textSizeClass} leading-relaxed whitespace-pre-wrap break-words`}>
                                {highlightText(msg.text, searchQuery)}
                            </p>
                        </div>
                    )}
                    
                    {msg.isTranslated && (
                        <div className={`mt-2 pt-2 border-t ${isMe ? 'border-indigo-400/30' : settings.theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                            <div className="flex items-center justify-between gap-4">
                                <div className={`flex items-center gap-1.5 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Translated</span>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowOriginal(!showOriginal); }}
                                    className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors flex items-center gap-1 border
                                    ${isMe 
                                        ? 'bg-indigo-700/50 text-indigo-100 hover:bg-indigo-700 hover:text-white border-indigo-500/50' 
                                        : settings.theme === 'dark'
                                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'}`}
                                >
                                    {showOriginal ? 'Hide Original' : 'Show Original'}
                                    <span className={`transform transition-transform duration-200 ${showOriginal ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                            </div>
                            
                            {showOriginal && (
                                 <div className={`text-xs italic animate-fadeIn whitespace-pre-wrap break-words p-3 rounded-lg border mt-2 shadow-inner
                                    ${isMe 
                                        ? 'bg-indigo-800/40 border-indigo-500/30 text-indigo-50' 
                                        : settings.theme === 'dark'
                                            ? 'bg-slate-900/50 border-slate-700 text-slate-400'
                                            : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                     {highlightText(msg.originalText!, searchQuery)}
                                 </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                    <div 
                        ref={pickerRef}
                        className={`absolute bottom-full mb-2 z-20 flex gap-1 p-1 rounded-full border shadow-lg animate-scale-in
                            ${isMe ? 'right-0' : 'left-0'}
                            ${settings.theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
                        style={{ minWidth: 'max-content' }}
                    >
                        {REACTION_EMOJIS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReact(msg.id, emoji);
                                    setShowEmojiPicker(false);
                                }}
                                className={`p-2 rounded-full text-xl transition hover:scale-125
                                    ${settings.theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                            >
                                {emoji}
                            </button>
                        ))}
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(false); }}
                            className="p-2 rounded-full text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Reactions */}
                {hasReactions && (
                    <div className={`mt-1 flex flex-wrap gap-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {Object.entries(groupedReactions).map(([emoji, data]: [string, { count: number; hasReacted: boolean }]) => (
                            <button
                                key={emoji}
                                onClick={() => onReact(msg.id, emoji)}
                                className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 transition-all shadow-sm
                                    ${settings.theme === 'dark' 
                                        ? (data.hasReacted ? 'bg-indigo-900/50 border-indigo-700 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700') 
                                        : (data.hasReacted ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')
                                    }`}
                            >
                                <span>{emoji}</span>
                                <span className="font-semibold text-[10px]">{data.count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Persistent Timestamp Below Message */}
                <div className={`text-[10px] font-medium mt-1 select-none transition-colors duration-300
                    ${isMe ? 'text-right mr-1' : 'text-left ml-1'} 
                    ${settings.theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </div>

                {!isMe && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5 ml-1">
                        {/* Translate Button - Added for visibility */}
                        {!msg.isTranslated && msg.type === 'text' && (
                            <button
                                onClick={() => onTranslate(msg.id, msg.text)}
                                disabled={msg.isTranslating}
                                className={`text-[10px] font-medium px-2.5 py-1 rounded-full border shadow-sm transition-all whitespace-nowrap flex items-center gap-1
                                    ${settings.theme === 'dark' 
                                        ? 'bg-slate-800 text-indigo-300 border-slate-700 hover:bg-indigo-900' 
                                        : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}`}
                            >
                                {msg.isTranslating ? (
                                    <>
                                        <span className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin"></span>
                                        <span>Translating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🌐</span>
                                        <span>Translate</span>
                                    </>
                                )}
                            </button>
                        )}

                        {QUICK_REPLIES.map(reply => (
                            <button
                                key={reply}
                                onClick={() => onQuickReply(reply)}
                                className={`text-[10px] font-medium px-2.5 py-1 rounded-full border shadow-sm transition-all whitespace-nowrap
                                    ${settings.theme === 'dark' 
                                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-indigo-900 hover:text-indigo-300 hover:border-indigo-700' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'}`}
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                )}

                <div className={`absolute top-0 ${isMe ? '-left-16' : '-right-16'} h-full flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-2`}>
                    <div className="relative">
                        <button
                            onClick={() => onReply(msg)}
                            className={`p-1.5 shadow-sm rounded-full transition hover:scale-110 border
                                ${settings.theme === 'dark' 
                                    ? 'bg-slate-800 text-slate-400 hover:text-indigo-400 border-slate-700' 
                                    : 'bg-white text-slate-500 hover:text-indigo-600 border-slate-200'}`}
                            title="Reply"
                        >
                            ↩️
                        </button>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`emoji-trigger p-1.5 shadow-sm rounded-full transition hover:scale-110 border
                                ${settings.theme === 'dark' 
                                    ? 'bg-slate-800 text-slate-400 hover:text-amber-500 border-slate-700' 
                                    : 'bg-white text-slate-500 hover:text-amber-500 border-slate-200'}`}
                            title="Add Reaction"
                        >
                            😀
                        </button>
                    </div>

                    {isMe && canUnsend && (
                        <div className="relative">
                            <button
                                onClick={() => onUnsend(msg.id)}
                                className={`unsend-trigger p-1.5 shadow-sm rounded-full transition hover:scale-110 border
                                    ${settings.theme === 'dark' 
                                        ? 'bg-slate-800 text-slate-400 hover:text-red-500 border-slate-700' 
                                        : 'bg-white text-slate-500 hover:text-red-500 border-slate-200'}`}
                                title="Unsend Message"
                            >
                                🗑️
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Audio Call Overlay Component
const AudioCallOverlay: React.FC<{ user: UserProfile; onEndCall: (duration: number) => void }> = ({ user, onEndCall }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setDuration(d => d + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const startMedia = async () => {
            try {
                // Audio only
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                streamRef.current = stream;
            } catch (err) {
                console.error("Failed to access microphone", err);
            }
        };

        startMedia();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => track.enabled = !isMuted);
        }
    }, [isMuted]);

    const handleBluetoothSwitch = async () => {
        try {
            // @ts-ignore
            if (navigator.mediaDevices && navigator.mediaDevices.selectAudioOutput) {
                 // @ts-ignore
                 await navigator.mediaDevices.selectAudioOutput();
            } else {
                 alert("Bluetooth/Audio Output switching is not supported by this browser. Please change your system settings.");
            }
        } catch (e) {
            console.error("Audio Output Error", e);
        }
    };

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-between p-6 animate-fadeIn">
             {/* Header */}
             <div className="w-full flex justify-between items-center text-white/60 px-4">
                 <div className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                     <span className="text-sm font-medium tracking-wide">AUDIO CALL</span>
                 </div>
                 <div className="text-lg font-mono font-medium">{formatTime(duration)}</div>
                 <div className="text-sm flex items-center gap-1">
                     <span>🔒</span> Encrypted
                 </div>
             </div>
 
             <div className="flex-1 w-full flex flex-col items-center justify-center relative">
                 <div className="relative mb-8">
                      <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 duration-[2000ms]"></div>
                      <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-10 delay-700 duration-[2000ms]"></div>
                      <img 
                         src={user.avatar} 
                         alt="" 
                         className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-slate-700 shadow-2xl relative z-10" 
                      />
                 </div>
                 <h2 className="text-3xl font-bold text-white mb-2">{user.name}</h2>
                 <p className="text-indigo-400 font-medium">BridgeMe Audio...</p>
             </div>
 
             {/* Controls */}
             <div className="flex items-center gap-6 md:gap-12 bg-slate-800/90 backdrop-blur-xl px-12 py-6 rounded-3xl shadow-2xl border border-white/5">
                 <div className="flex flex-col items-center gap-2">
                     <button 
                         onClick={() => setIsMuted(!isMuted)}
                         className={`p-5 rounded-full transition-all text-xl ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-700/50 text-white hover:bg-slate-600'}`}
                     >
                         {isMuted ? '🔇' : '🎤'}
                     </button>
                     <span className="text-xs text-slate-400 font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
                 </div>

                 <div className="flex flex-col items-center gap-2">
                     <button 
                         onClick={handleBluetoothSwitch}
                         className="p-5 rounded-full transition-all text-xl bg-slate-700/50 text-white hover:bg-slate-600"
                         title="Switch Audio Output / Bluetooth"
                     >
                         <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/></svg>
                     </button>
                     <span className="text-xs text-slate-400 font-medium">Bluetooth</span>
                 </div>
                 
                 <div className="flex flex-col items-center gap-2">
                     <button 
                         onClick={() => onEndCall(duration)}
                         className="p-6 rounded-full bg-red-500 text-white hover:bg-red-600 transform hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/40"
                     >
                         <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.36 7.46 6 12 6s8.66 2.36 11.71 5.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
                     </button>
                     <span className="text-xs text-slate-400 font-medium">End</span>
                 </div>
             </div>
         </div>
    );
};

// Video Call Overlay Component
const VideoCallOverlay: React.FC<{ user: UserProfile; myAvatar: string; onEndCall: (duration: number, recordingUrl?: string) => void }> = ({ user, myAvatar, onEndCall }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    
    // Using a stock video to simulate a remote person talking
    const REMOTE_VIDEO_URL = "https://videos.pexels.com/video-files/3252033/3252033-uhd_2560_1440_25fps.mp4";

    useEffect(() => {
        const timer = setInterval(() => setDuration(d => d + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const startMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Failed to access media devices", err);
                setIsCameraOff(true); // Fallback state
            }
        };

        startMedia();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => track.enabled = !isMuted);
        }
    }, [isMuted]);

    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach(track => track.enabled = !isCameraOff);
        }
    }, [isCameraOff]);

    const handleBluetoothSwitch = async () => {
        try {
            // @ts-ignore
            if (navigator.mediaDevices && navigator.mediaDevices.selectAudioOutput) {
                 // @ts-ignore
                 await navigator.mediaDevices.selectAudioOutput();
            } else {
                 alert("Bluetooth/Audio Output switching is not supported by this browser. Please change your system settings.");
            }
        } catch (e) {
            console.error("Audio Output Error", e);
        }
    };

    const startRecording = () => {
        if (streamRef.current) {
            chunksRef.current = [];
            try {
                const recorder = new MediaRecorder(streamRef.current);
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data);
                };
                recorder.start();
                mediaRecorderRef.current = recorder;
                setIsRecording(true);
            } catch (e) {
                console.error("Recording failed", e);
                alert("Could not start recording. Browser support issue?");
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleEndCallWrapper = () => {
        if (isRecording && mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                onEndCall(duration, url);
            };
            mediaRecorderRef.current.stop();
        } else if (chunksRef.current.length > 0) {
             const blob = new Blob(chunksRef.current, { type: 'video/webm' });
             const url = URL.createObjectURL(blob);
             onEndCall(duration, url);
        } else {
            onEndCall(duration);
        }
    };

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-between p-6 animate-fadeIn">
             {/* Header */}
             <div className="w-full flex justify-between items-center text-white/60 px-4 relative z-20">
                 <div className="flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                     <span className="text-sm font-medium tracking-wide">{isRecording ? 'RECORDING' : 'LIVE'}</span>
                 </div>
                 <div className="text-lg font-mono font-medium">{formatTime(duration)}</div>
                 <div className="text-sm flex items-center gap-1">
                     <span>🔒</span> Encrypted
                 </div>
             </div>
 
             <div className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-800 rounded-3xl my-4 shadow-2xl border border-white/5">
                 {/* Remote Video (Simulated Feed) */}
                 <div className="absolute inset-0 w-full h-full z-0">
                     <video 
                        src={REMOTE_VIDEO_URL}
                        autoPlay
                        loop
                        muted // Mute remote to avoid noise in demo
                        playsInline
                        className="w-full h-full object-cover"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20"></div>
                 </div>

                 {/* User Info Overlay */}
                 <div className="relative z-10 flex flex-col items-center mt-auto mb-20 md:mb-10">
                     <div className="relative mb-2">
                          <img 
                             src={user.avatar} 
                             alt="" 
                             className="w-16 h-16 rounded-full object-cover border-2 border-white/50 shadow-lg" 
                          />
                     </div>
                     <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                     <p className="text-indigo-200 text-sm font-medium">BridgeMe Video Call...</p>
                 </div>
 
                 {/* Self View (PIP) */}
                 <div className="absolute top-4 right-4 md:top-6 md:right-6 w-32 h-44 md:w-48 md:h-64 bg-slate-900 rounded-2xl border-2 border-white/10 overflow-hidden shadow-2xl relative z-20 transition-all hover:scale-105">
                     <video 
                        ref={videoRef}
                        autoPlay 
                        muted 
                        playsInline
                        className={`w-full h-full object-cover transform -scale-x-100 ${isCameraOff ? 'hidden' : 'block'}`}
                     />
                     {isCameraOff && (
                          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 text-xs gap-2">
                              <span className="text-2xl">📷</span>
                              <span>Camera Off</span>
                          </div>
                     )}
                     {isMuted && (
                        <div className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-full backdrop-blur-sm shadow-sm z-10">
                            <span className="text-white text-xs block">🔇</span>
                        </div>
                     )}
                 </div>
             </div>
 
             {/* Controls */}
             <div className="flex items-center gap-6 md:gap-8 bg-slate-800/90 backdrop-blur-xl px-8 py-5 rounded-3xl shadow-2xl border border-white/5 relative z-20">
                 <div className="flex flex-col items-center gap-2">
                     <button 
                         onClick={() => setIsMuted(!isMuted)}
                         className={`p-4 rounded-full transition-all text-xl ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-700/50 text-white hover:bg-slate-600'}`}
                     >
                         {isMuted ? '🔇' : '🎤'}
                     </button>
                     <span className="text-xs text-slate-400 font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
                 </div>
                 
                 <div className="flex flex-col items-center gap-2">
                     <button 
                         onClick={() => setIsCameraOff(!isCameraOff)}
                          className={`p-4 rounded-full transition-all text-xl ${isCameraOff ? 'bg-white text-slate-900' : 'bg-slate-700/50 text-white hover:bg-slate-600'}`}
                     >
                         {isCameraOff ? '📷' : '📹'}
                     </button>
                     <span className="text-xs text-slate-400 font-medium">{isCameraOff ? 'Video On' : 'Video Off'}</span>
                 </div>

                 <div className="flex flex-col items-center gap-2">
                     <button 
                         onClick={() => isRecording ? stopRecording() : startRecording()}
                         className={`p-4 rounded-full transition-all text-xl ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse ring-2 ring-red-500' : 'bg-slate-700/50 text-white hover:bg-slate-600'}`}
                     >
                         {isRecording ? '⏹️' : '⏺️'}
                     </button>
                     <span className="text-xs text-slate-400 font-medium">{isRecording ? 'Stop' : 'Record'}</span>
                 </div>

                 <div className="flex flex-col items-center gap-2">
                     <button 
                         onClick={handleEndCallWrapper}
                         className="p-5 rounded-full bg-red-500 text-white hover:bg-red-600 transform hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/40"
                     >
                         <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.36 7.46 6 12 6s8.66 2.36 11.71 5.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
                     </button>
                     <span className="text-xs text-slate-400 font-medium">End</span>
                 </div>
             </div>
         </div>
    );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userId, onBack }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isVideoCallActive, setVideoCallActive] = useState(false);
  const [isAudioCallActive, setAudioCallActive] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [messageToUnsend, setMessageToUnsend] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Settings State
  const [chatSettings, setChatSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Local Call History State (to support dynamic updates)
  const [localCallHistory, setLocalCallHistory] = useState<CallLog[]>([]);
  
  // AI Avatar State
  const [myAvatar, setMyAvatar] = useState(() => {
      try {
          const profile = localStorage.getItem('bridgeMe_user_profile');
          if (profile) {
              const data = JSON.parse(profile);
              return data.avatar || 'https://picsum.photos/200/200?random=99';
          }
      } catch(e) {}
      return 'https://picsum.photos/200/200?random=99';
  });
  const [showAvatarGenerator, setShowAvatarGenerator] = useState(false);
  
  // Voice Recording State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize SpeechRecognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Stop after one sentence for simple chat interactions
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    }
  }, []);

  const toggleListening = () => {
      if (isListening) {
          recognitionRef.current?.stop();
      } else {
          try {
            recognitionRef.current?.start();
            setIsListening(true);
          } catch (error) {
            console.error("Error starting speech recognition:", error);
          }
      }
  };
  
  const startAudioRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          mediaRecorder.start();
          setIsRecordingAudio(true);
          setRecordingDuration(0);
          
          recordingTimerRef.current = setInterval(() => {
              setRecordingDuration(prev => prev + 1);
          }, 1000);
          
      } catch (err) {
          console.error("Error accessing microphone:", err);
          alert("Could not access microphone for voice message.");
      }
  };

  const stopAudioRecording = (send: boolean) => {
      if (mediaRecorderRef.current && isRecordingAudio) {
          // Capture duration before clearing interval
          const finalDuration = recordingDuration;
          
          mediaRecorderRef.current.onstop = () => {
              if (send) {
                  const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                  const reader = new FileReader();
                  reader.onloadend = () => {
                      const base64Audio = reader.result as string;
                      const newMessage: ChatMessage = {
                          id: Date.now().toString(),
                          senderId: 'me',
                          text: '', // Audio messages might have empty text or a placeholder
                          timestamp: Date.now(),
                          reactions: [],
                          type: 'audio',
                          audioUrl: base64Audio,
                          audioDuration: finalDuration
                      };
                      setMessages(prev => [...prev, newMessage]);
                  };
                  reader.readAsDataURL(audioBlob);
              }
              // Stop all tracks to release microphone
              if (mediaRecorderRef.current?.stream) {
                  mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
              }
          };
          
          mediaRecorderRef.current.stop();
          setIsRecordingAudio(false);
          clearInterval(recordingTimerRef.current);
      }
  };
  
  const formatDuration = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Find the user we are chatting with
    const foundUser = MOCK_USERS.find(u => u.id === userId);
    if (foundUser) {
        setUser(foundUser);
        // Initialize local call history from mock data
        setLocalCallHistory(MOCK_CALL_LOGS.filter(log => log.participantId === userId));
    } else {
        setUser({
            id: userId,
            name: "New Connection",
            age: 50,
            role: "Gen X",
            location: "Global",
            avatar: `https://picsum.photos/200/200?random=${userId}`,
            offers: [],
            needs: [],
            bio: "A new friend found via AI."
        } as any);
    }
  }, [userId]);

  const fetchSuggestions = async () => {
        if (!user) return;
        setLoadingSuggestions(true);
        // Rich context for better AI generation
        const context = `
            User Name: ${user.name}
            Generation/Role: ${user.role}
            Location: ${user.location}
            Skills Offered: ${user.offers?.join(', ')}
            Skills Needed: ${user.needs?.join(', ')}
            Bio: ${user.bio}
            App Context: BridgeMe (Intergenerational skill swap & connection)
        `;
        try {
            const starters = await getConversationStarters(context);
            setSuggestions(starters);
        } catch (e) {
            console.error("Failed to fetch suggestions", e);
        }
        setLoadingSuggestions(false);
  };

  useEffect(() => {
    if (user) {
        setSuggestions([]); // Clear previous suggestions
        fetchSuggestions();
        
        // Initial Message (Mock)
        setMessages([
            {
                id: 'm0',
                senderId: userId,
                text: "Hello! I saw your profile. I would love to connect.",
                timestamp: Date.now() - 10000,
                reactions: [],
                type: 'text'
            }
        ]);
    }
  }, [user, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!searchQuery) {
        scrollToBottom();
    }
  }, [messages, isTyping, searchQuery, replyingTo]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText,
      timestamp: Date.now(),
      reactions: [],
      type: 'text',
      replyTo: replyingTo ? {
          id: replyingTo.id,
          text: replyingTo.text,
          senderId: replyingTo.senderId
      } : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setReplyingTo(null);
    
    // Simulate reply
    setIsTyping(true);
    setTimeout(() => {
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: userId,
        text: "That sounds wonderful! Tell me more about it.",
        timestamp: Date.now(),
        reactions: [],
        type: 'text'
      };
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
      
      // Play sound if enabled
      if (chatSettings.notifications.sound) {
          playNotificationSound();
      }
    }, 2000);
  };

  const handleRequestUnsend = (id: string) => {
      setMessageToUnsend(id);
  };

  const confirmUnsend = () => {
      if (messageToUnsend) {
          setMessages(prev => prev.filter(m => m.id !== messageToUnsend));
          setMessageToUnsend(null);
      }
  };

  const handleReportUser = () => {
      // Simulate API report
      setTimeout(() => {
          alert(`Report submitted for ${user?.name}. We will review this shortly.`);
      }, 500);
  };

  const handleTranslate = async (msgId: string, text: string) => {
    // Optimistic UI update: Set translating state
    setMessages(prev => prev.map(m => 
      m.id === msgId ? { ...m, isTranslating: true } : m
    ));

    try {
        const translated = await translateMessage(text, targetLanguage);
        
        setMessages(prev => prev.map(m => {
            if (m.id === msgId) {
                return {
                    ...m,
                    isTranslated: true,
                    isTranslating: false, // Clear loading
                    originalText: m.text,
                    text: translated
                };
            }
            return m;
        }));
    } catch (error) {
        console.error("Translation error", error);
        // Revert translating state on error
        setMessages(prev => prev.map(m => 
            m.id === msgId ? { ...m, isTranslating: false } : m
        ));
        alert("Could not translate message. Please try again.");
    }
  };

  const handleReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
        if (msg.id === msgId) {
            const currentReactions = msg.reactions || [];
            const hasReacted = currentReactions.some(r => r.emoji === emoji && r.userId === 'me');
            
            let newReactions;
            if (hasReacted) {
                // Remove reaction
                newReactions = currentReactions.filter(r => !(r.emoji === emoji && r.userId === 'me'));
            } else {
                // Add reaction
                newReactions = [...currentReactions, { emoji, userId: 'me' }];
            }
            
            return { ...msg, reactions: newReactions };
        }
        return msg;
    }));
  };

  const handleReply = (msg: ChatMessage) => {
      setReplyingTo(msg);
      // Focus input
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if(input) input.focus();
      }, 50);
  };

  const handleScheduleCall = (date: string, type: 'video' | 'audio') => {
      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId: 'me', // User initiated
          text: `${type === 'video' ? 'Video' : 'Audio'} Call Scheduled`,
          timestamp: Date.now(),
          reactions: [],
          type: 'scheduled_call',
          callType: type,
          scheduledTime: date
      };
      setMessages(prev => [...prev, newMessage]);
  };

  const handleEndCall = (type: 'video' | 'audio', duration: number, recordingUrl?: string) => {
      if (type === 'video') setVideoCallActive(false);
      else setAudioCallActive(false);

      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

      // Add to local call history
      const newLog: CallLog = {
          id: Date.now().toString(),
          participantId: user!.id,
          timestamp: new Date().toISOString(),
          duration: timeStr,
          type: type,
          status: 'completed',
          direction: 'outgoing',
          recordingUrl: recordingUrl
      };
      setLocalCallHistory(prev => [newLog, ...prev]);

      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId: 'system',
          text: `${type === 'video' ? 'Video' : 'Audio'} Call ended • ${timeStr}${recordingUrl ? ' • ⏺️ Recorded' : ''}`,
          timestamp: Date.now(),
          type: 'call_log',
          callType: type
      };
      setMessages(prev => [...prev, newMessage]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // Add basic size validation (e.g. 5MB)
          if (file.size > 5 * 1024 * 1024) {
              alert("File size too large. Please upload an image under 5MB.");
              if (fileInputRef.current) fileInputRef.current.value = '';
              return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
              const newMessage: ChatMessage = {
                  id: Date.now().toString(),
                  senderId: 'me',
                  text: 'Image Upload',
                  imageUrl: reader.result as string,
                  timestamp: Date.now(),
                  reactions: [],
                  type: 'image'
              };
              setMessages(prev => [...prev, newMessage]);
          };
          reader.readAsDataURL(file);
      }
      // Reset input
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const handleSaveAvatar = (newAvatar: string) => {
      setMyAvatar(newAvatar);
      // Persist to local storage profile if it exists, or create a partial one
      try {
          const profileStr = localStorage.getItem('bridgeMe_user_profile');
          let profile = profileStr ? JSON.parse(profileStr) : {};
          profile.avatar = newAvatar;
          localStorage.setItem('bridgeMe_user_profile', JSON.stringify(profile));
      } catch (e) {
          console.error("Failed to save avatar to profile", e);
      }
  };

  const filteredMessages = messages.filter(m => 
    m.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.originalText && m.originalText.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Find the index of the last message sent by 'me'
  const lastMyMessageId = [...messages].reverse().find(m => m.senderId === 'me')?.id;

  const isPlaceholderAvatar = myAvatar.includes('picsum') || myAvatar.includes('placeholder');

  if (!user) return <div className="p-4">Loading user profile...</div>;

  return (
    <div className={`max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col relative transition-colors duration-300 ${chatSettings.theme === 'dark' ? 'bg-slate-900' : 'bg-transparent'}`}>
      {/* Video Call Overlay */}
      {isVideoCallActive && <VideoCallOverlay user={user} myAvatar={myAvatar} onEndCall={(d, url) => handleEndCall('video', d, url)} />}
      
      {/* Audio Call Overlay */}
      {isAudioCallActive && <AudioCallOverlay user={user} onEndCall={(d) => handleEndCall('audio', d)} />}
      
      {/* Schedule Modal */}
      <ScheduleModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSchedule={handleScheduleCall} />

      {/* Call History Modal */}
      <CallHistoryModal isOpen={showCallHistory} onClose={() => setShowCallHistory(false)} logs={localCallHistory} />

      {/* Unsend Confirmation Modal */}
      <UnsendModal 
        isOpen={!!messageToUnsend} 
        onClose={() => setMessageToUnsend(null)} 
        onConfirm={confirmUnsend} 
      />
      
      {/* Report Modal */}
      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        onConfirm={handleReportUser}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={chatSettings}
        onSave={setChatSettings}
      />

      {/* AI Avatar Generator Modal */}
      <AvatarGeneratorModal 
        isOpen={showAvatarGenerator} 
        onClose={() => setShowAvatarGenerator(false)} 
        onSave={handleSaveAvatar}
      />

      {/* Chat Header */}
      <div className={`p-4 rounded-t-xl border-b flex items-center justify-between shadow-sm relative z-10 transition-colors duration-300
        ${chatSettings.theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
        <div className="flex items-center gap-3">
            <button 
                onClick={onBack} 
                className={`mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1 ${chatSettings.theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                aria-label="Go back"
            >
                ← Back
            </button>
            <div className="relative">
                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
                <h3 className={`font-bold ${chatSettings.theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{user.name}</h3>
                <p className={`text-xs ${chatSettings.theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user.location} • {user.role}</p>
            </div>
        </div>
        <div className="flex gap-2">
            <div className="relative">
                <button 
                    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border 
                    ${showLanguageSelector 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                        : chatSettings.theme === 'dark' 
                            ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-indigo-400' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                    title="Translate Chat"
                >
                    <span className="text-lg">🌐</span>
                    <span className="text-xs font-semibold hidden sm:inline">{targetLanguage}</span>
                    <span className="text-xs font-semibold sm:hidden">{targetLanguage.substring(0, 2).toUpperCase()}</span>
                    <svg className={`w-3 h-3 transition-transform ${showLanguageSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showLanguageSelector && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-scale-in">
                        <div className="p-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">Translate to</div>
                        <div className="max-h-60 overflow-y-auto">
                            {SUPPORTED_LANGUAGES.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => {
                                        setTargetLanguage(lang);
                                        setShowLanguageSelector(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition ${targetLanguage === lang ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Action Buttons */}
            {[
                { icon: '🕒', title: 'Call History', action: () => setShowCallHistory(true) },
                { icon: '🔍', title: 'Search Messages', action: () => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); } },
                { icon: '📅', title: 'Schedule Call', action: () => setShowScheduleModal(true) },
                { icon: '📞', title: 'Start Audio Call', action: () => setAudioCallActive(true) },
                { icon: '📹', title: 'Start Video Call', action: () => setVideoCallActive(true) },
                { icon: '⚠️', title: 'Report User', action: () => setShowReportModal(true), alert: true },
                { icon: '⚙️', title: 'Chat Settings', action: () => setShowSettingsModal(true) }
            ].map((btn, idx) => (
                <button
                    key={idx}
                    onClick={btn.action}
                    className={`p-2 rounded-full transition 
                        ${chatSettings.theme === 'dark' 
                            ? 'text-slate-400 hover:bg-slate-700 hover:text-white' 
                            : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'}
                        ${btn.alert ? 'hover:text-amber-500' : ''}`}
                    title={btn.title}
                >
                    {btn.icon}
                </button>
            ))}
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className={`px-4 py-2 border-b flex items-center gap-2 animate-fadeIn transition-all duration-300
            ${chatSettings.theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                <input
                    type="text"
                    placeholder="Search conversation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-9 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                        ${chatSettings.theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    autoFocus
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                    >
                        ✕
                    </button>
                )}
            </div>
            {searchQuery && (
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                    {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''}
                </span>
            )}
        </div>
      )}

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 transition-colors duration-300 ${chatSettings.theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {filteredMessages.length === 0 && searchQuery ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
                 <span className="text-2xl mb-2">🔍</span>
                 <p className="text-sm">No messages found matching "{searchQuery}"</p>
             </div>
        ) : (
            filteredMessages.map((msg) => (
                <MessageBubble 
                    key={msg.id} 
                    msg={msg} 
                    isMe={msg.senderId === 'me'}
                    isLastMyMessage={msg.id === lastMyMessageId}
                    onTranslate={handleTranslate} 
                    onReact={handleReaction}
                    onQuickReply={setInputText}
                    onUnsend={handleRequestUnsend}
                    onReply={handleReply}
                    targetLanguage={targetLanguage}
                    searchQuery={searchQuery}
                    otherUserName={user.name}
                    settings={chatSettings}
                />
            ))
        )}
        
        {isTyping && !searchQuery && (
             <div className="flex justify-start mb-4 ml-1 animate-fade-in-up">
                <div className={`border rounded-full px-4 py-3 flex items-center gap-1.5 shadow-sm 
                    ${chatSettings.theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Smart Suggestions */}
      {!searchQuery && (
          <div className={`px-4 py-2 flex items-center gap-2 overflow-x-auto border-t no-scrollbar transition-colors duration-300
            ${chatSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-center shrink-0 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white text-[10px]" title="AI Suggested Starters">
                  ✨
              </div>
              
              {loadingSuggestions ? (
                  <div className="flex gap-2">
                      <div className={`h-6 w-24 rounded-full animate-pulse ${chatSettings.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                      <div className={`h-6 w-32 rounded-full animate-pulse ${chatSettings.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                  </div>
              ) : (
                  <>
                    {suggestions.map((s, i) => (
                        <button 
                            key={i}
                            onClick={() => setInputText(s)}
                            className={`whitespace-nowrap px-3 py-1 text-xs font-medium rounded-full border transition shadow-sm
                                ${chatSettings.theme === 'dark' 
                                    ? 'bg-slate-800 text-indigo-300 border-slate-700 hover:bg-indigo-900 hover:border-indigo-700' 
                                    : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200'}`}
                        >
                            {s}
                        </button>
                    ))}
                    <button
                        onClick={fetchSuggestions}
                        className={`p-1 rounded-full transition hover:bg-opacity-80 shrink-0 ml-1 ${chatSettings.theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-400'}`}
                        title="Regenerate Suggestions"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  </>
              )}
          </div>
      )}

      {/* Input Area */}
      <div className={`p-4 border-t rounded-b-xl transition-colors duration-300
         ${chatSettings.theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        
        {/* Reply Preview Banner */}
        {replyingTo && (
            <div className={`flex items-center justify-between p-2 rounded-t-lg border-x border-t mb-2 animate-fade-in-up
                ${chatSettings.theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
                <div className="border-l-4 border-indigo-400 pl-3">
                    <p className="text-xs text-indigo-600 font-bold">Replying to {replyingTo.senderId === 'me' ? 'You' : user.name}</p>
                    <p className={`text-xs truncate max-w-[200px] md:max-w-md ${chatSettings.theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>{replyingTo.text}</p>
                </div>
                <button 
                    onClick={() => setReplyingTo(null)}
                    className={`p-1 rounded-full hover:bg-slate-200 transition ${chatSettings.theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-600' : 'text-slate-400'}`}
                >
                    ✕
                </button>
            </div>
        )}

        <div className="flex items-end gap-2">
            <button 
                onClick={() => setShowAvatarGenerator(true)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 hover:border-indigo-400 transition shrink-0"
                title="Customize Avatar"
            >
                <img src={myAvatar} alt="My Avatar" className="w-full h-full object-cover" />
            </button>

            <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-xl transition shrink-0
                    ${chatSettings.theme === 'dark' 
                        ? 'text-slate-400 hover:bg-slate-700 hover:text-indigo-400' 
                        : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600'}`}
                title="Upload Image"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>

            <div className="flex-1 relative">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                    }}
                    placeholder={isListening ? "Listening..." : "Type a message..."}
                    className={`w-full py-3 pl-4 pr-12 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition
                        ${chatSettings.theme === 'dark' 
                            ? 'bg-slate-700 text-white placeholder-slate-400 border border-slate-600' 
                            : 'bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200'}`}
                />
                <button
                    onClick={toggleListening}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-600'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>
            </div>

            {inputText.trim() || isRecordingAudio ? (
                <button 
                    onClick={handleSend}
                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 shrink-0"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            ) : (
                <button 
                    onMouseDown={startAudioRecording}
                    onMouseUp={() => stopAudioRecording(true)}
                    onMouseLeave={() => isRecordingAudio && stopAudioRecording(false)}
                    onTouchStart={startAudioRecording}
                    onTouchEnd={() => stopAudioRecording(true)}
                    className={`p-3 rounded-xl transition shadow-lg shrink-0 ${isRecordingAudio ? 'bg-red-500 text-white scale-110' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>
            )}
        </div>
        
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageSelect}
        />
      </div>
    </div>
  );
};

export default ChatInterface;