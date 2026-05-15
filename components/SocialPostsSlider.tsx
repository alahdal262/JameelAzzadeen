import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Facebook, Twitter, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { SOCIAL_POSTS, SocialPost } from '../data/socialPosts';

const TwitterEmbed: React.FC<{ tweetId: string }> = ({ tweetId }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    const anchor = document.createElement('a');
    anchor.className = 'twitter-tweet';
    anchor.setAttribute('dir', 'rtl');
    anchor.setAttribute('data-lang', 'ar');
    anchor.href = `https://twitter.com/g_khamre/status/${tweetId}`;
    anchor.textContent = 'Loading tweet...';
    ref.current.appendChild(anchor);
    const w = window as any;
    if (w.twttr?.widgets) {
      w.twttr.widgets.load(ref.current);
    } else {
      const s = document.createElement('script');
      s.src = 'https://platform.twitter.com/widgets.js';
      s.async = true;
      document.head.appendChild(s);
    }
  }, [tweetId]);
  return <div ref={ref} className="w-full flex justify-center py-4" />;
};

const PostCard: React.FC<{ post: SocialPost; active: boolean }> = ({ post, active }) => {
  const isTwitter = post.type === 'twitter';
  const tweetId = isTwitter ? post.embedUrl.replace('twitter:', '') : '';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 ${
        isTwitter
          ? 'bg-[#1DA1F2]/10 border-b border-[#1DA1F2]/15'
          : 'bg-[#1877F2]/10 border-b border-[#1877F2]/15'
      }`}>
        <div className="flex items-center gap-2.5">
          {isTwitter
            ? <Twitter size={16} className="text-[#1DA1F2]" />
            : <Facebook size={16} className="text-[#1877F2]" />}
          <span className="text-sm font-bold text-white/70">
            {isTwitter ? 'منشور على X (تويتر)' : 'منشور على فيسبوك'}
          </span>
        </div>
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-white/35 hover:text-gold-400 transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink size={11} />
          عرض المنشور
        </a>
      </div>

      {/* Embed area */}
      <div className="flex-1 flex items-start justify-center bg-white/[0.02] px-4 pt-4 pb-2">
        {active ? (
          isTwitter ? (
            <TwitterEmbed tweetId={tweetId} />
          ) : (
            <iframe
              src={post.embedUrl}
              width="500"
              height={post.height}
              style={{ border: 'none', overflow: 'hidden', maxWidth: '100%', width: '100%' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              className="rounded-lg"
            />
          )
        ) : (
          <div
            className="w-full flex items-center justify-center text-white/10"
            style={{ height: post.height }}
          >
            {isTwitter ? <Twitter size={48} /> : <Facebook size={48} />}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/5 flex items-center gap-2 mt-auto">
        <span className="text-xs text-white/25 shrink-0">المصدر:</span>
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-gold-500/55 hover:text-gold-400 transition-colors truncate"
          dir="ltr"
        >
          {post.sourceUrl}
        </a>
      </div>
    </div>
  );
};

const GAP = 20;
const PEEK = 72; // px of adjacent card visible on each side

const SocialPostsSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(780);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = SOCIAL_POSTS.length;

  // Compute card width from container
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

  const next = useCallback(() => setCurrent(p => (p + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(p => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, next]);

  const goTo = (idx: number) => {
    setCurrent(idx);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 6000);
  };

  // translateX: center the current card, let adjacent cards peek
  const translateX = PEEK + GAP - current * (cardWidth + GAP);

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Counter */}
      <div className="flex justify-center mb-4">
        <span
          className="bg-white/5 border border-white/10 px-4 py-1 rounded-full text-xs text-white/40 font-mono"
          dir="ltr"
        >
          {current + 1} / {total}
        </span>
      </div>

      {/* Slider viewport */}
      <div ref={sliderRef} className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ gap: `${GAP}px`, transform: `translateX(${translateX}px)` }}
        >
          {SOCIAL_POSTS.map((post, idx) => {
            const isActive = idx === current;
            const isAdjacent = Math.abs(idx - current) === 1;
            return (
              <div
                key={post.id}
                onClick={() => !isActive && goTo(idx)}
                style={{ width: `${cardWidth}px`, minWidth: `${cardWidth}px` }}
                className={`flex-shrink-0 rounded-2xl border overflow-hidden transition-all duration-700 ${
                  isActive
                    ? 'border-white/15 opacity-100 scale-100 shadow-2xl cursor-default'
                    : 'border-white/5 opacity-40 scale-[0.96] cursor-pointer hover:opacity-60'
                } bg-slate-800/80 backdrop-blur-sm`}
              >
                <PostCard post={post} active={isActive || isAdjacent} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Gradient fade — left */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10" />
      {/* Gradient fade — right */}
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10" />

      {/* Prev / Next buttons */}
      <button
        onClick={prev}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-slate-700/80 hover:bg-gold-500 border border-white/10 hover:border-gold-400 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-xl backdrop-blur-sm"
        aria-label="السابق"
      >
        <ChevronRight size={20} />
      </button>
      <button
        onClick={next}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-slate-700/80 hover:bg-gold-500 border border-white/10 hover:border-gold-400 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-xl backdrop-blur-sm"
        aria-label="التالي"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-6 flex-wrap px-16">
        {SOCIAL_POSTS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === current
                ? 'w-6 h-2 bg-gold-400'
                : 'w-2 h-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`الانتقال إلى المنشور ${idx + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!isPaused && (
        <div className="mt-4 h-0.5 bg-white/5 rounded-full overflow-hidden mx-auto max-w-xs">
          <div
            key={current}
            className="h-full bg-gold-500/60 rounded-full"
            style={{ animation: 'slider-progress 6s linear forwards' }}
          />
        </div>
      )}

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
