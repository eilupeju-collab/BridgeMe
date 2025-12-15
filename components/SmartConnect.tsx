import React, { useState, useEffect } from 'react';
import { generateSmartMatch } from '../services/geminiService';
import { UserProfile } from '../types';
import { MOCK_USERS } from '../constants';

interface SmartConnectProps {
    onChat: (userId: string) => void;
}

const SmartConnect: React.FC<SmartConnectProps> = ({ onChat }) => {
  const [bio, setBio] = useState('');
  const [need, setNeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState<{ match: UserProfile; reason: string } | null>(null);
  const [loadingText, setLoadingText] = useState('Consulting the archives...');

  useEffect(() => {
      let interval: any;
      if (loading) {
          const texts = [
              'Consulting the archives...', 
              'Analyzing skills and needs...', 
              'Checking generational compatibility...', 
              'Finding your perfect bridge...'
          ];
          let i = 0;
          interval = setInterval(() => {
              i = (i + 1) % texts.length;
              setLoadingText(texts[i]);
          }, 800);
      }
      return () => clearInterval(interval);
  }, [loading]);

  const handleMatch = async () => {
    if (!bio || !need) {
        alert("Please describe yourself and what you need.");
        return;
    }
    setLoading(true);
    setMatchData(null);
    // Pass MOCK_USERS to allow the AI to find a match within the existing community
    const result = await generateSmartMatch(bio, need, MOCK_USERS);
    setMatchData(result);
    setLoading(false);
  };

  const match = matchData?.match;
  const reason = matchData?.reason;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
          AI Smart Match
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Not sure who to ask? Describe yourself and what you're looking for, and our Gemini AI will find (or generate) the perfect connection for you.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3 text-amber-800 text-sm max-w-2xl mx-auto shadow-sm">
        <span className="text-xl">⚠️</span>
        <div>
            <span className="font-bold block mb-1">Safety First</span>
            For your security, please do not disclose your residential address, banking information, or other sensitive personal details to anyone you meet here.
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Input Section */}
        <div className="p-8 md:w-1/2 bg-slate-50 border-r border-slate-100 flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">About You</label>
                <textarea 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                    rows={4}
                    placeholder="e.g. I am a 24-year-old software engineer who loves cycling and wants to learn Italian."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What do you need help with?</label>
                <input 
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                    placeholder="e.g. Authentic pasta recipes, Life advice..."
                    value={need}
                    onChange={(e) => setNeed(e.target.value)}
                />
            </div>
            <button 
                onClick={handleMatch}
                disabled={loading}
                className={`mt-4 w-full py-3 rounded-lg text-white font-bold transition-all shadow-lg
                ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30 hover:scale-[1.02]'}`}
            >
                {loading ? 'Finding Match...' : 'Find My Match ✨'}
            </button>
        </div>

        {/* Result Section */}
        <div className="p-8 md:w-1/2 flex items-center justify-center bg-white relative">
            {loading && (
                <div className="absolute inset-0 bg-white/90 z-20 flex items-center justify-center flex-col">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 mb-4"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xl animate-pulse">✨</div>
                    </div>
                    <p className="text-indigo-600 font-medium animate-pulse">{loadingText}</p>
                </div>
            )}
            
            {!match && !loading && (
                <div className="text-center text-slate-400">
                    <div className="text-6xl mb-4">🤝</div>
                    <p>Your perfect connection is one click away.</p>
                </div>
            )}

            {match && (
                <div className="w-full animate-fade-in-up">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden">
                        {/* Match Badge */}
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                            98% MATCH
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <img src={match.avatar} alt={match.name} className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover" />
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{match.name}</h3>
                                <p className="text-sm text-indigo-600 font-medium">{match.role} • {match.location}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase">Expert In</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {match.offers.map(s => (
                                        <span key={s} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-md">{s}</span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* AI Reason Box */}
                            {reason && (
                                <div className="bg-white/80 p-3 rounded-xl border border-purple-100 shadow-sm mt-3">
                                    <h4 className="text-xs font-bold text-purple-600 uppercase flex items-center gap-1 mb-1">
                                        <span>✨</span> AI Insight
                                    </h4>
                                    <p className="text-xs text-slate-700 leading-relaxed italic">
                                        "{reason}"
                                    </p>
                                </div>
                            )}

                            <div className="bg-white p-3 rounded-lg border border-slate-100 text-sm text-slate-600 italic">
                                "{match.bio}"
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button 
                                onClick={() => setMatchData(null)}
                                className="px-4 py-2 bg-white text-slate-600 font-medium rounded-lg hover:bg-slate-50 border border-slate-200 transition text-sm"
                            >
                                Try Again
                            </button>
                            <button 
                                onClick={() => onChat(match.id)}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
                            >
                                Start Conversation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SmartConnect;