
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import GallerySection from './components/GallerySection';
import YouTubeSlider from './components/YouTubeSlider';
import TwitterCard from './components/TwitterCard';
import FacebookSection from './components/FacebookSection';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import ArticlesPage from './components/ArticlesPage';
import LoginPage from './components/admin/LoginPage';
import Dashboard from './components/admin/Dashboard';
import { Section, AppView, Testimonial, Video, CareerMoment, Article, GalleryImage } from './types';
import { StorageService } from './services/storage';
import { AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

const App: React.FC = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<Section>(Section.HOME);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [careerMoments, setCareerMoments] = useState<CareerMoment[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [heroImage, setHeroImage] = useState<string>('');

  // Async Data Loading with Parallel Execution
  useEffect(() => {
      const loadData = async () => {
          setIsLoading(true);
          try {
              // Test connection first to fail fast on permission error
              const connectionTest = await StorageService.testConnection();
              if (!connectionTest.success && connectionTest.message === 'permission-denied') {
                  setPermissionError(true);
                  setIsLoading(false);
                  return;
              }

              // Run all fetches in parallel to minimize waiting time
              // Each service method now has an internal timeout fallback
              const [tData, vData, cData, aData, gData, hImg] = await Promise.all([
                  StorageService.getTestimonials(),
                  StorageService.getVideos(),
                  StorageService.getCareerMoments(),
                  StorageService.getArticles(),
                  StorageService.getGallery(),
                  StorageService.getHeroImage()
              ]);
              
              setTestimonials(tData);
              setVideos(vData);
              setCareerMoments(cData);
              setArticles(aData);
              setGallery(gData);
              setHeroImage(hImg);
          } catch (e: any) {
              console.error("Failed to load data", e);
              if (e.code === 'permission-denied' || e.message?.includes('permission') || e.message?.includes('Missing or insufficient permissions')) {
                  setPermissionError(true);
              }
          } finally {
              setIsLoading(false);
          }
      };
      loadData();
  }, []);

  // Handle Routing
  useEffect(() => {
    const handleRouteCheck = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (path === '/login' || hash === '#login') {
        setCurrentView('login');
      } else if (hash === '#dashboard') {
        setCurrentView('dashboard');
      } else if (hash === '#articles') {
        setCurrentView('articles');
      } else {
        if (path === '/' && !hash) setCurrentView('home');
        
        if (hash.startsWith('#section-')) {
            const sectionId = hash.replace('#section-', '') as Section;
            if (currentView !== 'home') {
                setCurrentView('home');
                setTimeout(() => {
                    const element = document.getElementById(sectionId);
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                 const element = document.getElementById(sectionId);
                 if (element) element.scrollIntoView({ behavior: 'smooth' });
            }
        }
      }
    };

    handleRouteCheck();
    window.addEventListener('popstate', handleRouteCheck);
    window.addEventListener('hashchange', handleRouteCheck);
    return () => {
        window.removeEventListener('popstate', handleRouteCheck);
        window.removeEventListener('hashchange', handleRouteCheck);
    };
  }, [currentView]);

  // Handle Database Updates
  // CRITICAL FIX: Update State ONLY AFTER StorageService successfully saves
  const handleUpdateTestimonials = async (newItems: Testimonial[]) => {
      await StorageService.saveTestimonials(newItems);
      setTestimonials(newItems);
  };

  const handleUpdateVideos = async (newVideos: Video[]) => {
      await StorageService.saveVideos(newVideos);
      setVideos(newVideos);
  };

  const handleUpdateCareerMoments = async (newMoments: CareerMoment[]) => {
      await StorageService.saveCareerMoments(newMoments);
      setCareerMoments(newMoments);
  };

  const handleUpdateArticles = async (newArticles: Article[]) => {
      await StorageService.saveArticles(newArticles);
      setArticles(newArticles);
  };

  const handleUpdateGallery = async (newGallery: GalleryImage[]) => {
      await StorageService.saveGallery(newGallery);
      setGallery(newGallery);
  };

  const handleUpdateHeroImage = async (url: string) => {
      await StorageService.saveHeroImage(url);
      setHeroImage(url);
  };

  const scrollToSection = (sectionId: Section) => {
    if (currentView !== 'home') {
        setCurrentView('home');
        setTimeout(() => {
             const element = document.getElementById(sectionId);
             if (element) element.scrollIntoView({ behavior: 'smooth' });
             history.pushState(null, '', `/#section-${sectionId}`);
        }, 50);
    } else {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        history.pushState(null, '', `/#section-${sectionId}`);
    }
    setActiveSection(sectionId);
  };

  const navigateHome = () => {
      history.pushState(null, '', '/');
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleLogin = (success: boolean) => {
      if (success) {
          setIsAuthenticated(true);
          window.location.hash = '#dashboard';
          setCurrentView('dashboard');
      }
  };

  const handleLogout = () => {
      StorageService.logout();
      setIsAuthenticated(false);
      navigateHome();
  };

  // --------------------------------------------------------------------------
  // PERMISSION ERROR HELP SCREEN
  // --------------------------------------------------------------------------
  if (permissionError) {
      const rulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
                  <div className="bg-red-600 p-6 text-white flex items-center gap-4">
                      <AlertTriangle size={40} />
                      <div>
                          <h1 className="text-2xl font-bold">تنبيه: قاعدة البيانات مغلقة!</h1>
                          <p className="opacity-90">الموقع لا يستطيع جلب أو حفظ البيانات بسبب إعدادات الأمان في Firebase.</p>
                      </div>
                  </div>
                  
                  <div className="p-8 space-y-6">
                      <p className="text-slate-700 text-lg">
                          لا تقلق، هذا طبيعي عند إنشاء مشروع جديد. القواعد الافتراضية تمنع أي شخص من القراءة أو الكتابة. لحل المشكلة، اتبع الخطوات التالية:
                      </p>
                      
                      <ol className="list-decimal list-inside space-y-3 text-slate-800 font-medium bg-gray-50 p-6 rounded-xl border border-gray-200">
                          <li>اذهب إلى <strong>Firebase Console</strong>.</li>
                          <li>اختر مشروعك <strong>gameelazzadeen</strong>.</li>
                          <li>من القائمة الجانبية اختر <strong>Firestore Database</strong>.</li>
                          <li>اختر التبويب <strong>Rules</strong> (القواعد).</li>
                          <li>امسح الكود الموجود وضع الكود التالي بدلاً منه:</li>
                      </ol>

                      <div className="relative bg-slate-800 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto" dir="ltr">
                          <button 
                              onClick={() => {navigator.clipboard.writeText(rulesCode); alert('تم النسخ!');}}
                              className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded transition-colors"
                              title="نسخ الكود"
                          >
                              <Copy size={16} />
                          </button>
                          <pre>{rulesCode}</pre>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                          <button 
                              onClick={() => window.location.reload()} 
                              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                          >
                              <RefreshCw size={18} />
                              لقد قمت بتحديث القواعد، أعد التحميل
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  if (isLoading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-6 relative overflow-hidden">
              <style>{`
                  @keyframes shimmer {
                      0% { background-position: 200% 0; }
                      100% { background-position: -200% 0; }
                  }
                  .shimmer-text {
                      background: linear-gradient(to right, #475569 0%, #fbbf24 50%, #475569 100%);
                      background-size: 200% auto;
                      background-clip: text;
                      -webkit-background-clip: text;
                      -webkit-text-fill-color: transparent;
                      animation: shimmer 3s linear infinite;
                  }
                  @keyframes spin-slow {
                      to { transform: rotate(360deg); }
                  }
                  .spin-slow { animation: spin-slow 2s linear infinite; }
              `}</style>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_60%)]"></div>
              <div className="z-10 text-center space-y-4">
                  <div className="w-16 h-16 border-2 border-white/10 border-t-gold-500 rounded-full spin-slow mx-auto mb-2"></div>
                  <h1 className="text-3xl md:text-5xl font-heading font-black shimmer-text leading-tight p-2">
                      الإعلامي جميل عزالدين
                  </h1>
                  <p className="text-gray-500 text-sm">{t.loading}</p>
              </div>
          </div>
      );
  }

  if (currentView === 'login') {
      return <LoginPage onLogin={handleLogin} />;
  }

  if (currentView === 'dashboard') {
      if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;
      return (
        <Dashboard 
            testimonials={testimonials} 
            videos={videos}
            careerMoments={careerMoments}
            articles={articles}
            gallery={gallery}
            heroImage={heroImage}
            onUpdateTestimonials={handleUpdateTestimonials} 
            onUpdateVideos={handleUpdateVideos}
            onUpdateCareerMoments={handleUpdateCareerMoments}
            onUpdateArticles={handleUpdateArticles}
            onUpdateGallery={handleUpdateGallery}
            onUpdateHeroImage={handleUpdateHeroImage}
            onLogout={handleLogout} 
        />
      );
  }

  return (
    <div className="font-sans text-slate-900 bg-white min-h-screen">
      <Header 
        activeSection={activeSection} 
        activeView={currentView}
        scrollToSection={scrollToSection} 
        onNavigateHome={navigateHome}
      />
      
      <main>
        {currentView === 'home' ? (
            <>
                <Hero scrollToSection={scrollToSection} heroImage={heroImage} />
                <AboutSection 
                    onNavigateToArticles={() => { window.location.hash = '#articles'; setCurrentView('articles'); }} 
                    careerMoments={careerMoments}
                />
                <GallerySection images={gallery} />
                <YouTubeSlider videos={videos} />
                <TwitterCard />
                <FacebookSection />
                <Testimonials items={testimonials} />
            </>
        ) : (
            <ArticlesPage 
                articles={articles}
                onBack={navigateHome} 
            />
        )}
      </main>

      <Footer scrollToSection={scrollToSection} />
    </div>
  );
};

export default App;
