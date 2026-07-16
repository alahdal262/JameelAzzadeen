
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
import { SOCIAL_ARTICLES } from './socialArticles';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.HOME);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!StorageService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  
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
              // Test connection first to fail fast if the API/database is unreachable
              const connectionTest = await StorageService.testConnection();
              if (!connectionTest.success) {
                  console.error("Connection test failed:", connectionTest.message);
                  setConnectionError(true);
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

              // One-time sync for social articles if missing.
              // Non-fatal: persisting requires an authenticated admin session, so for
              // anonymous visitors we still merge the bundled articles into local state.
              if (aData.length < 5) { // Assuming if there are very few articles, we need the bulk upload
                  const hasSocial = aData.some(a => a.id.startsWith('social-art-'));
                  if (!hasSocial) {
                      setArticles([...SOCIAL_ARTICLES, ...aData]);
                      try {
                          await StorageService.saveArticles([...SOCIAL_ARTICLES, ...aData]);
                      } catch (syncErr) {
                          console.warn("Social articles sync skipped (requires admin session):", syncErr);
                      }
                  }
              }
          } catch (e) {
              console.error("Failed to load data", e);
              setConnectionError(true);
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
      
      // #dashboard must win over the /login path — otherwise a successful
      // login at /login re-routes back to the login view forever.
      if (hash === '#dashboard') {
        setCurrentView('dashboard');
      } else if (path === '/login' || hash === '#login') {
        setCurrentView('login');
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
          // normalize away a possible /login path so routing lands on the dashboard
          window.history.replaceState(null, '', '/#dashboard');
          setCurrentView('dashboard');
      }
  };

  const handleLogout = () => {
      StorageService.logout();
      setIsAuthenticated(false);
      navigateHome();
  };

  // --------------------------------------------------------------------------
  // CONNECTION ERROR SCREEN
  // --------------------------------------------------------------------------
  if (connectionError) {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-center">
                  <div className="bg-red-600 p-6 text-white flex items-center justify-center gap-3">
                      <AlertTriangle size={32} />
                      <h1 className="text-xl font-bold">تعذر الاتصال بالخادم</h1>
                  </div>
                  <div className="p-8 space-y-6">
                      <p className="text-slate-700 leading-relaxed">
                          نواجه صعوبة مؤقتة في جلب بيانات الموقع. يرجى التحقق من اتصالك بالإنترنت ثم إعادة المحاولة بعد قليل.
                      </p>
                      <button
                          onClick={() => window.location.reload()}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-bold inline-flex items-center gap-2 transition-colors"
                      >
                          <RefreshCw size={18} />
                          إعادة المحاولة
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (isLoading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4 relative overflow-hidden">
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
              `}</style>
              <div className="z-10 text-center space-y-4">
                  <h1 className="text-3xl md:text-5xl font-heading font-black shimmer-text leading-tight p-2">
                      الإعلامي جميل عزالدين
                  </h1>
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
