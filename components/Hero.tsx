import React, { useState } from 'react';

interface HeroProps {
  onGetStarted: () => void;
}

const DEMO_SLIDES = [
    {
        title: "Welcome to BridgeMe",
        description: "The first platform dedicated to connecting generations for mutual growth, friendship, and support. No one is left behind.",
        icon: "👋",
        color: "bg-indigo-100 text-indigo-600"
    },
    {
        title: "Skill Exchange",
        description: "Gen Z teaches Tech, Boomers teach Life Skills. Post requests for help and offer your unique expertise in return.",
        icon: "🔄",
        color: "bg-purple-100 text-purple-600"
    },
    {
        title: "Generational Marketplace",
        description: "Buy and sell unique items. Find authentic vintage treasures from seniors or modern digital art from younger creators.",
        icon: "🛍️",
        color: "bg-emerald-100 text-emerald-600"
    },
    {
        title: "AI Smart Match",
        description: "Not sure who to connect with? Our Gemini-powered AI analyzes your personality and needs to find your perfect match.",
        icon: "✨",
        color: "bg-amber-100 text-amber-600"
    },
    {
        title: "Global Connection",
        description: "Chat with anyone, anywhere. Real-time translation breaks down language barriers, making the world a global village.",
        icon: "🌐",
        color: "bg-blue-100 text-blue-600"
    }
];

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const [showDemo, setShowDemo] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
      if (currentSlide === DEMO_SLIDES.length - 1) {
          setShowDemo(false);
          onGetStarted();
          setTimeout(() => setCurrentSlide(0), 300); // Reset after transition
      } else {
          setCurrentSlide((prev) => prev + 1);
      }
  };

  const prevSlide = () => {
      setCurrentSlide((prev) => (prev - 1 + DEMO_SLIDES.length) % DEMO_SLIDES.length);
  };

  return (
    <div className="flex flex-col">
      {/* Mission Banner */}
      <div className="w-full bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 text-white py-3 px-4 text-center shadow-lg relative z-20">
        <p className="font-medium text-sm sm:text-base animate-fadeIn">
          <span className="font-extrabold text-indigo-100 tracking-wider">BridgeMe</span> 
          <span className="mx-2 opacity-75">|</span> 
          Makes the world a global village with no one left behind
        </p>
      </div>

      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Connect Across</span>{' '}
                  <span className="block text-indigo-600 xl:inline">Generations</span>
                </h1>
                <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-auto">
                  Exchange skills, share culture, and build meaningful friendships. 
                  Whether you're a Gen Z tech wizard or a Boomer with a secret lasagna recipe, 
                  BridgeMe connects you.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <button
                      onClick={onGetStarted}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg transition-all transform hover:scale-105"
                    >
                      Start Exchanging
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <button
                      onClick={() => setShowDemo(true)}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg transition"
                    >
                      Watch Demo
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 h-56 sm:h-72 md:h-96 lg:h-full overflow-hidden">
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.pexels.com/videos/7578543/free-video-7578543.jpg"
          >
             <source src="https://videos.pexels.com/video-files/7578543/7578543-uhd_2560_1440_25fps.mp4" type="video/mp4" />
             Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col relative">
                  <button 
                      onClick={() => setShowDemo(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 p-1 hover:bg-slate-100 rounded-full transition"
                  >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  <div className="p-8 flex flex-col items-center text-center">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm ${DEMO_SLIDES[currentSlide].color} transition-colors duration-300`}>
                          {DEMO_SLIDES[currentSlide].icon}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 transition-all duration-300">
                          {DEMO_SLIDES[currentSlide].title}
                      </h3>
                      
                      <p className="text-slate-600 text-lg leading-relaxed mb-8 min-h-[80px] transition-all duration-300">
                          {DEMO_SLIDES[currentSlide].description}
                      </p>

                      {/* Dots */}
                      <div className="flex gap-2 mb-8">
                          {DEMO_SLIDES.map((_, idx) => (
                              <button
                                  key={idx}
                                  onClick={() => setCurrentSlide(idx)}
                                  className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlide ? 'bg-indigo-600 w-6' : 'bg-slate-300 hover:bg-slate-400'}`}
                              />
                          ))}
                      </div>

                      {/* Navigation */}
                      <div className="flex w-full gap-4">
                          {currentSlide > 0 ? (
                              <button 
                                  onClick={prevSlide}
                                  className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition border border-slate-200"
                              >
                                  Back
                              </button>
                          ) : (
                             <button 
                                  onClick={() => setShowDemo(false)}
                                  className="flex-1 py-3 text-slate-400 font-medium hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
                              >
                                  Skip
                              </button>
                          )}
                          
                          <button 
                              onClick={nextSlide}
                              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200"
                          >
                              {currentSlide === DEMO_SLIDES.length - 1 ? "Get Started" : "Next"}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Hero;