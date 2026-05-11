
import React from 'react';
import { Quote } from 'lucide-react';
import { Section, Testimonial } from '../types';

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
    <section id={Section.TESTIMONIALS} className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
            <span className="text-gold-600 font-bold tracking-wider text-sm">أرشيف الآراء</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 mt-2">
                ماذا قيل عنه
            </h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="break-inside-avoid">
                {item.type === 'text' || item.type === 'mixed' ? (
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-gold-500 relative flex flex-col">
                        {/* Adjusted position and opacity to ensure it never hides text */}
                        <Quote className="absolute top-4 right-4 text-gold-500/10 w-20 h-20 transform -scale-x-100 z-0" />
                        
                        <p className="text-slate-700 text-lg leading-relaxed relative z-10 font-medium mb-6 mt-4 indent-[5rem]">
                            "{item.content}"
                        </p>
                        
                        <div className="flex items-center gap-3 mt-auto relative z-10">
                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500 flex-shrink-0">
                                {(item.author && item.author[0]) || '?'}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{item.author}</h4>
                                <p className="text-xs text-slate-500">{item.role}</p>
                            </div>
                        </div>

                        {item.type === 'mixed' && item.src && (
                            <div className="mt-6 pt-6 border-t border-gray-100 relative z-10">
                                <p className="text-xs text-gray-400 mb-2">المصدر (صورة):</p>
                                <img 
                                    src={item.src} 
                                    alt="Source Document" 
                                    className="w-full rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(item.src, '_blank')}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-2xl overflow-hidden shadow-lg group relative cursor-pointer bg-white">
                         {item.src ? (
                            <img 
                                src={item.src} 
                                alt="Screenshot of feedback" 
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                         ) : (
                             <div className="h-64 flex items-center justify-center bg-gray-200 text-gray-400">لا توجد صورة</div>
                         )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold border border-white px-4 py-2 rounded-full backdrop-blur-sm">عرض المنشور</span>
                        </div>
                    </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
