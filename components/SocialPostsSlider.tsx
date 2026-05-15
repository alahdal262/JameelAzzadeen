import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Facebook, Twitter, ChevronLeft, ChevronRight, ExternalLink, Pause, Play, Quote } from 'lucide-react';
import { SOCIAL_POSTS, SocialPost } from '../data/socialPosts';

// ─── Embed config ───────────────────────────────────────────────────────────
const FB_EMBED_WIDTH = 500;   // FB plugin sweet spot
const FB_EMBED_HEIGHT = 700;  // tall enough for most posts incl. image + text

// X (Twitter) widgets.js — assume already loaded in index.html
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (target?: HTMLElement | null) => void;
        createTweet?: (id: string, target: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLElement>;
      };
    };
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const buildFbEmbedSrc = (postUrl: string) =>
  `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(postUrl)}` +
  `&show_text=true&width=${FB_EMBED_WIDTH}&appId=&locale=ar_AR`;

const extractTweetId = (url: string): string | null => {
  const m = url.match(/status\/(\d+)/);
  return m ? m[1] : null;
};

const hostFromUrl = (url: string) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
};

// Filter: skip private/unavailable posts (those the scraper couldn't read → empty title)
const isPublicPost = (p: SocialPost) =>
  (p.title && p.title.trim().length > 0) || p.type === 'twitter';

