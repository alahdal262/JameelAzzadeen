import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Facebook, Twitter, ChevronLeft, ChevronRight, ExternalLink, Pause, Play } from 'lucide-react';
import { SOCIAL_POSTS, SocialPost } from '../data/socialPosts';

const PostLinkCard: React.FC<{ post: SocialPost }> = ({ post }) => {
  const isTwitter = post.type === 'twitter';
  const color = isTwitter ? '#1DA1F2' : '#1877F2';
  const label = isTwitter ? 'X (تويتر)' : 'فيسبوك';
  const ctaText = isTwitter ? 'فتح المنشور على X' : 'فتح المنشور على فيسبوك';
  const handle = isTwitter
    ? (post.sourceUrl.match(/(?:twitter\.com|x\.com)\/([^/]+)\//)?.[1] || '')
    : '';

  return (
    <div className="w-full flex flex-col items-center justify-center gap-5 py-10 text-center min-h-[480px] relative">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-2"
        style={{
          background: `linear-gradient(135deg, ${color}40 0%, ${color}10 100%)`,
          borderColor: `${color}66`,
        }}
      >
        {isTwitter ? <Twitter size={44} style={{ color }} /> : <Facebook size={44} style={{ color }} />}
      </div>

      <div className="space-y-2 px-4">
        <h4 className="text-white text-xl md:text-2xl font-bold">
          منشور على <span style={{ color }}>{label}</span>
        </h4>
        <p className="text-white/60 text-sm md:text-base max-w-md leading-relaxed">
          {isTwitter
            ? <>منشور رسمي من حساب<span className="text-[#1DA1F2] font-mono mx-1.5" dir="ltr">@{handle}</span>على منصة X</>
            : <>منشور عام شاركه أحد المتابعين على فيسبوك حول الإعلامي جميل عزّالدين</>
          }
        </p>
      </div>

      <a
        href={post.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm md:text-base font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-105"
        style={{ background: `linear-gradient(to right, ${color}, ${color}cc)` }}
        onClick={e => e.stopPropagation()}
      >
        <ExternalLink size={16} />
        {ctaText}
      </a>

      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-2xl"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, ${color} 1px, transparent 1px), radial-gradient(circle at 70% 80%, ${color} 1px, transparent 1px)`,
          backgroundSize: '40px 40px, 30px 30px',
        }}
      ></div>
    </div>
  );
};

const PostCard: React.FC<{ post: SocialPost }> = ({ post }) => {
  const isTwitter = post.type === 'twitter';
  const platformColor = isTwitter ? '#1DA1F2' : '#1877F2';

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b border-white/10"
        style={{ background: `linear-gradient(135deg, ${platformColor}20 0%, ${platformColor}08 100%)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${platformColor}25`, border: `1px solid ${platformColor}40` }}
          >
            {isTwitter
              ? <Twitter size={16} style={{ color: platformColor }} />
              : <Facebook size={16} style={{ color: platformColor }} />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">
              {isTwitter ? 'منشور على X (تويتر)' : 'منشور على فيسبوك'}
            </span>
            <span className="text-[10px] text-white/40 tracking-wider">منصة التواصل الاجتماعي</span>
          </div>
        </div>
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-white/60 hover:text-gold-400 transition-colors px-3 py-1.5 rounded-full bg-white/5 hover:bg-gold-500/10 border border-white/10 hover:border-gold-500/30"
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink size={11} />
          <span className="font-bold">عرض</span>
        </a>
      </div>

      <div className="flex-1 flex items-stretch justify-center bg-gradient-to-b from-white/[0.03] to-white/[0.01] px-4 py-4">
        <PostLinkCard post={post} />
      </div>

      <div className="px-5 py-3 border-t border-white/10 bg-slate-950/40 flex items-center gap-2.5 mt-auto">
        <span className="text-xs text-white/50 shrink-0 font-bold">المصدر:</span>
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-gold-300/80 hover:text-gold-300 transition-colors truncate flex-1 font-mono"
          dir="ltr"
          onClick={e => e.stopPropagation()}
        >
          {post.sourceUrl}
        </a>
        <ExternalLink size={11} className="text-white/30 shrink-0" />
      </div>
    </div>
  );
};

const GAP = 0;
const PEEK = 56;
const AUTOPLAY_MS = 5500;
const TRANSITION_MS = 700;
const REWIND_MS = 1100; // slightly longer rewind so it looks intentional

const SocialPostsSlider: React.FC = () => {
  const total = SOCIAL_POSTS.length;
  const [current, setCurrent] = useState(0);
  const [isRewinding, setIsRewinding] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(780);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const update = () => {
      if (sliderRef.current) {
        const w = sliderRef.current.offsetWidth;
        setCardWidth(Math.max(300, w - 2 * (PEEK + GAP)));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (sliderRef.current) ro.observe(sliderRef.current);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback((target: number) => {
    setCurrent(prev => {
      const nextIdx = ((target % total) + total) % total;
      // When wrapping from last → first, use a longer "rewind" transition
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

  const translateX = PEEK + GAP - current * (cardWidth + GAP);
  const duration = isRewinding ? REWIND_MS : TRANSITION_MS;

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
          className="w-7 h-7 rounded-full bg-white/5 hover:bg-gold-500/20 border border-white/10 hover:border-gold-500/40 flex items-center justify-center text-white/70 hover:text-gold-300 transition-all"
          aria-label={isPaused ? 'تشغيل' : 'إيقاف'}
        >
          {isPaused ? <Play size={11} fill="currentColor" /> : <Pause size={11} fill="currentColor" />}
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
      <div ref={sliderRef} className="overflow-hidden">
        <div
          className="flex"
          style={{
            gap: `${GAP}px`,
            transform: `translateX(${translateX}px)`,
            transition: `transform ${duration}ms cubic-bezier(0.32, 0.72, 0, 1)`,
            willChange: 'transform',
          }}
        >
          {SOCIAL_POSTS.map((post, idx) => {
            const isActive = idx === current;
            return (
              <div
                key={post.id}
                onClick={() => !isActive && goTo(idx)}
                style={{ width: `${cardWidth}px`, minWidth: `${cardWidth}px` }}
                className={`flex-shrink-0 rounded-2xl border overflow-hidden transition-[opacity,transform,border-color,box-shadow] duration-700 ease-out ${
                  isActive
                    ? 'border-gold-500/30 opacity-100 scale-100 shadow-[0_20px_60px_-15px_rgba(202,138,4,0.3)] cursor-default ring-1 ring-gold-500/10'
                    : 'border-white/5 opacity-30 scale-[0.94] cursor-pointer hover:opacity-60 hover:border-white/15'
                } bg-slate-800/80 backdrop-blur-sm`}
              >
                <PostCard post={post} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Side gradient fades */}
      <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-slate-950 via-slate-950/85 to-transparent pointer-events-none z-10" />

      {/* Prev / Next buttons */}
      <button
        onClick={prev}
        className="group absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-slate-900/90 hover:bg-gold-500 border border-gold-500/30 hover:border-gold-400 rounded-full flex items-center justify-center text-white hover:text-slate-900 transition-all duration-300 shadow-2xl backdrop-blur-md hover:scale-110"
        aria-label="السابق"
      >
        <ChevronRight size={22} className="group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={next}
        className="group absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-slate-900/90 hover:bg-gold-500 border border-gold-500/30 hover:border-gold-400 rounded-full flex items-center justify-center text-white hover:text-slate-900 transition-all duration-300 shadow-2xl backdrop-blur-md hover:scale-110"
        aria-label="التالي"
      >
        <ChevronLeft size={22} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Dots pagination */}
      <div className="flex justify-center items-center gap-1.5 mt-8 flex-wrap px-16 max-w-2xl mx-auto">
        {SOCIAL_POSTS.map((_, idx) => (
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
