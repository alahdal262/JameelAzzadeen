
import React, { useState, useEffect } from 'react';
import { Menu, X, Youtube, Twitter, Facebook } from 'lucide-react';
import { Section, AppView } from '../types';

interface HeaderProps {
  activeSection: Section;
  activeView: AppView;
  scrollToSection: (section: Section) => void;
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, activeView, scrollToSection, onNavigateHome }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: Section) => {
    if (activeView === 'articles') {
        onNavigateHome();
        // Allow a small delay for page switch before scrolling
        setTimeout(() => scrollToSection(sectionId), 100);
    } else {
        scrollToSection(sectionId);
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: Section.HOME, label: 'الرئيسية' },
    { id: Section.ABOUT, label: 'من هو جميل عزالدين' },
    { id: Section.GALLERY, label: 'مكتبة الصور' },
    { id: Section.VIDEOS, label: 'فيديوهات' },
    { id: Section.TWITTER, label: 'تغريدات' },
    { id: Section.FACEBOOK, label: 'فيسبوك' },
    { id: Section.TESTIMONIALS, label: 'قالوا عنه' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        (isScrolled || activeView === 'articles') ? 'bg-slate-900/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo / Name */}
        <div 
            className="text-2xl font-heading font-bold text-white cursor-pointer flex items-center gap-2"
            onClick={() => handleNavClick(Section.HOME)}
        >
          <span className="text-gold-500">جميل</span> عزالدين
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`text-sm font-medium transition-colors duration-300 ${
                (activeSection === item.id && activeView === 'home')
                  ? 'text-gold-500 font-bold' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Social Icons (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <a href="https://twitter.com/gamilaz1" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-[#1DA1F2] transition-colors">
            <Twitter size={20} />
          </a>
          <a href="https://www.facebook.com/jamilez2015" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-[#4267B2] transition-colors">
            <Facebook size={20} />
          </a>
          <a href="https://www.youtube.com/channel/UC6w3x_g5oIPabiTR4BOsGXw/videos" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-[#FF0000] transition-colors">
            <Youtube size={20} />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 border-t border-slate-800 shadow-xl p-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="text-right text-white py-2 hover:text-gold-500 transition-colors border-b border-slate-800 last:border-0"
            >
              {item.label}
            </button>
          ))}
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-800">
             <a href="https://twitter.com/gamilaz1" className="text-gray-400 hover:text-[#1DA1F2]"><Twitter /></a>
             <a href="https://www.facebook.com/jamilez2015" className="text-gray-400 hover:text-[#4267B2]"><Facebook /></a>
             <a href="https://www.youtube.com/channel/UC6w3x_g5oIPabiTR4BOsGXw" className="text-gray-400 hover:text-[#FF0000]"><Youtube /></a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
