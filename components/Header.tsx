import React, { useState, useEffect } from 'react';
import { Menu, X, Youtube, Twitter, Facebook, Globe } from 'lucide-react';
import { Section, AppView } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  activeSection: Section;
  activeView: AppView;
  scrollToSection: (section: Section) => void;
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, activeView, scrollToSection, onNavigateHome }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, lang, toggleLanguage, isRTL } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: Section) => {
    if (activeView === 'articles') {
      onNavigateHome();
      setTimeout(() => scrollToSection(sectionId), 100);
    } else {
      scrollToSection(sectionId);
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: Section.HOME, label: t.nav.home },
    { id: Section.ABOUT, label: t.nav.about },
    { id: Section.GALLERY, label: t.nav.gallery },
    { id: Section.VIDEOS, label: t.nav.videos },
    { id: Section.TWITTER, label: t.nav.twitter },
    { id: Section.FACEBOOK, label: t.nav.facebook },
    { id: Section.TESTIMONIALS, label: t.nav.testimonials },
  ];

  const scrolled = isScrolled || activeView === 'articles';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-black/20 border-b border-white/5 py-2'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center gap-4">
        {/* Logo */}
        <button
          onClick={() => { onNavigateHome(); setIsMobileMenuOpen(false); }}
          className="flex items-center gap-2 group shrink-0"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gold-500/30 rounded-full blur-md group-hover:blur-lg transition-all"></div>
            <div className="relative w-9 h-9 bg-gradient-to-br from-gold-400 to-amber-600 rounded-full flex items-center justify-center text-slate-900 font-black text-sm font-heading shadow-lg">
              ج
            </div>
          </div>
          <span className="text-xl font-heading font-bold text-white hidden sm:block">
            <span className="text-gold-400">جميل</span> عزالدين
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 group ${
                activeSection === item.id && activeView === 'home'
                  ? 'text-gold-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {activeSection === item.id && activeView === 'home' && (
                <span className="absolute inset-0 bg-gold-500/10 rounded-lg border border-gold-500/20"></span>
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Social Icons (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href="https://twitter.com/gamilaz1"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#1DA1F2]/20 border border-white/10 hover:border-[#1DA1F2]/40 flex items-center justify-center text-gray-400 hover:text-[#1DA1F2] transition-all duration-300"
            >
              <Twitter size={15} />
            </a>
            <a
              href="https://www.facebook.com/jamilez2015"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#1877F2]/20 border border-white/10 hover:border-[#1877F2]/40 flex items-center justify-center text-gray-400 hover:text-[#1877F2] transition-all duration-300"
            >
              <Facebook size={15} />
            </a>
            <a
              href="https://www.youtube.com/channel/UC6w3x_g5oIPabiTR4BOsGXw/videos"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all duration-300"
            >
              <Youtube size={15} />
            </a>
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-gold-500/15 border border-white/10 hover:border-gold-500/40 rounded-full text-gray-300 hover:text-gold-400 text-xs font-bold transition-all duration-300"
            title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
          >
            <Globe size={13} />
            <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-white transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-slate-900/98 backdrop-blur-xl border-t border-white/5 px-4 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`text-right py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                activeSection === item.id && activeView === 'home'
                  ? 'text-gold-400 bg-gold-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/5">
            <a href="https://twitter.com/gamilaz1" className="text-gray-400 hover:text-[#1DA1F2] transition-colors">
              <Twitter size={20} />
            </a>
            <a href="https://www.facebook.com/jamilez2015" className="text-gray-400 hover:text-[#1877F2] transition-colors">
              <Facebook size={20} />
            </a>
            <a href="https://www.youtube.com/channel/UC6w3x_g5oIPabiTR4BOsGXw" className="text-gray-400 hover:text-red-400 transition-colors">
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
