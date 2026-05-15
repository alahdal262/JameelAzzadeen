
import React from 'react';
import { Quote, MessageSquare, Sparkles } from 'lucide-react';
import { Section, Testimonial } from '../types';
import SocialPostsSlider from './SocialPostsSlider';

export const INITIAL_TESTIMONIALS: Testimonial[] = [
    { id: 1, type: 'text', content: "جميل عزالدين ليس مجرد إعلامي، بل هو جبهة إعلامية بحد ذاته، كلماته رصاصات في صدور الأعداء.", author: "د. محمد العامري", role: "مستشار رئاسي" },
    { id: 2, type: 'image', src: 'https://picsum.photos/seed/test2/400/300' },
    { id: 3, type: 'text', content: "الروح الوطنية التي يتمتع بها العميد جميل عزالدين تلهمنا جميعاً. هو صوت الحق في زمن الضجيج.", author: "ناشط سياسي", role: "تويتر" },
    { id: 4, type: 'image', src: 'https://picsum.photos/seed/test4/400/500' },
    { id: 5, type: 'image', src: 'https://picsum.photos/seed/test5/400/400' },
    { id: 6, type: 'text', content: "برامجه تعيد صياغة الوعي الوطني لدى الشباب اليمني.", author: "صحيفة الثورة", role: "مقال افتتاحي" },
];

interface TestimonialsProps {
    items: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ items }) => {
  return (
    <section
      id={Section.TESTIMONIALS}
      className="relative py-24 overflow-hidden bg-slate-950"
    >
      {/* Background pattern + glow */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[400px] bg-gold-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[40%] h-[300px] bg-blue-500/5 blur-[100px] rounded-full"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/5 mb-5">
            <Sparkles size={14} className="text-gold-400" />
            <span className="text-gold-400 font-bold tracking-wider text-xs">أرشيف الآراء</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-heading font-black text-white">
            ماذا <span className="text-gold-400">قيل عنه</span>
          </h2>
          <p className="text-white/50 mt-4 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            شهادات وآراء وكلمات من شخصيات ومتابعين ومؤسسات إعلامية
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-12 h-px bg-gold-500/40"></div>
            <div className="w-2 h-2 rounded-full bg-gold-500"></div>
            <div className="w-12 h-px bg-gold-500/40"></div>
          </div>
        </div>

        {/* Testimonials masonry */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="break-inside-avoid">
              {item.type === 'text' || item.type === 'mixed' ? (
                <div className="relative bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-gold-500/40 shadow-2xl flex flex-col group transition-all duration-500 hover:-translate-y-1">
                  {/* Gold corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gold-500/20 to-transparent rounded-tr-2xl pointer-events-none"></div>
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent"></div>

                  <Quote className="absolute top-5 right-5 text-gold-500/15 w-20 h-20 transform -scale-x-100 z-0" />

                  <p className="text-white/85 text-lg leading-loose relative z-10 font-medium mb-6 mt-4 indent-[5rem]">
                    "{item.content}"
                  </p>

                  <div className="flex items-center gap-3 mt-auto relative z-10 pt-4 border-t border-white/5">
                    <div className="w-11 h-11 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center font-bold text-slate-900 flex-shrink-0 shadow-lg">
                      {(item.author && item.author[0]) || '?'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.author}</h4>
                      <p className="text-xs text-gold-400/70">{item.role}</p>
                    </div>
                  </div>

                  {item.type === 'mixed' && item.src && (
                    <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                      <p className="text-xs text-white/40 mb-2">المصدر (صورة):</p>
                      <img
                        src={item.src}
                        alt="Source Document"
                        className="w-full rounded-lg border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(item.src, '_blank')}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden shadow-2xl group relative cursor-pointer bg-slate-900/60 border border-white/10 hover:border-gold-500/40 transition-all duration-500 hover:-translate-y-1">
                  {item.src ? (
                    <img
                      src={item.src}
                      alt="Screenshot of feedback"
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-slate-800 text-white/30">لا توجد صورة</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <span className="text-white font-bold border border-gold-400/60 bg-slate-900/80 px-5 py-2 rounded-full backdrop-blur-sm text-sm">
                      عرض المنشور
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Elegant separator */}
        <div className="flex items-center justify-center gap-6 my-20">
          <div className="h-px flex-1 bg-gradient-to-l from-gold-500/40 via-gold-500/15 to-transparent"></div>
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-gold-500/30 bg-gold-500/[0.07] backdrop-blur-sm shadow-lg">
            <MessageSquare size={14} className="text-gold-400" />
            <span className="text-gold-300 text-xs font-bold tracking-widest">منصات التواصل الاجتماعي</span>
            <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></div>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-gold-500/40 via-gold-500/15 to-transparent"></div>
        </div>

        {/* Slider sub-section header */}
        <div className="mb-12 text-center">
          <h3 className="text-3xl md:text-4xl font-heading font-black text-white">
            آراء ومنشورات من <span className="text-gold-400">منصات التواصل</span>
          </h3>
          <p className="text-white/50 mt-3 text-sm md:text-base">
            ما قاله المتابعون والمعجبون على فيسبوك وتويتر
          </p>
        </div>

        {/* Slider container */}
        <div className="relative bg-slate-900/40 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-2xl border border-white/10">
          {/* Gold edge top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent"></div>
          <SocialPostsSlider />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
