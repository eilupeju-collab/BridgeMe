
import React from 'react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
              BridgeMe
            </span>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <button 
              onClick={() => onNavigate('home')}
              className={`${currentView === 'home' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-500'} transition-colors`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('explore')}
              className={`${currentView === 'explore' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-500'} transition-colors`}
            >
              Explore Requests
            </button>
            <button 
              onClick={() => onNavigate('shop')}
              className={`${currentView === 'shop' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-500'} transition-colors`}
            >
              Shop
            </button>
            <button 
              onClick={() => onNavigate('smart-match')}
              className={`${currentView === 'smart-match' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-500'} transition-colors`}
            >
              AI Matchmaker
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button 
                className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 hover:bg-amber-100 transition"
                onClick={() => alert("Premium Subscription Plan:\n- Unlimited Matches\n- Video Calls\n- Verified Badge\n$9.99/mo")}
            >
              Go Premium
            </button>
            <div 
                className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-indigo-500 transition"
                onClick={() => onNavigate('profile')}
            >
                <img src="https://picsum.photos/200/200?random=99" alt="User" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className="md:hidden border-t border-slate-100 flex justify-around py-3 bg-white">
        <button onClick={() => onNavigate('home')} className="text-slate-500 text-xs flex flex-col items-center gap-1">
          <span>🏠</span> Home
        </button>
        <button onClick={() => onNavigate('explore')} className="text-slate-500 text-xs flex flex-col items-center gap-1">
          <span>🔍</span> Requests
        </button>
        <button onClick={() => onNavigate('shop')} className="text-slate-500 text-xs flex flex-col items-center gap-1">
          <span>🛍️</span> Shop
        </button>
        <button onClick={() => onNavigate('smart-match')} className="text-slate-500 text-xs flex flex-col items-center gap-1">
          <span>✨</span> AI Match
        </button>
      </div>
    </nav>
  );
};

export default Navbar;