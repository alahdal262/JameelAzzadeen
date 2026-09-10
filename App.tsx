
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { AlertTriangle, RefreshCw } from 'lucide-react';

// ---------------------------------------------------------------------------
// Routing — History API (pushState) with clean slug paths.
// URL contract:
//   /                     home
//   /<section>            home scrolled to section (about|gallery|videos|twitter|facebook|testimonials)
//   /articles             blog page
//   /articles/<slug>      blog page with that article open (legacy /articles/<id>
//                         still resolves; the server 301s it and the client
//                         canonicalizes via replaceState as a fallback)
//   /login                login (redirects to /dashboard when authenticated)
//   /dashboard[/<tab>]    admin dashboard (tab slugs: testimonials|videos|about|gallery|articles|backup|account)
//   anything else         404 view
// Legacy hashes (#articles/#login/#dashboard/#section-*) and WordPress paths
// (/category/*, /tag/*) are normalized via history.replaceState.
// ---------------------------------------------------------------------------

const SECTION_SLUGS = ['about', 'gallery', 'videos', 'twitter', 'facebook', 'testimonials'] as const;
type SectionSlug = (typeof SECTION_SLUGS)[number];

const DASHBOARD_TAB_SLUGS = ['testimonials', 'videos', 'about', 'gallery', 'articles', 'backup', 'account'] as const;

const SECTION_TITLES: Record<SectionSlug, string> = {
  about: 'من هو جميل عزالدين',
  gallery: 'مكتبة الصور',
  videos: 'فيديوهات',
  twitter: 'تغريدات',
  facebook: 'فيسبوك',
  testimonials: 'قالوا عنه',
};

const DASHBOARD_TAB_TITLES: Record<string, string> = {
  testimonials: 'الآراء والصور',
  videos: 'الفيديوهات',
  about: 'صور السيرة',
  gallery: 'المعرض',
  articles: 'المقالات',
  backup: 'النسخ الاحتياطي',
  account: 'حساب الدخول',
};

const DEFAULT_TITLE = 'جميل عزالدين | الإعلامي والعميد';

interface RouteState {
  view: AppView;
  sectionSlug?: SectionSlug;
  /** Second /articles segment — an article slug, or a legacy article id. */
  articleKey?: string;
  dashboardTab?: string;
}

// Malformed percent-encodings must never crash routing.
const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// Map a legacy hash route to its clean-path equivalent (null = not legacy).
const legacyHashToPath = (hash: string): string | null => {
  if (hash === '#dashboard') return '/dashboard';
  if (hash === '#login') return '/login';
  if (hash === '#articles') return '/articles';
  if (hash.startsWith('#section-')) {
    const slug = safeDecode(hash.slice('#section-'.length));
    return (SECTION_SLUGS as readonly string[]).includes(slug) ? `/${slug}` : '/';
  }
  return null;
};

const parseRoute = (rawPath: string): RouteState => {
  let path = safeDecode(rawPath || '/');
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/+$/, '') || '/'; // strip trailing slashes (keep root)

  if (path === '/') return { view: 'home' };

  const segments = path.slice(1).split('/');
  const [first, second] = segments;

  if (segments.length === 1 && (SECTION_SLUGS as readonly string[]).includes(first)) {
    return { view: 'home', sectionSlug: first as SectionSlug };
  }
  if (first === 'articles') {
    if (segments.length === 1) return { view: 'articles' };
    if (segments.length === 2 && second) return { view: 'articles', articleKey: second };
    return { view: 'notfound' };
  }
  if (first === 'login' && segments.length === 1) return { view: 'login' };
  if (first === 'dashboard') {
    if (segments.length === 1) return { view: 'dashboard' };
    if (segments.length === 2 && (DASHBOARD_TAB_SLUGS as readonly string[]).includes(second)) {
      return { view: 'dashboard', dashboardTab: second };
    }
    return { view: 'notfound' };
  }
  // Legacy WordPress paths → blog. The server 301s these too; this is the
  // client-side fallback (e.g. dev server).
  if (first === 'category' || first === 'tag') return { view: 'articles' };

  return { view: 'notfound' };
};

