
import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';

interface ProfileProps {
  onNavigate: (view: string) => void;
}

interface UserData {
  name: string;
  email: string;
  role: UserRole;
  location: string;
  bio: string;
  avatar: string;
}

const ROLES = Object.values(UserRole);

const SignUpForm: React.FC<{ 
    initialData?: UserData | null; 
    onSave: (data: any) => void;
    onCancel: () => void;
    hasProfile: boolean;
}> = ({ initialData, onSave, onCancel, hasProfile }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        password: '',
        role: initialData?.role || UserRole.GEN_Z,
        location: initialData?.location || '',
        bio: initialData?.bio || '',
        avatar: initialData?.avatar || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Basic size check (e.g. 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size too large. Please choose an image under 5MB.");
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, validation and backend API call would go here.
        onSave(formData);
    };

    const handleInvite = async () => {
        const shareData = {
            title: 'Join BridgeMe',
            text: 'Connect across generations, swap skills, and find unique items on BridgeMe!',
            url: window.location.origin
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                alert("Invite link copied to clipboard! Share it with your friends.");
            } catch (err) {
                alert("Could not copy link. Please manually share: " + window.location.origin);
            }
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-w-2xl mx-auto animate-fade-in-up">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
                <h2 className="text-3xl font-extrabold mb-2">{hasProfile ? 'Edit Profile' : 'Join BridgeMe'}</h2>
                <p className="text-indigo-100">{hasProfile ? 'Update your personal details' : 'Connect across generations today.'}</p>
            </div>
            
            <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-slate-100">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl text-slate-300">
                                        👤
                                    </div>
                                )}
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-bold text-xs uppercase tracking-wide">Change</span>
                            </div>

                            {/* Camera Icon Button */}
                            <button 
                                type="button"
                                className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full border-2 border-white shadow-sm hover:bg-indigo-700 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Upload Photo</p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleAvatarUpload}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                            <input 
                                required
                                name="name"
                                type="text" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="e.g. Sarah Jenkins"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                            <input 
                                required
                                name="email"
                                type="email" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="sarah@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                            <input 
                                required={!hasProfile}
                                name="password"
                                type="password" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder={hasProfile ? "••••••••" : "Create a password"}
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Location</label>
                            <input 
                                required
                                name="location"
                                type="text" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="e.g. Austin, TX"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Generation</label>
                        <div className="relative">
                            <select 
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none cursor-pointer"
                            >
                                {ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">This helps our AI matchmaker find the best connections for you.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Bio</label>
                        <textarea 
                            name="bio"
                            required
                            rows={3}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                            placeholder="Tell us a bit about yourself, your hobbies, and what you'd like to learn or teach..."
                            value={formData.bio}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex gap-4 pt-2">
                        {hasProfile && (
                            <button 
                                type="button"
                                onClick={onCancel}
                                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition border border-slate-200"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            type="submit"
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5"
                        >
                            {hasProfile ? 'Save Changes' : 'Create Account'}
                        </button>
                    </div>
                </form>

                {/* Invite Friend Section */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-slate-500 text-sm mb-3">Know someone who would love BridgeMe?</p>
                    <button
                        type="button"
                        onClick={handleInvite}
                        className="inline-flex items-center justify-center gap-2 text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-full transition w-full sm:w-auto"
                    >
                        <span>👋</span> Invite a Friend
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfileCard: React.FC<{ 
    user: UserData; 
    onEdit: () => void; 
    onNavigate: (view: string) => void;
}> = ({ user, onEdit, onNavigate }) => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-6">
                <div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                    <button 
                        onClick={onEdit}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition"
                        title="Edit Profile"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                </div>
                
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                        <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white" 
                        />
                        <div className="mb-1">
                             <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-200">
                                {user.role}
                             </span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-1">{user.name}</h2>
                        <div className="flex items-center text-slate-500 font-medium mb-4">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {user.location}
                        </div>
                        <p className="text-slate-600 leading-relaxed max-w-2xl bg-slate-50 p-4 rounded-xl border border-slate-100">
                            {user.bio}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <button 
                            onClick={() => onNavigate('shop')}
                            className="flex items-center justify-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition group text-left"
                         >
                             <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🛍️</div>
                             <div>
                                 <h4 className="font-bold text-slate-900">Orders & Favorites</h4>
                                 <p className="text-xs text-slate-500">View your shopping history</p>
                             </div>
                         </button>
                         
                         <button 
                            onClick={() => onNavigate('smart-match')}
                            className="flex items-center justify-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition group text-left"
                         >
                             <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">✨</div>
                             <div>
                                 <h4 className="font-bold text-slate-900">AI Matchmaker</h4>
                                 <p className="text-xs text-slate-500">Update your preferences</p>
                             </div>
                         </button>
                    </div>
                </div>
            </div>
            
            <div className="text-center">
                 <button onClick={() => onNavigate('home')} className="text-slate-400 hover:text-indigo-600 font-medium text-sm transition">
                     Return to Home
                 </button>
            </div>
        </div>
    );
};

const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('bridgeMe_user_profile');
            if (saved) {
                setUserData(JSON.parse(saved));
            } else {
                setIsEditing(true);
            }
        } catch (e) {
            console.error("Failed to load profile", e);
            setIsEditing(true);
        }
    }, []);

    const handleSave = (data: any) => {
        // Keep existing avatar (if not replaced) or generate a new random one if it's a new user and none uploaded
        const newProfile = { 
            ...data, 
            avatar: data.avatar || userData?.avatar || `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}` 
        };
        
        localStorage.setItem('bridgeMe_user_profile', JSON.stringify(newProfile));
        setUserData(newProfile);
        setIsEditing(false);
        alert("Profile saved successfully!");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {isEditing ? (
                <SignUpForm 
                    initialData={userData} 
                    onSave={handleSave} 
                    onCancel={() => userData && setIsEditing(false)} 
                    hasProfile={!!userData}
                />
            ) : (
                userData && <ProfileCard user={userData} onEdit={() => setIsEditing(true)} onNavigate={onNavigate} />
            )}
        </div>
    );
};

export default Profile;
