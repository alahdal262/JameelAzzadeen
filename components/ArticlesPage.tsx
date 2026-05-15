
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Calendar, User, Clock, X, Share2, ChevronLeft, Newspaper, Quote, ChevronRight, Facebook, Twitter, ExternalLink } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';
import { Article } from '../types';
import { SOCIAL_POSTS, SocialPost } from '../data/socialPosts';

interface ArticlesPageProps {
    onBack: () => void;
    articles: Article[];
}

const SocialPostArticle: React.FC<{ post: SocialPost; reverse?: boolean }> = ({ post, reverse }) => {
    const isTwitter = post.type === 'twitter';
    const color = isTwitter ? '#1DA1F2' : '#1877F2';
    const platformName = isTwitter ? 'X (تويتر)' : 'فيسبوك';
    const [imgFailed, setImgFailed] = useState(false);
    const hasImage = post.image && !imgFailed;

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-500 border border-gray-100 p-6 md:p-8 ${reverse ? 'lg:[direction:ltr]' : ''}`}
        >
            {/* Image column */}
            <div className="lg:col-span-5" style={{ direction: 'rtl' }}>
                {hasImage ? (
                    <a
                        href={post.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="relative block w-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-100 group shadow-md aspect-[4/3]"
                    >
                        <img
                            src={post.image}
                            alt={post.title || 'منشور'}
                            onError={() => setImgFailed(true)}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                        <div
                            className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md border text-xs font-bold text-white"
                            style={{ backgroundColor: `${color}cc`, borderColor: `${color}` }}
                        >
                            {isTwitter ? <Twitter size={12} /> : <Facebook size={12} />}
                            {platformName}
                        </div>
                    </a>
                ) : (
                    <div
                        className="w-full aspect-[4/3] rounded-2xl flex flex-col items-center justify-center gap-4 border-2"
                        style={{
                            background: `linear-gradient(135deg, ${color}26 0%, ${color}0a 100%)`,
                            borderColor: `${color}55`,
                        }}
                    >
                        {isTwitter ? <Twitter size={64} style={{ color }} /> : <Facebook size={64} style={{ color }} />}
                        <span className="text-gray-500 text-sm font-bold">منشور نصي على {platformName}</span>
                    </div>
                )}
            </div>

            {/* Body column */}
            <div className="lg:col-span-7 flex flex-col gap-5" style={{ direction: 'rtl' }}>
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-base font-black text-white shadow-md"
                        style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)` }}
                    >
                        {(post.title || '?')[0]}
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-slate-900 font-bold text-lg md:text-xl leading-tight">{post.title || 'منشور بدون عنوان'}</h3>
                        <span className="text-gray-400 text-xs tracking-wider mt-0.5">
                            منشور على {platformName}
                        </span>
                    </div>
                </div>

                {post.description && (
                    <p className="text-slate-700 text-sm md:text-base leading-loose whitespace-pre-line">
                        {post.description}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2 mt-auto">
                    <a
                        href={post.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-all shadow-md hover:shadow-lg hover:scale-105"
                        style={{ background: `linear-gradient(to right, ${color}, ${color}cc)` }}
                    >
                        <ExternalLink size={14} />
                        قراءة المنشور كاملاً على {platformName}
                    </a>
                    <span className="text-gray-400 text-xs font-mono truncate max-w-[220px]" dir="ltr">
                        {post.sourceUrl}
                    </span>
                </div>
            </div>
        </motion.article>
    );
};

const ArticlesPage: React.FC<ArticlesPageProps> = ({ onBack, articles }) => {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    const handleShare = async () => {
        if (!selectedArticle) return;

        const shareData = {
            title: selectedArticle.title,
            text: selectedArticle.excerpt,
            url: window.location.href // Shares the current site URL
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(`${selectedArticle.title}\n${window.location.href}`);
            alert('تم نسخ رابط الموقع وعنوان المقال إلى الحافظة!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            {/* Header / Nav Area (Mocked by padding-top from main layout) */}
            
            <div className="container mx-auto px-4">
                
                {/* Breadcrumb / Back Button */}
                <div className="flex items-center gap-2 mb-8 text-sm">
                    <button 
                        onClick={onBack}
                        className="flex items-center gap-1 text-gray-500 hover:text-gold-600 transition-colors"
                    >
                        الرئيسية
                    </button>
                    <span className="text-gray-300">/</span>
                    <span className="text-slate-800 font-bold">المقالات</span>
                </div>

                {/* Page Title */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4">
                        المركز <span className="text-gold-500">الإعلامي</span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        متابعة مستمرة لأهم المقالات التحليلية والشهادات الوطنية المكتوبة عن مسيرة الإعلامي جميل عزالدين.
                    </p>
                </div>

                {/* Articles Grid */}
                {articles.length > 0 ? (
                    <div className="space-y-24">
                        {/* Standard Articles Section */}
                        {articles.filter(a => a.category !== "ماذا قيل عنه").length > 0 && (
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <h2 className="text-3xl font-heading font-bold text-slate-800 whitespace-nowrap">المقالات والتحليلات</h2>
                                    <div className="h-px bg-gradient-to-l from-slate-200 to-transparent flex-1"></div>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {articles.filter(a => a.category !== "ماذا قيل عنه").map((article) => (
                                        <div 
                                            key={article.id} 
                                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 group flex flex-col h-full"
                                        >
                                            <div className="relative h-56 overflow-hidden bg-gray-200">
                                                <img 
                                                    src={article.image} 
                                                    alt={article.title} 
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                    onError={(e) => e.currentTarget.src = 'https://picsum.photos/800/600'}
                                                />
                                                <div className="absolute top-4 right-4 bg-gold-500 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-lg">
                                                    {article.category}
                                                </div>
                                            </div>
                                            <div className="p-7 flex flex-col flex-1">
                                                <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                                                    <Calendar size={12} className="text-gold-500" />
                                                    <span>{article.date}</span>
                                                </div>
                                                <h3 className="text-xl font-heading font-bold text-slate-900 mb-4 leading-snug group-hover:text-gold-600 transition-colors">
                                                    {article.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                                                    {article.excerpt}
                                                </p>
                                                <button 
                                                    onClick={() => setSelectedArticle(article)}
                                                    className="mt-auto flex items-center justify-between w-full p-4 bg-slate-50 rounded-xl text-slate-700 font-bold text-sm group-hover:bg-gold-500 group-hover:text-white transition-all"
                                                >
                                                    <span>قراءة التفاصيل</span> 
                                                    <ArrowRight size={18} className="transform -rotate-180 group-hover:translate-x-[-4px] transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section Divider/Separator */}
                        {articles.filter(a => a.category !== "ماذا قيل عنه").length > 0 && articles.filter(a => a.category === "ماذا قيل عنه").length > 0 && (
                            <div className="flex justify-center items-center gap-8 py-4 opacity-30">
                                <div className="h-px bg-gradient-to-l from-transparent to-gold-500 flex-1"></div>
                                <div className="w-2 h-2 rounded-full bg-gold-500 rotate-45"></div>
                                <div className="h-px bg-gradient-to-r from-transparent to-gold-500 flex-1"></div>
                            </div>
                        )}

                        {/* Social Testimonials Slider Section */}
                        {articles.filter(a => a.category === "ماذا قيل عنه").length > 0 && (
                            <section className="relative overflow-hidden py-16">
                                <div className="absolute inset-0 bg-slate-900 -mx-4 md:-mx-12 rounded-[2rem] md:rounded-[4rem] shadow-2xl"></div>
                                <div className="relative z-10">
                                    <div className="text-center mb-12">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 text-gold-500 rounded-2xl mb-4 border border-white/10 backdrop-blur-sm self-center">
                                            <Quote size={32} fill="currentColor" className="opacity-20" />
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">ماذا قيل <span className="text-gold-500">عنه</span></h2>
                                        <p className="text-slate-400 max-w-xl mx-auto px-4">شهادات وقراءات من زملاء الحرف والكلمة - تمرر من اليسار لليمين</p>
                                    </div>

                                    {/* Moving Slider Container */}
                                    <div className="flex overflow-hidden relative group">
                                        <motion.div 
                                            className="flex gap-6 px-4"
                                            animate={{
                                                x: ["-50%", "0%"]
                                            }}
                                            transition={{
                                                duration: 40,
                                                ease: "linear",
                                                repeat: Infinity
                                            }}
                                            style={{ width: "fit-content" }}
                                        >
                                            {/* Duplicating items for seamless loop */}
                                            {[...articles.filter(a => a.category === "ماذا قيل عنه"), ...articles.filter(a => a.category === "ماذا قيل عنه")].map((article, idx) => (
                                                <div 
                                                    key={`${article.id}-${idx}`} 
                                                    className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl w-80 shrink-0 flex flex-col h-[400px] hover:border-gold-500/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-gold-500/20">
                                                            <img src={article.image} alt="User" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-white font-bold text-base leading-tight break-words">{article.title.replace('ماذا قيل عنه: ', '').replace(' يتحدث عن جميل عزالدين', '')}</h4>
                                                            <p className="text-gold-500/70 text-xs mt-1">{article.date}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="relative mb-8 flex-1">
                                                        <p className="text-slate-300 text-sm italic leading-loose line-clamp-5">
                                                            "{article.excerpt}"
                                                        </p>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="mt-auto flex items-center gap-2 text-gold-500 text-sm font-bold w-fit py-2 hover:text-gold-400 transition-all"
                                                    >
                                                        قراءة المزيد <ChevronLeft size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <Newspaper size={64} className="mx-auto mb-4 opacity-20" />
                        <p>لا توجد مقالات منشورة حالياً.</p>
                    </div>
                )}

                {/* Social Posts as Articles */}
                {SOCIAL_POSTS && SOCIAL_POSTS.length > 0 && (
                    <section className="mt-24">
                        <div className="flex items-center gap-6 mb-12">
                            <h2 className="text-3xl font-heading font-bold text-slate-800 whitespace-nowrap">
                                <span className="text-gold-500">منشورات</span> من منصات التواصل
                            </h2>
                            <div className="h-px bg-gradient-to-l from-slate-200 to-transparent flex-1"></div>
                        </div>
                        <p className="text-gray-500 mb-10 max-w-2xl text-sm md:text-base leading-relaxed">
                            مجموعة من المنشورات الكاملة التي شاركها متابعون وكتّاب عن الإعلامي جميل عزّالدين على فيسبوك وX (تويتر).
                        </p>

                        <div className="space-y-12">
                            {SOCIAL_POSTS.map((post, idx) => <SocialPostArticle key={post.id} post={post} reverse={idx % 2 === 1} />)}
                        </div>
                    </section>
                )}
            </div>

            {/* Article Modal */}
            {selectedArticle && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedArticle(null)}
                    ></div>
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 animate-fade-in-up">
                        
                        {/* Modal Header Image */}
                        <div className="relative h-64 md:h-80 w-full">
                            <img 
                                src={selectedArticle.image} 
                                alt={selectedArticle.title} 
                                className="w-full h-full object-cover"
                                onError={(e) => e.currentTarget.src = 'https://picsum.photos/800/600'}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col justify-end p-8">
                                <div className="flex items-center gap-2 text-gold-400 text-sm font-bold mb-2">
                                     <span className="bg-gold-500/20 px-2 py-1 rounded">{selectedArticle.category}</span>
                                     <span>•</span>
                                     <span>{selectedArticle.date}</span>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-heading font-bold text-white leading-tight">
                                    {selectedArticle.title}
                                </h2>
                            </div>
                            <button 
                                onClick={() => setSelectedArticle(null)}
                                className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 md:p-12">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold-500">
                                        <img src="https://gamilazzdeen.com/wp-content/uploads/2025/12/gamil.png" alt="Author" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">جميل عزالدين</p>
                                        <p className="text-xs text-gray-500">إعلامي وكاتب</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleShare}
                                    className="flex items-center gap-2 text-gray-500 hover:text-gold-500 transition-colors"
                                >
                                    <Share2 size={18} />
                                    <span className="hidden md:inline">مشاركة</span>
                                </button>
                            </div>

                            <div 
                                className="prose prose-lg prose-slate max-w-none font-sans"
                                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                            />

                            <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                                <button 
                                    onClick={() => setSelectedArticle(null)}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors"
                                >
                                    إغلاق المقال
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticlesPage;
