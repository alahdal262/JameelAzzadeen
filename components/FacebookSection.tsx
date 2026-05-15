import React from 'react';
import { Facebook, ThumbsUp, MessageSquare, Share2, Globe } from 'lucide-react';
import { Section, Post } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

const POSTS: Post[] = [
  {
    id: 'fb1',
    content: 'في ذكرى الأعياد الوطنية، نجدد العهد للوطن وللشهداء بأننا على الدرب سائرون. الجمهورية هي قدرنا ومصيرنا.',
    image: 'https://picsum.photos/seed/fb1/600/400',
    date: 'منذ 3 ساعات',
    platform: 'facebook'
  },
  {
    id: 'fb2',
    content: 'صورة تجمعني اليوم مع أبطال الجيش الوطني في المواقع الأمامية. معنويات تعانق السماء.',
    image: 'https://picsum.photos/seed/fb2/600/800', // Vertical image
    date: 'أمس الساعة 4:00 م',
    platform: 'facebook'
  },
  {
    id: 'fb3',
    content: 'تابعونا الليلة في برنامج "خطوط حمراء" على شاشة الفضائية اليمنية. ملفات هامة سنناقشها بكل شفافية.',
    date: 'منذ يومين',
    platform: 'facebook'
  }
];

const FacebookSection: React.FC = () => {
  const { t, lang } = useLanguage();
  return (
    <section id={Section.FACEBOOK} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-12">
           <div className="w-12 h-12 bg-[#1877F2] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
             <Facebook size={22} />
           </div>
           <div>
             <div className="text-[#1877F2] font-bold text-xs tracking-widest uppercase mb-0.5">{t.facebook.sectionTag}</div>
             <h2 className="text-3xl font-heading font-bold text-slate-800">{lang === 'ar' ? 'فيسبوك' : 'Facebook'}</h2>
             <p className="text-gray-500 text-sm">{t.facebook.subtitle}</p>
           </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
              {/* Post Header */}
              <div className="p-4 flex items-center gap-3">
                <img 
                  src="https://gamilazzdeen.com/wp-content/uploads/2025/12/gamil.png" 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm hover:underline cursor-pointer">جميل عزالدين</h4>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <span>{post.date}</span>
                    <span>•</span>
                    <Globe size={10} />
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="text-xl font-bold leading-none mb-2">...</span>
                </button>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line" dir="auto">
                  {post.content}
                </p>
              </div>

              {/* Post Image (Optional) */}
              {post.image && (
                <div className="mt-2 bg-gray-100">
                  <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[400px]" />
                </div>
              )}

              <div className="mt-auto pt-2">
                 {/* Stats */}
                 <div className="px-4 py-2 flex justify-between items-center text-gray-500 text-xs border-b border-gray-100">
                    <div className="flex items-center gap-1">
                       <div className="bg-[#1877F2] text-white p-0.5 rounded-full"><ThumbsUp size={8} /></div>
                       <span>١٫٢ ألف</span>
                    </div>
                    <div>
                       <span>٣٤٥ تعليق</span> • <span>٥٦ مشاركة</span>
                    </div>
                 </div>

                 {/* Actions */}
                 <div className="px-2 py-1 flex justify-between">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg text-gray-600 text-sm transition-colors">
                      <ThumbsUp size={18} />
                      <span>أعجبني</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg text-gray-600 text-sm transition-colors">
                      <MessageSquare size={18} />
                      <span>تعليق</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg text-gray-600 text-sm transition-colors">
                      <Share2 size={18} />
                      <span>مشاركة</span>
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
            <a href="https://www.facebook.com/jamilez2015" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3 bg-[#1877F2] hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 text-sm">
                <Facebook size={18} />
                {t.facebook.followBtn}
            </a>
        </div>
      </div>
    </section>
  );
};

export default FacebookSection;