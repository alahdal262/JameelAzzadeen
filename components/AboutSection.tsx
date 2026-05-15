import React, { useState, useEffect } from 'react';
import { Section, CareerMoment } from '../types';
import { Award, Mic, Users, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface AboutSectionProps {
  onNavigateToArticles: () => void;
  careerMoments: CareerMoment[];
}

const AboutSection: React.FC<AboutSectionProps> = ({ onNavigateToArticles, careerMoments }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t, lang, isRTL } = useLanguage();

  useEffect(() => {
    if (careerMoments.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % careerMoments.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [careerMoments.length]);

  const features = lang === 'ar'
    ? [
        { icon: <Mic size={20} />, color: 'blue', title: 'صوت الجمهورية', desc: 'يمتلك خامة صوتية فريدة جعلته المعلق الرسمي لأهم الأحداث الوطنية.' },
        { icon: <Award size={20} />, color: 'gold', title: 'تكريمات مستحقة', desc: 'حاز على العديد من الدروع والأوسمة تقديراً لدوره في تعزيز الوعي الوطني.' },
        { icon: <Users size={20} />, color: 'green', title: 'نبض الشارع', desc: 'من خلال برامجه الميدانية، يظل دائماً قريباً من هموم المواطن وتطلعاته.' },
      ]
    : [
        { icon: <Mic size={20} />, color: 'blue', title: 'Voice of the Republic', desc: 'Possesses a unique vocal quality that made him the official commentator for the most important national events.' },
        { icon: <Award size={20} />, color: 'gold', title: 'Well-Deserved Recognition', desc: 'Received numerous shields and medals in appreciation of his role in strengthening national awareness.' },
        { icon: <Users size={20} />, color: 'green', title: 'Pulse of the Street', desc: 'Through his field programs, he always remains close to citizens\' concerns and aspirations.' },
      ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    gold: 'bg-amber-50 text-amber-600 border-amber-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  };
  const dotColorMap: Record<string, string> = {
    blue: 'bg-blue-100 border-blue-500',
    gold: 'bg-amber-100 border-amber-500',
    green: 'bg-emerald-100 border-emerald-500',
  };

  return (
    <section id={Section.ABOUT} className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className={`grid lg:grid-cols-2 gap-16 items-center ${!isRTL ? 'direction-ltr' : ''}`}>

          {/* Image Slider Column */}
          <div className="relative group order-1">
            <div className="absolute -inset-4 bg-gradient-to-br from-gold-500/8 to-amber-400/5 rounded-3xl transform -rotate-1 transition-transform duration-500 group-hover:rotate-0"></div>

            <div className="relative rounded-2xl shadow-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-gray-100/50">
              {careerMoments.length > 0 ? (
                careerMoments.map((moment, index) => (
                  <div
                    key={moment.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img src={moment.src} alt={moment.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent"></div>
                    <div className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-full p-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="inline-block px-3 py-1 bg-gold-500 text-slate-900 text-xs font-black rounded-lg mb-2">
                        {moment.year}
                      </span>
                      <p className="text-white text-lg font-bold font-heading">{moment.label}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {lang === 'ar' ? 'لا توجد صور حالياً' : 'No images available'}
                </div>
              )}

              {/* Slide indicators */}
              {careerMoments.length > 1 && (
                <div className={`absolute bottom-6 ${isRTL ? 'left-6' : 'right-6'} flex gap-2 z-20`}>
                  {careerMoments.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? 'w-8 bg-gold-400' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Prev/Next controls */}
              {careerMoments.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentSlide(p => (p - 1 + careerMoments.length) % careerMoments.length)}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-20`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentSlide(p => (p + 1) % careerMoments.length)}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-8 h-8 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-20`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Floating stats card */}
            <div className={`absolute -bottom-8 ${isRTL ? '-left-4 md:-left-8' : '-right-4 md:-right-8'} bg-white border border-gray-100 p-5 rounded-2xl shadow-2xl hidden md:flex gap-6 z-30`}>
              <div className="text-center">
                <p className="text-3xl font-black text-gold-500 font-heading">٣٠+</p>
                <p className="text-xs text-gray-500 font-semibold whitespace-nowrap">{lang === 'ar' ? 'عام خبرة' : 'Years Exp.'}</p>
              </div>
              <div className={`border-${isRTL ? 'r' : 'l'} border-gray-200 ${isRTL ? 'pr-6' : 'pl-6'}`}>
                <p className="text-3xl font-black text-slate-900 font-heading">٢٠٠٠+</p>
                <p className="text-xs text-gray-500 font-semibold whitespace-nowrap">{lang === 'ar' ? 'حلقة تلفزيونية' : 'TV Episodes'}</p>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div className={`order-2 ${isRTL ? 'lg:pr-8 text-right' : 'lg:pl-8 text-left'} mt-8 lg:mt-0`}>
            {/* Section tag */}
            <div className={`flex items-center gap-3 mb-5 ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <div className="h-0.5 w-10 bg-gradient-to-r from-gold-400 to-amber-500 rounded-full"></div>
              <span className="text-gold-600 font-bold text-xs tracking-widest uppercase">{t.about.sectionTag}</span>
            </div>

            <h2 className="text-4xl font-heading font-black text-slate-900 mb-6 leading-tight">
              {t.about.title}
            </h2>

            <div className="space-y-4 mb-8">
              <p className="text-gray-600 leading-loose text-base">{t.about.bio1}</p>
              <p className="text-gray-600 leading-loose text-base">{t.about.bio2}</p>
            </div>

            {/* Feature list */}
            <div className={`space-y-5 border-${isRTL ? 'r' : 'l'}-2 border-gray-100 ${isRTL ? 'pr-5 mr-1' : 'pl-5 ml-1'} mb-10`}>
              {features.map((f) => (
                <div key={f.title} className="relative">
                  <div className={`absolute ${isRTL ? '-right-[27px]' : '-left-[27px]'} top-1 w-4 h-4 rounded-full border-2 ${dotColorMap[f.color]}`}></div>
                  <div className={`flex gap-4 items-start ${!isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`p-2.5 rounded-xl border ${colorMap[f.color]} mt-0.5 shrink-0`}>{f.icon}</div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <h4 className="font-bold text-slate-800 text-base mb-0.5">{f.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onNavigateToArticles}
              className={`group inline-flex items-center gap-3 px-7 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/20 text-sm ${!isRTL ? 'flex-row' : ''}`}
            >
              <Newspaper size={18} className="text-gold-400" />
              <span>{t.about.readArticles}</span>
              <ChevronLeft size={16} className={`transition-transform ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1 rotate-180'}`} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
