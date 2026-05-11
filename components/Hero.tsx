
import React, { useEffect, useState } from 'react';
import { getBio, FALLBACK_BIO } from '../services/geminiService';
import { PlayCircle } from 'lucide-react';
import { Section } from '../types';

interface HeroProps {
    scrollToSection: (section: Section) => void;
    heroImage: string;
}

const Hero: React.FC<HeroProps> = ({ scrollToSection, heroImage }) => {
  // Initialize with fallback bio immediately to avoid loading flicker
  const [bio, setBio] = useState<string>(FALLBACK_BIO);

  useEffect(() => {
    // Attempt to fetch fresh AI bio, but if it fails or is slow, we already have content showing.
    getBio().then(fetchedBio => {
        if (fetchedBio && fetchedBio !== FALLBACK_BIO) {
            setBio(fetchedBio);
        }
    });
  }, []);

  return (
    <section id={Section.HOME} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/50 z-10"></div>
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cube-coat.png')]"></div>
      </div>

      <div className="container mx-auto px-4 z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center pt-20">
        
        {/* Text Content */}
        <div className="order-2 md:order-1 text-right space-y-6 relative z-20">
          <div className="inline-block px-4 py-1 bg-gold-500/10 border border-gold-500/30 rounded-full">
            <span className="text-gold-500 font-bold text-sm">الإعلامي والعميد</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-black text-white leading-tight">
            جميل <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-gold-400 to-amber-600">
              عزالدين
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl">
            {bio}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
                onClick={() => scrollToSection(Section.VIDEOS)}
                className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-gold-500/20 flex items-center gap-2"
            >
              <PlayCircle size={20} />
              شاهد أحدث الأعمال
            </button>
            <button 
                onClick={() => scrollToSection(Section.ABOUT)}
                className="px-8 py-3 border border-gray-600 hover:border-white text-gray-300 hover:text-white font-bold rounded-lg transition-all"
            >
              المزيد عنه
            </button>
          </div>
        </div>

        {/* Image Composition */}
        <div className="order-1 md:order-2 flex justify-center md:justify-end relative mt-12 md:mt-0 pb-12 pr-6 md:pr-16">
            {/* The wrapper determines the base size - Significantly reduced max-width for mobile (220px) */}
            <div className="relative w-full max-w-[220px] md:max-w-md aspect-[4/5] mx-auto md:mx-0">
                
                {/* Back Frame (Decorative Borders) - Anchored Left/Bottom */}
                <div className="absolute inset-0 border-4 border-slate-700/60 rounded-3xl z-0 bg-slate-800/30 backdrop-blur-sm transform translate-y-3 -translate-x-3 md:translate-y-4 md:-translate-x-4"></div>
                
                {/* Second Frame Outline */}
                <div className="absolute inset-0 border border-gold-500/20 rounded-3xl z-[-1] transform translate-y-6 -translate-x-6 md:translate-y-8 md:-translate-x-8"></div>

                {/* Main Image Card - Shifted RIGHT Only (Popping out of the frame sideways) */}
                <div className="absolute inset-0 z-10 transform translate-x-6 md:translate-x-16 transition-transform duration-700 hover:translate-x-8 md:hover:translate-x-20 group">
                    
                    {/* Card Background (The "Frame") - This keeps the rounded shape for the background */}
                    <div className="absolute inset-0 bg-slate-800 rounded-2xl shadow-2xl border border-slate-600/50 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60"></div>
                    </div>

                    {/* The Image (Popping out) - Breaking the frame boundaries */}
                    {/* Shifted right and up and scaled slightly to break out of the box */}
                    <div className="absolute inset-0 -top-5 -right-6 md:-top-6 md:-right-12 z-20 pointer-events-none">
                        <img 
                            src={heroImage} 
                            alt="Gamil Azzdeen"
                            className="w-full h-full object-cover object-top drop-shadow-2xl"
                        />
                    </div>
                        
                    {/* Badge inside image - Positioned relative to the card frame */}
                    <div className="absolute bottom-4 right-3 left-3 md:bottom-6 md:right-6 md:left-6 bg-slate-900/60 backdrop-blur-md p-2 md:p-4 rounded-xl border border-white/20 shadow-lg z-30">
                        <p className="text-gold-400 font-bold text-sm md:text-lg">صوت الجمهورية</p>
                        <p className="text-white text-[10px] md:text-sm">من قلب الحدث</p>
                    </div>
                </div>

                {/* Floating Glow Effect */}
                <div className="absolute -top-10 -right-10 w-32 h-32 md:w-40 md:h-40 bg-gold-500/20 blur-[60px] rounded-full z-0 pointer-events-none"></div>
            </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
