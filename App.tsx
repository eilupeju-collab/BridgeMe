
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marketplace from './components/Marketplace';
import ItemMarketplace from './components/ItemMarketplace';
import SmartConnect from './components/SmartConnect';
import ChatInterface from './components/ChatInterface';
import Profile from './components/Profile';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const handleStartChat = (userId: string) => {
    setSelectedChatUser(userId);
    setCurrentView('chat');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero onGetStarted={() => handleNavigate('explore')} />
            
            {/* Visual Separator Image */}
            <div className="w-full h-64 md:h-[500px] overflow-hidden relative group">
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                  alt="Young woman helping older woman with tablet" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-lg inline-block">
                             <p className="text-white text-xl md:text-2xl font-bold tracking-wide shadow-sm">
                                "Technology brings us together, sharing knowledge keeps us connected."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                   <h2 className="text-3xl font-extrabold text-slate-900">How it Works</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📝</div>
                      <h3 className="text-lg font-bold mb-2">Post a Request</h3>
                      <p className="text-slate-600">Need tech support or want to learn a recipe? Post what you need and what you can offer in return.</p>
                   </div>
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🤖</div>
                      <h3 className="text-lg font-bold mb-2">AI Matching</h3>
                      <p className="text-slate-600">Our Gemini-powered matchmaker finds the perfect cross-generational partner based on personality and skills.</p>
                   </div>
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
                      <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🌍</div>
                      <h3 className="text-lg font-bold mb-2">Connect & Grow</h3>
                      <p className="text-slate-600">Chat with built-in translation, jump on video calls, and build a global network of friends.</p>
                   </div>
                </div>
              </div>
            </div>
          </>
        );
      case 'explore':
        return <Marketplace onChat={handleStartChat} />;
      case 'shop':
        return <ItemMarketplace onChat={handleStartChat} />;
      case 'smart-match':
        return <SmartConnect onChat={handleStartChat} />;
      case 'chat':
        return selectedChatUser 
          ? <ChatInterface userId={selectedChatUser} onBack={() => handleNavigate('explore')} />
          : <div className="p-10 text-center">No chat selected</div>;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
      default:
        return <Hero onGetStarted={() => handleNavigate('explore')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />
      {renderContent()}
      
      {/* Simple Footer */}
      {currentView !== 'chat' && (
        <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
                <p>&copy; 2024 BridgeMe. Connecting generations.</p>
            </div>
        </footer>
      )}
    </div>
  );
};

export default App;
