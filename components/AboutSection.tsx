
import React, { useState, useEffect } from 'react';
import { Section, CareerMoment } from '../types';
import { Award, Mic, Users, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';

interface AboutSectionProps {
    onNavigateToArticles: () => void;
    careerMoments: CareerMoment[];
}

const AboutSection: React.FC<AboutSectionProps> = ({ onNavigateToArticles, careerMoments }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slider
  useEffect(() => {
    if (careerMoments.length === 0) return;
    const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % careerMoments.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(timer);
  }, [careerMoments.length]);

  return (
    <section id={Section.ABOUT} className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
           
           {/* Image Slider Column */}
           <div className="relative group">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 bg-gold-500/10 rounded-2xl transform -rotate-2 transition-transform group-hover:rotate-0"></div>
              
              {/* Slider Container */}
              <div className="relative rounded-2xl shadow-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-gray-100">
                  {careerMoments.length > 0 ? (
                      careerMoments.map((moment, index) => (
                          <div 
                            key={moment.id}
                            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                            }`}
                          >
                              {/* Image */}
                              <img 
                                src={moment.src} 
                                alt={moment.label} 
                                className="w-full h-full object-cover"
                              />
                              
                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
                              
                              {/* Text Overlay */}
                              <div className="absolute bottom-0 right-0 w-full p-6 text-right translate-y-0 transition-transform">
                                  <span className="inline-block px-2 py-1 bg-gold-500 text-black text-xs font-bold rounded mb-2">
                                      {moment.year}
                                  </span>
                                  <p className="text-white text-lg font-bold font-heading">
                                      {moment.label}
                                  </p>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                          لا توجد صور حالياً
                      </div>
                  )}

                  {/* Indicators */}
                  {careerMoments.length > 1 && (
                      <div className="absolute bottom-6 left-6 flex gap-2 z-20">
                          {careerMoments.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === currentSlide ? 'w-8 bg-gold-500' : 'w-2 bg-white/50 hover:bg-white'
                                }`}
                              />
                          ))}
                      </div>
                  )}
              </div>

              {/* Stats Card (Floating) */}
              <div className="absolute -bottom-6 -left-6 bg-white border border-gray-100 p-6 rounded-xl shadow-xl hidden md:block z-30 animate-fade-in-up">
                 <div className="flex gap-8">
                    <div className="text-center">
                       <p className="text-3xl font-bold text-gold-600 font-heading">+25</p>
                       <p className="text-xs text-gray-500 font-bold">عاماً من العطاء</p>
                    </div>
                    <div className="text-center border-r border-gray-200 pr-8">
                       <p className="text-3xl font-bold text-slate-900 font-heading">+2000</p>
                       <p className="text-xs text-gray-500 font-bold">حلقة تلفزيونية</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Content Column */}
           <div className="lg:pr-8">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-1 bg-gold-500 rounded-full"></div>
                <span className="text-gold-600 font-bold text-sm tracking-wider">سيرة ومسيرة</span>
             </div>
             
             <h2 className="text-4xl font-heading font-bold text-slate-900 mb-6 leading-tight">
                مسيرة حافلة <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-slate-700 to-slate-900">بالعطاء الإعلامي والوطني</span>
             </h2>
             
             <p className="text-gray-600 leading-loose text-lg mb-8 text-justify">
                جميل عزالدين ليس اسماً عابراً في الإعلام اليمني، بل هو ذاكرة حية ارتبطت بأحداث مصيرية في تاريخ اليمن الحديث.
                بدأ مسيرته كمذيع لامع يمتلك صوتاً جهورياً وحضوراً طاغياً، وتدرج في المناصب حتى وصل إلى رئاسة قطاع التلفزيون في الفضائية اليمنية، بالإضافة إلى دوره الوطني كعميد في التوجيه المعنوي، حاملاً الكلمة والبندقية في خندق الدفاع عن الجمهورية.
             </p>

             <div className="space-y-6 border-r-2 border-gray-100 pr-6 mr-2">
                <div className="relative">
                   <div className="absolute -right-[31px] top-0 w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded-full"></div>
                   <div className="flex gap-4 items-start">
                       <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-1"><Mic size={20} /></div>
                       <div>
                          <h4 className="font-bold text-slate-800 text-lg">صوت الجمهورية</h4>
                          <p className="text-gray-500 text-sm">يمتلك خامة صوتية فريدة جعلته المعلق الرسمي لأهم الأحداث الوطنية.</p>
                       </div>
                   </div>
                </div>

                <div className="relative">
                   <div className="absolute -right-[31px] top-0 w-4 h-4 bg-gold-100 border-2 border-gold-500 rounded-full"></div>
                   <div className="flex gap-4 items-start">
                       <div className="bg-gold-50 p-2 rounded-lg text-gold-600 mt-1"><Award size={20} /></div>
                       <div>
                          <h4 className="font-bold text-slate-800 text-lg">تكريمات مستحقة</h4>
                          <p className="text-gray-500 text-sm">حاز على العديد من الدروع والأوسمة تقديراً لدوره في تعزيز الوعي الوطني.</p>
                       </div>
                   </div>
                </div>

                <div className="relative">
                   <div className="absolute -right-[31px] top-0 w-4 h-4 bg-green-100 border-2 border-green-500 rounded-full"></div>
                   <div className="flex gap-4 items-start">
                       <div className="bg-green-50 p-2 rounded-lg text-green-600 mt-1"><Users size={20} /></div>
                       <div>
                          <h4 className="font-bold text-slate-800 text-lg">نبض الشارع</h4>
                          <p className="text-gray-500 text-sm">من خلال برامجه الميدانية، يظل دائماً قريباً من هموم المواطن وتطلعاته.</p>
                       </div>
                   </div>
                </div>
             </div>
             
             <div className="mt-10">
                 <button 
                    onClick={onNavigateToArticles}
                    className="group flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/30"
                 >
                    <Newspaper size={20} className="text-gold-500" />
                    <span>تصفح الأرشيف والمقالات</span>
                    <ChevronLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
                 </button>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
