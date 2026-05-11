import React, { useState, useEffect, useCallback, useRef } from 'react';

const slides = [
  {
    // Slide 1: Welcome - The requested SUV image
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1920',
    tag: 'WELCOME',
    title: 'Elevate Your Journey',
    subtitle: 'The premier destination for luxury automotive trading and uncompromising experiences.',
    buttonText: 'Get Started',
    buttonLink: '/buyer/auctions',
    theme: 'orange'
  },
  {
    // Slide 2: Mechanic / Quality Inspection - UPDATED IMAGE URL
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=1920',
    tag: 'CERTIFIED QUALITY',
    title: 'Masterfully Inspected',
    subtitle: 'Every auctioned vehicle is rigorously examined and approved by our certified master mechanics.',
    buttonText: 'View Standards',
    buttonLink: '/buyer/auctions',
    theme: 'white'
  },
  {
    // Slide 3: Quick Rentals (Sleek motion/driving image)
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1920',
    tag: 'INSTANT ACCESS',
    title: 'Seamless Quick Rentals',
    subtitle: 'Get behind the wheel effortlessly with our expedited, highly formal rental service.',
    buttonText: 'Book a Rental',
    buttonLink: '/buyer/rentals',
    theme: 'orange'
  },
  {
    // Slide 4: Bid Your Dream Car (Classic premium supercar)
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920',
    tag: 'LIVE AUCTIONS',
    title: 'Bid On Your Dream Car',
    subtitle: 'Join exclusive bidding events and secure the masterpiece you have always desired.',
    buttonText: 'Start Bidding',
    buttonLink: '/buyer/auctions',
    theme: 'white'
  }
];

const App = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(handleNext, 6000);
    return () => clearInterval(timerRef.current);
  }, [handleNext]);

  return (
    <section className="relative w-full px-4 sm:px-8 pt-0 mt-8 pb-4 bg-white font-sans">
      <div className="max-w-7xl mx-auto w-full relative group">
        {/* Main Slider Container */}
        <div className="relative h-[400px] sm:h-[500px] lg:h-[620px] w-full overflow-hidden rounded-[2rem] shadow-2xl bg-black">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Animated Image Layer (Slow Cinematic Zoom) */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={`w-full h-full object-cover object-center transition-transform duration-[12000ms] ease-out ${
                    index === currentIndex ? 'scale-110' : 'scale-100'
                  }`}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1486006396113-c7b3df9747f1?auto=format&fit=crop&q=80&w=1920';
                  }}
                />
              </div>
              
              {/* Professional Gradient Overlays for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />

              {/* Text Content Block */}
              <div className="absolute bottom-0 left-0 p-8 sm:p-14 lg:p-20 w-full flex flex-col justify-end">
                <div className="max-w-3xl">
                  {/* Tagline Indicator */}
                  <div className="flex items-center gap-3 mb-6 overflow-hidden">
                    <span className={`h-[2px] bg-orange-500 rounded-full transition-all duration-1000 ${index === currentIndex ? 'w-12' : 'w-0'}`} />
                    <span className="text-orange-400 font-bold tracking-[0.3em] text-[10px] sm:text-xs uppercase">
                      {slide.tag}
                    </span>
                  </div>
                  
                  {/* Main Title */}
                  <h2 className="text-4xl sm:text-6xl lg:text-[5rem] font-bold text-white mb-6 leading-[1.05] tracking-tight drop-shadow-2xl">
                    {slide.title}
                  </h2>
                  
                  {/* Formal Subtitle */}
                  <p className="text-gray-300 text-base sm:text-lg lg:text-xl mb-10 font-normal max-w-xl drop-shadow-md leading-relaxed">
                    {slide.subtitle}
                  </p>
                  
                  {/* Action Button */}
                  <div className="flex items-center gap-4">
                    <button
                      className={`inline-flex items-center justify-center px-10 py-4 font-bold rounded-xl transition-all duration-300 shadow-2xl active:scale-95 text-base tracking-wide ${
                        slide.theme === 'orange' 
                        ? 'bg-orange-500 text-white hover:bg-white hover:text-orange-600' 
                        : 'bg-white text-black hover:bg-orange-500 hover:text-white'
                      }`}
                    >
                      {slide.buttonText}
                      <svg className="w-5 h-5 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-orange-500 hover:border-orange-500 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90 text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-orange-500 hover:border-orange-500 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90 text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Minimal Dash Pagination */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                i === currentIndex 
                  ? 'w-16 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)]' 
                  : 'w-6 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default App;