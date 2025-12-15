import React, { useState } from 'react';
import { MOCK_REQUESTS, MOCK_USERS } from '../constants';
import { SkillCategory, RequestPost } from '../types';

interface MarketplaceProps {
  onChat: (userId: string) => void;
}

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

const Marketplace: React.FC<MarketplaceProps> = ({ onChat }) => {
  const [filter, setFilter] = useState<SkillCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = MOCK_REQUESTS.filter(r => {
      const matchesCategory = filter === 'All' || r.category === filter;
      const matchesSearch = !searchQuery.trim() || 
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          r.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
  });

  const getUser = (id: string) => MOCK_USERS.find(u => u.id === id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Community Requests</h2>
          <p className="mt-2 text-slate-600">Find someone to help, or request help yourself.</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
                type="text"
                placeholder="Search requests (e.g., 'iPad help', 'learn cooking')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
            />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
           <button
              onClick={() => setFilter('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                filter === 'All' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All
            </button>
          {Object.values(SkillCategory).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                filter === cat 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 animate-fadeIn">
              <span className="text-5xl block mb-4 opacity-50">🔍</span>
              <h3 className="text-lg font-bold text-slate-900">No requests found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search or category filters.</p>
              <button 
                onClick={() => {setFilter('All'); setSearchQuery('');}} 
                className="mt-4 text-indigo-600 font-bold hover:underline"
              >
                  Clear Filters
              </button>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {filteredRequests.map(request => {
            const author = getUser(request.userId);
            if (!author) return null;

            return (
                <div key={request.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition duration-300 flex flex-col h-full group">
                <div className="p-6 flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                    <img src={author.avatar} alt={author.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">{author.name}</h3>
                        <p className="text-xs text-slate-500">{author.role} • {author.location}</p>
                    </div>
                    {author.isPremium && (
                        <span className="ml-auto bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-200">PRO</span>
                    )}
                    </div>
                    
                    <div className="mb-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-md mb-3 border
                        ${request.category === SkillCategory.TECH ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                        request.category === SkillCategory.COOKING ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        request.category === SkillCategory.LANGUAGE ? 'bg-green-50 text-green-700 border-green-100' : 
                        request.category === SkillCategory.COUNSELING ? 'bg-teal-50 text-teal-700 border-teal-100' :
                        'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                        {request.category}
                    </span>
                    <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                        {highlightText(request.title, searchQuery)}
                    </h4>
                    <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                        {highlightText(request.description, searchQuery)}
                    </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">In Return Offering</p>
                    <p className="text-sm text-indigo-700 font-medium">
                        {request.exchangeOffer}
                    </p>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">{request.createdAt}</span>
                    <button 
                    onClick={() => onChat(author.id)}
                    className="bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
                    >
                    Connect
                    </button>
                </div>
                </div>
            );
            })}
        </div>
      )}
    </div>
  );
};

export default Marketplace;