// Read the current location, normalizing legacy URLs to clean paths.
const readLocation = (): RouteState => {
  const legacyPath = legacyHashToPath(window.location.hash);
  if (legacyPath) {
    window.history.replaceState(null, '', legacyPath);
    return parseRoute(legacyPath);
  }
  const decodedPath = safeDecode(window.location.pathname);
  if (/^\/(category|tag)(\/|$)/.test(decodedPath)) {
    window.history.replaceState(null, '', '/articles');
    return { view: 'articles' };
  }
  return parseRoute(window.location.pathname);
};

// ---------------------------------------------------------------------------
// 404 view — on-brand dark navy/gold design.
// ---------------------------------------------------------------------------
const NotFoundView: React.FC<{ onGoHome: () => void; onGoArticles: () => void }> = ({ onGoHome, onGoArticles }) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
    <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full pointer-events-none"></div>
    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full pointer-events-none"></div>
    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cube-coat.png')] pointer-events-none"></div>

    <div className="relative z-10 text-center space-y-8 max-w-xl">
      <div className="inline-block px-4 py-1 bg-gold-500/10 border border-gold-500/30 rounded-full">
        <span className="text-gold-500 font-bold text-sm">الإعلامي والعميد جميل عزالدين</span>
      </div>
      <h1 className="text-8xl md:text-9xl font-heading font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-gold-400 to-amber-600">
        ٤٠٤
      </h1>
      <div className="space-y-3">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">الصفحة غير موجودة</h2>
        <p className="text-gray-400 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها إلى عنوان آخر.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4 pt-2">
        <button
          onClick={onGoHome}
          className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-slate-900 font-bold rounded-lg transition-all shadow-lg shadow-gold-500/20"
        >
          العودة للرئيسية
        </button>
        <button
          onClick={onGoArticles}
          className="px-8 py-3 border border-gray-600 hover:border-gold-500 text-gray-300 hover:text-gold-500 font-bold rounded-lg transition-all"
        >
          تصفح المقالات
        </button>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [route, setRoute] = useState<RouteState>(() => parseRoute(window.location.pathname));
  const [activeSection, setActiveSection] = useState<Section>(Section.HOME);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!StorageService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Tracks whether the currently-open article URL was pushed from the list
  // (so closing can history.back()) or reached by direct load (so closing
  // pushes /articles instead).
  const pushedArticleRef = useRef(false);

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
          } catch (e) {
              console.error("Failed to load data", e);
              setConnectionError(true);
          } finally {
              setIsLoading(false);
          }
      };
      loadData();
  }, []);

  // Routing: normalize legacy URLs on mount and react to back/forward.
  useEffect(() => {
    const onLocationChange = () => setRoute(readLocation());
    onLocationChange(); // initial parse + legacy-hash normalization (replaceState)
    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange); // legacy in-page hash links
    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('hashchange', onLocationChange);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname + window.location.hash !== path) {
      window.history.pushState(null, '', path);
    }
    setRoute(parseRoute(path));
  }, []);

  // A logged-in user landing on /login goes straight to /dashboard
  // (path equivalent of the old "#dashboard wins over /login" rule).
  useEffect(() => {
    if (route.view === 'login' && isAuthenticated) {
      window.history.replaceState(null, '', '/dashboard');
      setRoute({ view: 'dashboard' });
    }
  }, [route, isAuthenticated]);

  // Scroll to the routed section once the home view is rendered,
  // and keep the Header highlighting in sync.
  useEffect(() => {
    if (isLoading || route.view !== 'home') return;
    if (route.sectionSlug) {
      setActiveSection(route.sectionSlug as Section);
      const timer = window.setTimeout(() => {
        document.getElementById(route.sectionSlug!)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => window.clearTimeout(timer);
    }
    setActiveSection(Section.HOME);
  }, [route, isLoading]);

  // Scroll to top when switching to a full-page view.
  const prevViewRef = useRef<AppView>(route.view);
  useEffect(() => {
    if (prevViewRef.current !== route.view) {
      prevViewRef.current = route.view;
      if (route.view === 'articles' || route.view === 'notfound') {
        window.scrollTo(0, 0);
      }
    }
  }, [route.view]);

  // document.title per route.
  useEffect(() => {
    let title = DEFAULT_TITLE;
    switch (route.view) {
      case 'home':
        title = route.sectionSlug ? `جميل عزالدين | ${SECTION_TITLES[route.sectionSlug]}` : DEFAULT_TITLE;
        break;
      case 'articles': {
        const article = route.articleKey
          ? articles.find(a => a.slug === route.articleKey) ?? articles.find(a => a.id === route.articleKey)
          : undefined;
        title = article ? `جميل عزالدين | ${article.title}` : 'جميل عزالدين | المقالات';
        break;
      }
      case 'login':
        title = 'تسجيل الدخول';
        break;
      case 'dashboard':
        title = `لوحة التحكم | ${DASHBOARD_TAB_TITLES[route.dashboardTab ?? DASHBOARD_TAB_SLUGS[0]]}`;
        break;
      case 'notfound':
        title = '٤٠٤ | الصفحة غير موجودة';
        break;
    }
    document.title = title;
  }, [route, articles]);

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

  const navigateHome = useCallback(() => {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const navigateToArticles = useCallback(() => {
      navigate('/articles');
  }, [navigate]);

  // Section navigation: push the clean slug path; the route effect above
  // performs the smooth scroll after the home view renders.
  const scrollToSection = useCallback((sectionId: Section) => {
    if (sectionId === Section.HOME) {
        navigateHome();
        return;
    }
    if ((SECTION_SLUGS as readonly string[]).includes(sectionId)) {
        navigate(`/${sectionId}`);
    } else {
        // Sections without a public slug (e.g. contact) just scroll in place.
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(sectionId);
    }
  }, [navigate, navigateHome]);

  const handleOpenArticle = useCallback((articleKey: string) => {
      pushedArticleRef.current = true;
      navigate(`/articles/${articleKey}`);
  }, [navigate]);

  // Canonicalize legacy /articles/<id> deep links to the slug URL. This is the
  // client-side fallback (dev server); production 301s at the Express layer.
  useEffect(() => {
      if (route.view !== 'articles' || !route.articleKey || articles.length === 0) return;
      const bySlug = articles.find(a => a.slug === route.articleKey);
      if (bySlug) return;
      const byId = articles.find(a => a.id === route.articleKey);
      if (byId?.slug) {
          window.history.replaceState(null, '', `/articles/${byId.slug}`);
          setRoute({ view: 'articles', articleKey: byId.slug });
      }
  }, [route, articles]);

  const handleCloseArticle = useCallback(() => {
      if (pushedArticleRef.current) {
          pushedArticleRef.current = false;
          window.history.back(); // popstate listener restores /articles
      } else {
          // Direct load of /articles/<id>: there is no list entry to go back to.
          navigate('/articles');
      }
  }, [navigate]);

  const handleLogin = (success: boolean) => {
      if (success) {
          setIsAuthenticated(true);
          // Normalize away the /login path so refresh/back lands on the dashboard.
          window.history.replaceState(null, '', '/dashboard');
          setRoute({ view: 'dashboard' });
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

  if (route.view === 'notfound') {
      return <NotFoundView onGoHome={navigateHome} onGoArticles={navigateToArticles} />;
  }

  if (route.view === 'login') {
      return <LoginPage onLogin={handleLogin} />;
  }

  if (route.view === 'dashboard') {
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
            initialTab={route.dashboardTab}
            onTabChange={(slug: string) => {
                window.history.replaceState(null, '', '/dashboard/' + slug);
                setRoute({ view: 'dashboard', dashboardTab: slug });
            }}
        />
      );
  }

  return (
    <div className="font-sans text-slate-900 bg-white min-h-screen">
      <Header
        activeSection={activeSection}
        activeView={route.view}
        scrollToSection={scrollToSection}
        onNavigateHome={navigateHome}
      />

      <main>
        {route.view === 'home' ? (
            <>
                <Hero scrollToSection={scrollToSection} heroImage={heroImage} />
                <AboutSection
                    onNavigateToArticles={navigateToArticles}
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
                openArticleKey={route.articleKey}
                onOpenArticle={handleOpenArticle}
                onCloseArticle={handleCloseArticle}
            />
        )}
      </main>

      <Footer scrollToSection={scrollToSection} onNavigateToArticles={navigateToArticles} />
    </div>
  );
};

export default App;