// ─── Facebook embed card ────────────────────────────────────────────────────
const FacebookEmbedCard: React.FC<{ post: SocialPost; isActive: boolean }> = ({ post, isActive }) => {
  // Lazy-mount the iframe only when its slide becomes active (or adjacent),
  // to avoid 21 FB iframes loading at once on first paint.
  const [shouldMount, setShouldMount] = useState(false);
  useEffect(() => {
    if (isActive && !shouldMount) setShouldMount(true);
  }, [isActive, shouldMount]);

  const targetUrl = post.canonicalUrl || post.sourceUrl;

  return (
    <div className="relative bg-slate-900/70 backdrop-blur-sm rounded-3xl overflow-hidden border border-gold-500/20 hover:border-gold-500/50 transition-all duration-500 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
      {/* Gold accent strip */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-l from-[#1877F2]/15 via-slate-900/40 to-slate-900/60">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#1877F2]/20 border border-[#1877F2]/50 shadow-lg shadow-[#1877F2]/20">
            <Facebook size={20} className="text-[#1877F2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm leading-tight">
              {post.title || 'منشور على فيسبوك'}
            </span>
            <span className="text-white/40 text-[11px] tracking-wider mt-0.5">منشور رسمي من فيسبوك</span>
          </div>
        </div>
        <a
          href={targetUrl}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-gold-300 transition-colors px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-gold-500/10 border border-white/10 hover:border-gold-500/40 font-bold"
        >
          <ExternalLink size={12} />
          <span>الأصل</span>
        </a>
      </div>

      {/* Embed body */}
      <div className="flex justify-center items-start py-6 px-3 bg-gradient-to-b from-white/[0.02] via-transparent to-black/30 min-h-[400px]">
        {shouldMount ? (
          <iframe
            title={`Facebook post — ${post.title || post.id}`}
            src={buildFbEmbedSrc(targetUrl)}
            width={FB_EMBED_WIDTH}
            height={FB_EMBED_HEIGHT}
            style={{ border: 'none', overflow: 'hidden', maxWidth: '100%', borderRadius: '12px' }}
            scrolling="no"
            frameBorder={0}
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            loading="lazy"
          />
        ) : (
          <div
            className="flex items-center justify-center w-full max-w-[500px] rounded-xl border border-white/5 bg-slate-950/40"
            style={{ height: `${FB_EMBED_HEIGHT}px` }}
          >
            <div className="flex flex-col items-center gap-3 text-white/40">
              <Facebook size={48} className="text-[#1877F2]/40 animate-pulse" />
              <span className="text-xs font-bold tracking-wider">جاري التحميل…</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer — source link */}
      <div className="px-6 py-3.5 border-t border-white/10 bg-slate-950/50 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-gold-300/80 font-bold tracking-wider shrink-0">
          <Quote size={11} />
          المصدر
        </span>
        <a
          href={targetUrl}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-xs text-white/55 hover:text-gold-300 transition-colors truncate flex-1 font-mono"
          dir="ltr"
        >
          {hostFromUrl(targetUrl)}
        </a>
        <ExternalLink size={11} className="text-white/30 shrink-0" />
      </div>
    </div>
  );
};

// ─── Twitter / X embed card ─────────────────────────────────────────────────
const TwitterEmbedCard: React.FC<{ post: SocialPost; isActive: boolean }> = ({ post, isActive }) => {
  const tweetId = useMemo(() => extractTweetId(post.sourceUrl), [post.sourceUrl]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  // Render the tweet when the card becomes active (lazy) using twttr.widgets.createTweet
  useEffect(() => {
    if (!isActive || rendered || !tweetId || !containerRef.current) return;
    const tryRender = () => {
      if (window.twttr?.widgets?.createTweet && containerRef.current) {
        window.twttr.widgets.createTweet(tweetId, containerRef.current, {
          theme: 'dark',
          lang: 'ar',
          dnt: true,
          conversation: 'none',
          cards: 'visible',
          align: 'center',
        }).then(() => setRendered(true));
      } else {
        // widgets.js still loading; retry
        setTimeout(tryRender, 400);
      }
    };
    tryRender();
  }, [isActive, rendered, tweetId]);

  return (
    <div className="relative bg-slate-900/70 backdrop-blur-sm rounded-3xl overflow-hidden border border-gold-500/20 hover:border-gold-500/50 transition-all duration-500 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-l from-[#1DA1F2]/15 via-slate-900/40 to-slate-900/60">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#1DA1F2]/20 border border-[#1DA1F2]/50 shadow-lg shadow-[#1DA1F2]/20">
            <Twitter size={20} className="text-[#1DA1F2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm leading-tight">منشور على X (تويتر)</span>
            <span className="text-white/40 text-[11px] tracking-wider mt-0.5">منشور رسمي من X</span>
          </div>
        </div>
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-gold-300 transition-colors px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-gold-500/10 border border-white/10 hover:border-gold-500/40 font-bold"
        >
          <ExternalLink size={12} />
          <span>الأصل</span>
        </a>
      </div>

      {/* Embed body */}
      <div className="flex justify-center items-start py-6 px-3 bg-gradient-to-b from-white/[0.02] via-transparent to-black/30 min-h-[400px]">
        <div ref={containerRef} dir="ltr" className="w-full max-w-[550px] flex justify-center">
          {!rendered && (
            <div className="flex flex-col items-center justify-center gap-3 text-white/40 py-20">
              <Twitter size={48} className="text-[#1DA1F2]/40 animate-pulse" />
              <span className="text-xs font-bold tracking-wider">جاري التحميل من X…</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3.5 border-t border-white/10 bg-slate-950/50 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-gold-300/80 font-bold tracking-wider shrink-0">
          <Quote size={11} />
          المصدر
        </span>
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-xs text-white/55 hover:text-gold-300 transition-colors truncate flex-1 font-mono"
          dir="ltr"
        >
          {hostFromUrl(post.sourceUrl)}
        </a>
        <ExternalLink size={11} className="text-white/30 shrink-0" />
      </div>
    </div>
  );
};

// ─── Slider mechanics ───────────────────────────────────────────────────────
const GAP = 24;
const AUTOPLAY_MS = 8500;
const TRANSITION_MS = 700;
const REWIND_MS = 1100;

const SocialPostsSlider: React.FC = () => {
  // Filter once: only public posts (those whose scrape returned real data + X posts)
  const posts = useMemo(() => SOCIAL_POSTS.filter(isPublicPost), []);
  const total = posts.length;

  const [current, setCurrent] = useState(0);
  const [isRewinding, setIsRewinding] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(640);
  const viewportRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Responsive card width
  useEffect(() => {
    const update = () => {
      if (viewportRef.current) {
        const w = viewportRef.current.offsetWidth;
        setCardWidth(Math.max(300, w - 8));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback((target: number) => {
    setCurrent(prev => {
      const nextIdx = ((target % total) + total) % total;
      if (prev === total - 1 && nextIdx === 0) {
        setIsRewinding(true);
        setTimeout(() => setIsRewinding(false), REWIND_MS);
      } else {
        setIsRewinding(false);
      }
      return nextIdx;
    });
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Autoplay
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCurrent(c => {
        const nextIdx = (c + 1) % total;
        if (c === total - 1 && nextIdx === 0) {
          setIsRewinding(true);
          setTimeout(() => setIsRewinding(false), REWIND_MS);
        }
        return nextIdx;
      });
    }, AUTOPLAY_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, total]);

  // RTL: positive translateX moves slides to the right; we want next = move to left from viewer perspective
  // In RTL flex layout, slides naturally lay right-to-left. Translating negative X moves toward the left (next slide enters).
  const translateX = -current * (cardWidth + GAP);
  const duration = isRewinding ? REWIND_MS : TRANSITION_MS;

  if (total === 0) {
    return (
      <div className="text-center text-white/50 py-12 text-sm">لا توجد منشورات عامة لعرضها حالياً.</div>
    );
  }

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Counter + play/pause */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => setIsPaused(p => !p)}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-gold-500/20 border border-white/10 hover:border-gold-500/40 flex items-center justify-center text-white/70 hover:text-gold-300 transition-all"
          aria-label={isPaused ? 'تشغيل' : 'إيقاف'}
        >
          {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
        </button>
        <span className="text-white/40 text-xs font-bold tracking-wider">المنشور</span>
        <span
          className="bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/30 px-4 py-1.5 rounded-full text-xs text-gold-300 font-mono font-bold shadow-lg"
          dir="ltr"
        >
          <span className="text-white">{String(current + 1).padStart(2, '0')}</span>
          <span className="text-gold-400/50 mx-1.5">/</span>
          <span className="text-white/60">{String(total).padStart(2, '0')}</span>
        </span>
      </div>

      {/* Viewport */}
      <div ref={viewportRef} className="overflow-hidden px-1">
        <div
          className="flex"
          dir="ltr"
          style={{
            gap: `${GAP}px`,
            transform: `translateX(${translateX}px)`,
            transition: `transform ${duration}ms cubic-bezier(0.32, 0.72, 0, 1)`,
            willChange: 'transform',
          }}
        >
          {posts.map((post, idx) => {
            // Mount ±1 around current for smoother UX, others stay placeholder
            const isActive = idx === current;
            const isAdjacent = Math.abs(idx - current) <= 1
              || (current === 0 && idx === total - 1)
              || (current === total - 1 && idx === 0);

            return (
              <div
                key={post.id}
                style={{ width: `${cardWidth}px`, minWidth: `${cardWidth}px` }}
                className="flex-shrink-0"
                dir="rtl"
              >
                {post.type === 'twitter'
                  ? <TwitterEmbedCard post={post} isActive={isActive || isAdjacent} />
                  : <FacebookEmbedCard post={post} isActive={isActive || isAdjacent} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={prev}
        className="group absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 -mr-2 lg:-mr-6 bg-slate-900/90 hover:bg-gold-500 border border-gold-500/30 hover:border-gold-400 rounded-full flex items-center justify-center text-white hover:text-slate-900 transition-all duration-300 shadow-2xl backdrop-blur-md hover:scale-110"
        aria-label="السابق"
      >
        <ChevronRight size={22} className="group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={next}
        className="group absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 -ml-2 lg:-ml-6 bg-slate-900/90 hover:bg-gold-500 border border-gold-500/30 hover:border-gold-400 rounded-full flex items-center justify-center text-white hover:text-slate-900 transition-all duration-300 shadow-2xl backdrop-blur-md hover:scale-110"
        aria-label="التالي"
      >
        <ChevronLeft size={22} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Dots pagination */}
      <div className="flex justify-center items-center gap-1.5 mt-8 flex-wrap px-16 max-w-2xl mx-auto">
        {posts.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`transition-all duration-500 rounded-full ${
              idx === current
                ? 'w-8 h-2 bg-gradient-to-r from-gold-400 to-gold-500 shadow-lg shadow-gold-500/30'
                : 'w-2 h-2 bg-white/15 hover:bg-white/30 hover:scale-125'
            }`}
            aria-label={`الانتقال إلى المنشور ${idx + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-[2px] bg-white/[0.06] rounded-full overflow-hidden mx-auto max-w-md">
        {!isPaused && (
          <div
            key={current}
            className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full shadow-[0_0_10px_rgba(202,138,4,0.5)]"
            style={{ animation: `slider-progress ${AUTOPLAY_MS}ms linear forwards` }}
          />
        )}
      </div>

      {/* Hint */}
      <div className="mt-3 text-center text-white/30 text-xs">
        {isPaused ? 'متوقف · اضغط زر التشغيل أو أبعد المؤشر' : 'تشغيل تلقائي · مرّر الفأرة للإيقاف'}
      </div>

      <style>{`
        @keyframes slider-progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
};

export default SocialPostsSlider;
