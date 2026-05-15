
import React from 'react';
import { Twitter, Facebook, Youtube, Mail, MapPin, ArrowUp } from 'lucide-react';
import { Section } from '../types';

interface FooterProps {
    scrollToSection: (section: Section) => void;
}

const Footer: React.FC<FooterProps> = ({ scrollToSection }) => {
  return (
    <footer className="bg-slate-950 text-white pt-20 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
           
           {/* Brand */}
           <div className="col-span-1 md:col-span-1">
             <h2 className="text-2xl font-heading font-bold mb-6">
                <span className="text-gold-500">جميل</span> عزالدين
             </h2>
             <p className="text-gray-400 leading-relaxed text-sm mb-6">
                الموقع الرسمي للإعلامي والعميد جميل عزالدين. نافذتكم على الحقيقة ومنبر للكلمة الوطنية الصادقة.
             </p>
             <div className="flex gap-4">
                <a href="https://twitter.com/gamilaz1" className="w-10 h-10 bg-slate-800 hover:bg-[#1DA1F2] rounded-full flex items-center justify-center transition-colors">
                    <Twitter size={18} />
                </a>
                <a href="https://www.facebook.com/jamilez2015" className="w-10 h-10 bg-slate-800 hover:bg-[#1877F2] rounded-full flex items-center justify-center transition-colors">
                    <Facebook size={18} />
                </a>
                <a href="https://www.youtube.com/channel/UC6w3x_g5oIPabiTR4BOsGXw" className="w-10 h-10 bg-slate-800 hover:bg-[#FF0000] rounded-full flex items-center justify-center transition-colors">
                    <Youtube size={18} />
                </a>
             </div>
           </div>

           {/* Quick Links */}
           <div className="col-span-1">
             <h3 className="text-lg font-bold mb-6 border-b border-gray-800 pb-2 inline-block">روابط سريعة</h3>
             <ul className="space-y-3 text-sm text-gray-400">
                <li><button onClick={() => scrollToSection(Section.ABOUT)} className="hover:text-gold-500 transition-colors">من هو جميل عزالدين</button></li>
                <li><button onClick={() => scrollToSection(Section.GALLERY)} className="hover:text-gold-500 transition-colors">مكتبة الصور</button></li>
                <li><button onClick={() => scrollToSection(Section.VIDEOS)} className="hover:text-gold-500 transition-colors">مكتبة الفيديو</button></li>
                <li><a href="https://gamilazzdeen.com/category/%d9%85%d9%82%d8%a7%d9%84%d8%a7%d8%aa" target="_blank" rel="noreferrer" className="hover:text-gold-500 transition-colors">المقالات</a></li>
                <li><button onClick={() => scrollToSection(Section.TESTIMONIALS)} className="hover:text-gold-500 transition-colors">ماذا قيل عنه</button></li>
             </ul>
           </div>

           {/* Contact Info (Mock) */}
           <div className="col-span-1">
             <h3 className="text-lg font-bold mb-6 border-b border-gray-800 pb-2 inline-block">تواصل معنا</h3>
             <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-3">
                    <Mail size={16} className="text-gold-500" />
                    <span>info@gamilazzdeen.com</span>
                </li>
                <li className="flex items-center gap-3">
                    <MapPin size={16} className="text-gold-500" />
                    <span>اليمن - عدن / مأرب</span>
                </li>
             </ul>
           </div>

            {/* Newsletter (Visual Only) */}
           <div className="col-span-1">
              <h3 className="text-lg font-bold mb-6 border-b border-gray-800 pb-2 inline-block">القائمة البريدية</h3>
              <p className="text-gray-400 text-sm mb-4">اشترك ليصلك أحدث المقالات والأخبار</p>
              <div className="flex">
                  <input type="email" placeholder="البريد الإلكتروني" className="bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-r-lg w-full focus:outline-none focus:border-gold-500 text-sm" />
                  <button className="bg-gold-500 text-slate-900 px-4 py-2 rounded-l-lg font-bold hover:bg-gold-600 transition-colors">
                      اشتراك
                  </button>
              </div>
           </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} جميل عزالدين. جميع الحقوق محفوظة.</p>
            <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
                <a href="#" className="hover:text-white transition-colors">شروط الاستخدام</a>
            </div>
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="flex items-center gap-1 text-gold-500 hover:text-gold-400"
            >
                العودة للأعلى <ArrowUp size={14} />
            </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
