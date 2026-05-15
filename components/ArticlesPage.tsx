
import React, { useState } from 'react';
import { ArrowRight, Calendar, User, Clock, X, Share2, ChevronLeft, Newspaper } from 'lucide-react';
import { Article } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ArticlesPageProps {
    onBack: () => void;
    articles: Article[];
}

const ArticlesPage: React.FC<ArticlesPageProps> = ({ onBack, articles }) => {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const { t } = useLanguage();

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
                        مقالات <span className="text-gold-500">ورؤى</span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        قراءات تحليلية ومواقف وطنية.. هنا تجدون أرشيف مقالات الإعلامي جميل عزالدين، التي توثق مرحلة هامة من تاريخ اليمن.
                    </p>
                </div>

                {/* Articles Grid */}
                {articles.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <div 
                                key={article.id} 
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full"
                            >
                                <div className="relative h-56 overflow-hidden bg-gray-200">
                                    <img 
                                        src={article.image} 
                                        alt={article.title} 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => e.currentTarget.src = 'https://picsum.photos/800/600'}
                                    />
                                    <div className="absolute top-4 right-4 bg-gold-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        {article.category}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                                        <Calendar size={12} />
                                        <span>{article.date}</span>
                                        <span className="mx-1">•</span>
                                        <Clock size={12} />
                                        <span>3 د قراءة</span>
                                    </div>
                                    <h3 className="text-xl font-heading font-bold text-slate-900 mb-3 leading-snug group-hover:text-gold-600 transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                                        {article.excerpt}
                                    </p>
                                    <button 
                                        onClick={() => setSelectedArticle(article)}
                                        className="mt-auto flex items-center justify-center gap-2 w-full py-3 border border-slate-200 rounded-lg text-slate-700 font-bold text-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                                    >
                                        قراءة المقال <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <Newspaper size={64} className="mx-auto mb-4 opacity-20" />
                        <p>لا توجد مقالات منشورة حالياً.</p>
                    </div>
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
