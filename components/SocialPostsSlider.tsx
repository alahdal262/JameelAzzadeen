import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Facebook, Twitter, ChevronLeft, ChevronRight, ExternalLink, Pause, Play, Quote } from 'lucide-react';
import { SOCIAL_POSTS, SocialPost } from '../data/socialPosts';

// ─── twttr typings (widgets.js is loaded in index.html) ─────────────────────
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (target?: HTMLElement | null) => void;
        createTweet?: (
          id: string,
          target: HTMLElement,
          opts?: Record<string, unknown>
        ) => Promise<HTMLElement | undefined>;
      };
    };
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const hostFromUrl = (url: string) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
};

const extractTweetId = (url: string): string | null => {
  const m = url.match(/status\/(\d+)/);
  return m ? m[1] : null;
};

const initialFromName = (name: string) => {
  const trimmed = (name || '').trim();
  if (!trimmed) return '؟';
  return [...trimmed][0] || '؟';
};

// Skip posts whose scrape returned no content (likely private). Twitter posts always pass.
const isPublicPost = (p: SocialPost) =>
  (p.title && p.title.trim().length > 0) || p.type === 'twitter';

// ─── Shared card chrome (header + footer wrapping) ──────────────────────────
const CardShell: React.FC<{
  accent: string;
  platformName: string;
  PlatformIcon: typeof Facebook;
  targetUrl: string;
  children: React.ReactNode;
}> = ({ accent, platformName, PlatformIcon, targetUrl, children }) => (
  <article
    className="relative h-full flex flex-col rounded-3xl overflow-hidden border border-white/10 hover:border-gold-500/40 transition-all duration-500 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.7)]"
    style={{
      background:
        `linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.98) 60%, ${accent}10 100%)`,
    }}
  >
    {/* Gold top accent line */}
    <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent z-10" />
    {/* Decorative glow blob — top-right */}
    <div
      className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[110px] opacity-25 pointer-events-none"
      style={{ background: accent }}
    />

    {/* Header (platform only — author appears inside body) */}
    <header className="relative z-10 flex items-center justify-between px-5 lg:px-6 py-3.5 border-b border-white/10 bg-gradient-to-l from-black/40 via-slate-900/40 to-slate-900/60">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: `${accent}22`,
            border: `1px solid ${accent}66`,
          }}
        >
          <PlatformIcon size={16} style={{ color: accent }} />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm leading-tight">منشور على {platformName}</span>
          <span className="text-white/40 text-[11px] tracking-wider mt-0.5">منصة التواصل الاجتماعي</span>
        </div>
      </div>
      <a
        href={targetUrl}
        target="_blank"
        rel="noreferrer"
        onClick={e => e.stopPropagation()}
        className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-gold-300 transition-colors px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-gold-500/10 border border-white/10 hover:border-gold-500/40 font-bold"
      >
        <ExternalLink size={11} />
        <span>الأصل</span>
      </a>
    </header>

    {/* Body */}
    <div className="relative z-10 flex-1 flex flex-col min-h-0">{children}</div>

    {/* Source footer */}
    <div className="relative z-10 px-5 lg:px-6 py-2.5 border-t border-white/10 bg-black/40 backdrop-blur-sm flex items-center gap-3">
      <span className="inline-flex items-center gap-1.5 text-[10px] text-gold-300/90 font-bold tracking-widest shrink-0 uppercase">
        <Quote size={10} />
        المصدر
      </span>
      <a
        href={targetUrl}
        target="_blank"
        rel="noreferrer"
        onClick={e => e.stopPropagation()}
        className="text-[11px] text-white/55 hover:text-gold-300 transition-colors truncate flex-1 font-mono"
        dir="ltr"
      >
        {hostFromUrl(targetUrl)}
      </a>
      <ExternalLink size={11} className="text-white/30 shrink-0" />
    </div>
  </article>
);

