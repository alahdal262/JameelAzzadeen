import React from 'react';
import { Twitter, Facebook, Youtube, Mail, MapPin, ArrowUp } from 'lucide-react';
import { Section } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface FooterProps {
  scrollToSection: (section: Section) => void;
}

const Footer: React.FC<FooterProps> = ({ scrollToSection }) => {
  const { t, lang, isRTL } = useLanguage();

  return (
    <footer className="bg-slate-950 text-white border-t border-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.05)_0%,_transparent_60%)] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">

        {/* Main footer grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 py-16 border-b border-white/5">

          {/* Brand column */}
          <div className={`lg:col-span-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center gap-2 mb-5 justify-start">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-amber-600 rounded-full flex items-center justify-center text-slate-900 font-black text-base font-heading shadow-lg">
                ج
              </div>
              <span className="text-xl font-heading font-bold">
                <span className="text-gold-400">جميل</span> عزالدين
              </span>
            </div>
            <p className={`text-gray-400 leading-relaxed text-sm mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t.footer.description}
            </p>
            <div className="flex gap-3">
              <a
                href="https://twitter.com/gamilaz1"
                target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-[#1DA1F2]/20 border border-white/10 hover:border-[#1DA1F2]/40 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#1DA1F2] transition-all duration-300"
              >
                <Twitter size={16} />
              </a>
              <a
                href="https://www.facebook.com/jamilez2015"
                target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-[#1877F2]/20 border border-white/10 hover:border-[#1877F2]/40 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#1877F2] transition-all duration-300"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://www.youtube.com/channel/UC6w3x_g5oIPabiTR4BOsGXw"
                target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 transition-all duration-300"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h3 className="text-sm font-bold text-white mb-5 pb-2 border-b border-white/10 inline-block">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <button onClick={() => scrollToSection(Section.ABOUT)} className="hover:text-gold-400 transition-colors">
                  {t.footer.links.about}
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection(Section.GALLERY)} className="hover:text-gold-400 transition-colors">
                  {t.footer.links.gallery}
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection(Section.VIDEOS)} className="hover:text-gold-400 transition-colors">
                  {t.footer.links.videos}
                </button>
              </li>
              <li>
                <a href="https://gamilazzdeen.com/category/%d9%85%d9%82%d8%a7%d9%84%d8%a7%d8%aa" target="_blank" rel="noreferrer" className="hover:text-gold-400 transition-colors">
                  {t.footer.links.articles}
                </a>
              </li>
              <li>
                <button onClick={() => scrollToSection(Section.TESTIMONIALS)} className="hover:text-gold-400 transition-colors">
                  {t.footer.links.testimonials}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h3 className="text-sm font-bold text-white mb-5 pb-2 border-b border-white/10 inline-block">
              {t.footer.contact}
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 bg-gold-500/10 border border-gold-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-gold-400" />
                </div>
                <span>info@gamilazzdeen.com</span>
              </li>
              <li className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 bg-gold-500/10 border border-gold-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-gold-400" />
                </div>
                <span>{t.footer.location}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h3 className="text-sm font-bold text-white mb-5 pb-2 border-b border-white/10 inline-block">
              {t.footer.newsletter}
            </h3>
            <p className="text-gray-400 text-sm mb-4">{t.footer.newsletterDesc}</p>
            <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <input
                type="email"
                placeholder={t.footer.emailPlaceholder}
                className={`bg-white/5 border border-white/10 text-white px-4 py-2.5 ${isRTL ? 'rounded-l-xl' : 'rounded-r-xl'} w-full focus:outline-none focus:border-gold-500/50 text-sm placeholder-gray-500 transition-colors`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <button className={`bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-slate-900 px-4 py-2.5 ${isRTL ? 'rounded-r-xl' : 'rounded-l-xl'} font-bold text-sm shrink-0 transition-all`}>
                {t.footer.subscribe}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <p>© {new Date().getFullYear()} جميل عزالدين. {t.footer.rights}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">{t.footer.privacy}</a>
            <a href="#" className="hover:text-gray-300 transition-colors">{t.footer.terms}</a>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-gold-500/70 hover:text-gold-400 transition-colors group"
          >
            <ArrowUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
            {t.footer.backTop}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
