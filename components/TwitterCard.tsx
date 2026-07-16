
import React, { useEffect, useState } from 'react';
import { Twitter, Quote, Share2, Heart, Repeat } from 'lucide-react';
import { Section } from '../types';
import { getLatestTweets } from '../services/geminiService';

const TwitterCard: React.FC = () => {
    const [tweets, setTweets] = useState<string[]>([]);

    useEffect(() => {
        getLatestTweets().then(setTweets);
    }, []);

  return (
    <section id={Section.TWITTER} className="py-24 bg-[#0f172a] relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-600/10 rounded-full blur-[120px]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center p-4 bg-slate-800/50 border border-slate-700 rounded-full mb-6 backdrop-blur-sm shadow-xl">
                <Twitter className="text-[#1DA1F2] w-6 h-6" />
                <span className="mx-3 text-gray-400">|</span>
                <span className="text-gold-500 font-bold tracking-wider">كلمات خالدة</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white leading-tight">
                من وحي <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DA1F2] to-blue-400">اللحظة</span>
            </h2>
            <p className="text-gray-400 mt-4 text-lg max-w-2xl mx-auto font-light">
                مقتطفات وتغريدات تحمل في طياتها حكمة الموقف وبلاغة الكلمة.
            </p>
        </div>

        {/* 3D Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
            {tweets.length > 0 ? (
                tweets.map((tweet, index) => (
                    <div 
                        key={index}
                        className={`
                            group relative bg-slate-800 rounded-2xl p-8 
                            border-t border-l border-white/10 border-b-4 border-r-4 border-b-slate-950 border-r-slate-950
                            transform transition-all duration-500 hover:-translate-y-2 hover:translate-x-1 hover:shadow-[10px_10px_30px_rgba(0,0,0,0.5)]
                            ${index === 0 ? 'lg:col-span-2 lg:row-span-1 bg-gradient-to-br from-slate-800 to-slate-900' : ''}
                        `}
                    >
                        {/* Quote Icon Decoration */}
                        <Quote className="absolute top-6 right-6 text-gold-500/20 w-16 h-16 transform -scale-x-100" />
                        
                        {/* Card Content */}
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <img 
                                    src="/gamil.jpg" 
                                    alt="Profile" 
                                    className="w-10 h-10 rounded-full border border-gold-500/30 p-0.5"
                                />
                                <div>
                                    <h4 className="text-white font-bold text-sm">جميل عزالدين</h4>
                                    <p className="text-[#1DA1F2] text-xs" dir="ltr">@gamilaz1</p>
                                </div>
                                <Twitter className="mr-auto text-[#1DA1F2] w-5 h-5 opacity-80" />
                            </div>

                            <p className={`
                                text-gray-200 font-heading leading-relaxed mb-8
                                ${index === 0 ? 'text-xl md:text-2xl font-bold' : 'text-lg font-medium'}
                            `}>
                                {tweet}
                            </p>

                            <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center text-gray-500 text-xs md:text-sm">
                                <div className="flex gap-4">
                                    <button className="flex items-center gap-1 hover:text-pink-500 transition-colors">
                                        <Heart size={16} /> <span>{(Math.random() * 5).toFixed(1)}k</span>
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                                        <Repeat size={16} /> <span>{(Math.random() * 2).toFixed(1)}k</span>
                                    </button>
                                </div>
                                <span className="text-gray-600">منصة X</span>
                            </div>
                        </div>

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/0 via-gold-500/5 to-gold-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl"></div>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-20 text-gray-500">
                    جاري جلب الحكم والتغريدات...
                </div>
            )}
        </div>

        <div className="text-center mt-16">
            <a 
                href="https://twitter.com/gamilaz1" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-bold rounded-full transition-all shadow-lg hover:shadow-blue-500/25"
            >
                <Twitter size={20} />
                <span>تابع المزيد من التغريدات</span>
            </a>
        </div>
      </div>
    </section>
  );
};

export default TwitterCard;
