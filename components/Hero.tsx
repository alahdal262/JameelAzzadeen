import React, { useEffect, useState } from 'react';
import { getBio, FALLBACK_BIO } from '../services/geminiService';
import { PlayCircle, ChevronDown } from 'lucide-react';
import { Section } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface HeroProps {
  scrollToSection: (section: Section) => void;
  heroImage: string;
}

const FALLBACK_BIO_EN = "A towering Yemeni media figure and eloquent national voice, cementing his standing over decades as one of the most prominent faces in Yemeni and Arab media — renowned for exceptional eloquence and a unique ability to uncover truth under the most difficult circumstances.";

const Hero: React.FC<HeroProps> = ({ scrollToSection, heroImage }) => {
  const [bio, setBio] = useState<string>(FALLBACK_BIO);
  const { t, lang } = useLanguage();

  useEffect(() => {
    getBio().then(fetchedBio => {
      if (fetchedBio && fetchedBio !== FALLBACK_BIO) setBio(fetchedBio);
    });
  }, []);

  const displayBio = lang === 'en' ? FALLBACK_BIO_EN : bio;

  return (
    <section id={Section.HOME} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">

      {/* Animated background layers */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.12)_0%,_transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(14,165,233,0.06)_0%,_transparent_60%)]"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      {/* Animated gold orb */}
      <div
        className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
          animation: 'pulse 6s ease-in-out infinite',
        }}
      ></div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .fade-up-1 { animation: fadeUp 0.7s ease forwards 0.1s; opacity: 0; }
        .fade-up-2 { animation: fadeUp 0.7s ease forwards 0.25s; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.7s ease forwards 0.4s; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.7s ease forwards 0.55s; opacity: 0; }
        .shimmer-gold {
          background: linear-gradient(to right, #fbbf24 0%, #f97316 40%, #fbbf24 80%, #f97316 100%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <div className="container mx-auto px-4 z-10 grid md:grid-cols-2 gap-8 md:gap-16 items-center pt-24 pb-16">

        {/* Text Content */}
        <div className={`${lang === 'en' ? 'order-2 md:order-1 text-left' : 'order-2 md:order-1 text-right'} space-y-6 relative z-20`}>

          {/* Badge */}
          <div className="fade-up-1 inline-flex items-center gap-2">
            <span className="inline-block px-4 py-1.5 bg-gold-500/10 border border-gold-500/25 rounded-full text-gold-400 font-bold text-xs tracking-wider uppercase">
              {t.hero.badge}
            </span>
          </div>

          {/* Name */}
          <div className="fade-up-2 space-y-0">
            <h1 className="text-5xl md:text-7xl font-heading font-black text-white leading-tight">
              {t.hero.title1}
            </h1>
            <h1 className="text-5xl md:text-7xl font-heading font-black leading-tight shimmer-gold">
              {t.hero.title2}
            </h1>
          </div>

          {/* Bio */}
          <p className="fade-up-3 text-base md:text-lg text-gray-400 leading-relaxed max-w-xl">
            {displayBio}
          </p>

          {/* CTA Buttons */}
          <div className={`fade-up-4 flex flex-wrap gap-3 pt-2 ${lang === 'en' ? '' : ''}`}>
            <button
              onClick={() => scrollToSection(Section.VIDEOS)}
              className="group relative px-7 py-3 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-slate-900 font-bold rounded-xl transition-all duration-300 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 flex items-center gap-2 text-sm"
            >
              <PlayCircle size={18} className="group-hover:scale-110 transition-transform" />
              {t.hero.ctaWatch}
            </button>
            <button
              onClick={() => scrollToSection(Section.ABOUT)}
              className="px-7 py-3 border border-white/15 hover:border-white/35 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold rounded-xl transition-all duration-300 text-sm"
            >
              {t.hero.ctaAbout}
            </button>
          </div>

          {/* Stats row */}
          <div className="fade-up-4 flex gap-6 pt-4">
            {[
              { num: '٣٠+', label: lang === 'ar' ? 'عامًا من الخبرة' : '30+ Years' },
              { num: '٥٠٠+', label: lang === 'ar' ? 'برنامج تلفزيوني' : 'TV Programs' },
              { num: '١٠٠٠+', label: lang === 'ar' ? 'مقابلة ولقاء' : 'Interviews' },
            ].map((stat) => (
              <div key={stat.label} className={lang === 'en' ? 'text-left' : 'text-right'}>
                <div className="text-2xl font-black text-gold-400 font-heading">{stat.num}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Composition */}
        <div className="order-1 md:order-2 flex justify-center md:justify-end relative mt-16 md:mt-0">
          <div className="relative w-full max-w-[260px] md:max-w-[380px] aspect-[3/4] mx-auto md:mx-0">

            {/* Glow rings */}
            <div className="absolute -inset-8 rounded-[40px] border border-gold-500/10 z-0"></div>
            <div className="absolute -inset-4 rounded-[32px] border border-gold-500/15 z-0"></div>
            <div className="absolute inset-0 bg-gold-500/10 rounded-[24px] blur-2xl z-0"></div>

            {/* Back decorative card */}
            <div className="absolute inset-0 bg-slate-800/60 rounded-[24px] border border-white/10 z-0 transform translate-y-4 -translate-x-4 md:translate-y-6 md:-translate-x-6"></div>

            {/* Main image card */}
            <div className="relative z-10 w-full h-full rounded-[20px] overflow-hidden border border-white/10 shadow-2xl bg-slate-900 transform translate-x-4 md:translate-x-8">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10"></div>
              {heroImage && (
                <img
                  src={heroImage}
                  alt="Gamil Azzadeen"
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                />
              )}

              {/* Inner badge */}
              <div className="absolute bottom-5 left-4 right-4 z-20 bg-slate-900/70 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className={lang === 'en' ? 'text-left' : 'text-right'}>
                    <p className="text-gold-400 font-bold text-sm font-heading">{t.hero.badgeInner}</p>
                    <p className="text-gray-300 text-xs">{t.hero.badgeInnerSub}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollToSection(Section.ABOUT)}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-gray-500 hover:text-gold-400 transition-colors flex flex-col items-center gap-1"
        aria-label="Scroll down"
        style={{ animation: 'fadeUp 0.7s ease forwards 1s', opacity: 0 }}
      >
        <span className="text-xs">{lang === 'ar' ? 'اكتشف المزيد' : 'Discover more'}</span>
        <ChevronDown size={20} className="animate-bounce" />
      </button>
    </section>
  );
};

export default Hero;