// ─── Twitter card — uses official widgets.js (lazy) ─────────────────────────
const TwitterCard: React.FC<{ post: SocialPost; isActive: boolean }> = ({ post, isActive }) => {
  const tweetId = useMemo(() => extractTweetId(post.sourceUrl), [post.sourceUrl]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const accent = '#1DA1F2';

  useEffect(() => {
    if (!isActive || rendered || !tweetId || !containerRef.current) return;
    let cancelled = false;
    const tryRender = () => {
      if (cancelled) return;
      if (window.twttr?.widgets?.createTweet && containerRef.current) {
        window.twttr.widgets.createTweet(tweetId, containerRef.current, {
          theme: 'dark',
          lang: 'ar',
          dnt: true,
          conversation: 'none',
          cards: 'visible',
          align: 'center',
        }).then(() => { if (!cancelled) setRendered(true); }).catch(() => {});
      } else {
        setTimeout(tryRender, 400);
      }
    };
    tryRender();
    return () => { cancelled = true; };
  }, [isActive, rendered, tweetId]);

  return (
    <CardShell
      accent={accent}
      platformName="X (تويتر)"
      PlatformIcon={Twitter}
      targetUrl={post.sourceUrl}
    >
      <div className="flex-1 flex justify-center items-center py-5 px-3 bg-gradient-to-b from-white/[0.02] via-transparent to-black/30">
        <div ref={containerRef} dir="ltr" className="w-full max-w-[550px] flex justify-center">
          {!rendered && (
            <div className="flex flex-col items-center justify-center gap-3 text-white/40 py-20">
              <Twitter size={48} className="opacity-50" style={{ color: accent }} />
              <span className="text-xs font-bold tracking-wider">جاري التحميل من X…</span>
            </div>
          )}
        </div>
      </div>
    </CardShell>
  );
};

// ─── Facebook card — text-first, beautifully typeset ────────────────────────
const FacebookCard: React.FC<{ post: SocialPost }> = ({ post }) => {
  const accent = '#1877F2';
  const targetUrl = post.canonicalUrl || post.sourceUrl;
  const authorName = (post.title || '').trim() || 'منشور على فيسبوك';
  const excerpt = (post.description || '').trim();
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !!post.image && !imgFailed;

  return (
    <CardShell
      accent={accent}
      platformName="فيسبوك"
      PlatformIcon={Facebook}
      targetUrl={targetUrl}
    >
      <div className={`flex-1 relative ${showImage ? 'grid grid-cols-1 lg:grid-cols-12 items-stretch' : 'flex flex-col justify-center'}`}>
        {/* IMAGE COLUMN (right in RTL, top on mobile) */}
        {showImage && (
          <div className="lg:col-span-5 relative bg-gradient-to-bl from-slate-950 via-slate-900/80 to-slate-950 flex items-center justify-center p-4 lg:p-5 border-b lg:border-b-0 lg:border-l border-white/[0.06]">
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="relative block w-full h-full min-h-[260px] lg:min-h-[420px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl group/img bg-slate-950"
            >
              <img
                src={post.image}
                alt={`صورة منشور ${authorName}`}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() => setImgFailed(true)}
                className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover/img:scale-[1.04]"
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(15,23,42,0.4) 0%, rgba(2,6,23,0.9) 100%)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />
              <div
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] font-bold text-white shadow-lg"
                style={{ backgroundColor: `${accent}40`, borderColor: `${accent}88` }}
              >
                <Facebook size={10} />
                <span>صورة المنشور</span>
              </div>
            </a>
          </div>
        )}

        {/* TEXT COLUMN (left in RTL, bottom on mobile) */}
        <div
          className={`${showImage ? 'lg:col-span-7' : ''} flex flex-col justify-center px-6 lg:px-9 py-6 lg:py-7 relative`}
        >
          {/* Giant decorative quote behind text */}
          <Quote
            className="absolute top-4 right-4 w-40 h-40 text-white/[0.03] transform -scale-x-100 pointer-events-none"
            strokeWidth={1}
          />

          {/* Author block */}
          <div className="flex items-center gap-3.5 mb-4 relative z-10">
            <div
              className="w-12 h-12 lg:w-[56px] lg:h-[56px] rounded-full flex items-center justify-center shrink-0 text-xl lg:text-2xl font-black text-white shadow-2xl ring-2 ring-white/10"
              style={{
                background: `linear-gradient(135deg, ${accent} 0%, ${accent}88 100%)`,
                boxShadow: `0 10px 30px -8px ${accent}88`,
              }}
              aria-hidden="true"
            >
              {initialFromName(authorName)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-white font-heading font-black text-base lg:text-lg leading-tight truncate">
                {authorName}
              </h3>
              <span className="text-white/40 text-[11px] tracking-wider mt-0.5">متابع · فيسبوك</span>
            </div>
          </div>

          {/* Subtle divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent mb-4 relative z-10" />

          {/* Excerpt */}
          <div className="relative z-10">
            {excerpt ? (
              <div className="relative">
                <Quote
                  size={18}
                  className="text-gold-400/70 mb-2 inline-block"
                  style={{ transform: 'scaleX(-1)' }}
                  strokeWidth={2.5}
                />
                <p className="text-white/90 text-[14.5px] lg:text-[15.5px] leading-[1.9] font-medium whitespace-pre-line">
                  {excerpt}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-white/40">
                <Facebook size={42} className="opacity-50" style={{ color: accent }} />
                <span className="text-sm font-bold">منشور على فيسبوك</span>
                <span className="text-xs text-center max-w-xs">اضغط على الرابط أدناه لقراءته كاملاً</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-5 relative z-10">
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: `linear-gradient(to left, ${accent}, ${accent}dd)`,
                boxShadow: `0 8px 25px -6px ${accent}aa`,
              }}
            >
              <ExternalLink size={14} />
              <span>قراءة المنشور كاملاً</span>
            </a>
          </div>
        </div>
      </div>
    </CardShell>
  );
};

// ─── Slider mechanics ───────────────────────────────────────────────────────
const GAP = 24;
const AUTOPLAY_MS = 7000;
const TRANSITION_MS = 700;
const REWIND_MS = 1100;
const CARD_MIN_HEIGHT = 0; // flexible — cards auto-size to content

const SocialPostsSlider: React.FC = () => {
  const posts = useMemo(() => SOCIAL_POSTS.filter(isPublicPost), []);
  const total = posts.length;

  const [current, setCurrent] = useState(0);
  const [isRewinding, setIsRewinding] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(720);
  const viewportRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          className="flex items-stretch"
          dir="ltr"
          style={{
            gap: `${GAP}px`,
            transform: `translateX(${translateX}px)`,
            transition: `transform ${duration}ms cubic-bezier(0.32, 0.72, 0, 1)`,
            willChange: 'transform',
          }}
        >
          {posts.map((post, idx) => {
            const isActive = idx === current;
            const isAdjacent = Math.abs(idx - current) <= 1
              || (current === 0 && idx === total - 1)
              || (current === total - 1 && idx === 0);

            return (
              <div
                key={post.id}
                style={{ width: `${cardWidth}px`, minWidth: `${cardWidth}px` }}
                className="flex-shrink-0 min-h-[420px]"
                dir="rtl"
              >
                {post.type === 'twitter'
                  ? <TwitterCard post={post} isActive={isActive || isAdjacent} />
                  : <FacebookCard post={post} />}
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
