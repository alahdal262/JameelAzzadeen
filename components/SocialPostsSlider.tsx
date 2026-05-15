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
  return (
    <div ref={ref} className="flex justify-center items-start overflow-y-auto max-h-[560px] w-full" />
  );
};

const PostCard: React.FC<{ post: SocialPost; active: boolean }> = ({ post, active }) => {
  const isTwitter = post.type === 'twitter';
  const tweetId = isTwitter ? post.embedUrl.replace('twitter:', '') : '';

  return (
    <div className="h-full flex flex-col">
      {/* Card header */}
      <div className={`flex items-center justify-between px-5 py-3 rounded-t-2xl ${
        isTwitter
          ? 'bg-[#1DA1F2]/10 border-b border-[#1DA1F2]/20'
          : 'bg-[#1877F2]/10 border-b border-[#1877F2]/20'
      }`}>
        <div className="flex items-center gap-2">
          {isTwitter
            ? <Twitter size={18} className="text-[#1DA1F2]" />
            : <Facebook size={18} className="text-[#1877F2]" />}
          <span className="text-sm font-bold text-white/80">
            {isTwitter ? 'منشور على X (تويتر)' : 'منشور على فيسبوك'}
          </span>
        </div>
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-gold-400 transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink size={12} />
          عرض المنشور
        </a>
      </div>

      {/* Embed content */}
      <div className="flex-1 flex items-start justify-center overflow-hidden bg-white/[0.03] rounded-b-2xl p-3">
        {active ? (
          isTwitter ? (
            <TwitterEmbed tweetId={tweetId} />
          ) : (
            <iframe
              src={post.embedUrl}
              width="500"
              height={post.height}
              style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              className="rounded-lg max-w-full"
            />
          )
        ) : (
          <div className="w-full h-64 flex items-center justify-center text-white/20 text-sm">
            {isTwitter ? <Twitter size={32} /> : <Facebook size={32} />}
          </div>
        )}
      </div>

      {/* Footer source */}
      <div className="px-5 py-2.5 flex items-center justify-between border-t border-white/5 mt-1">
        <span className="text-xs text-white/30">المصدر:</span>
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-gold-500/70 hover:text-gold-400 transition-colors truncate max-w-[260px]"
          dir="ltr"
        >
          {post.sourceUrl}
        </a>
      </div>
    </div>
  );
};

const SocialPostsSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = SOCIAL_POSTS.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main slider */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Track */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(${current * 100}%)` }}
        >
          {SOCIAL_POSTS.map((post, idx) => (
            <div
              key={post.id}
              className="w-full flex-shrink-0 min-h-[680px] flex flex-col border border-white/10 rounded-2xl bg-slate-900/80 backdrop-blur-sm overflow-hidden"
            >
              <PostCard post={post} active={Math.abs(idx - current) <= 1} />
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next */}
      <button
        onClick={prev}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-11 h-11 bg-slate-800/90 hover:bg-gold-500 border border-white/10 hover:border-gold-500 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-xl"
        aria-label="السابق"
      >
        <ChevronRight size={20} />
      </button>
      <button
        onClick={next}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-11 h-11 bg-slate-800/90 hover:bg-gold-500 border border-white/10 hover:border-gold-500 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-xl"
        aria-label="التالي"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-slate-900/70 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full text-xs text-white/50 font-mono" dir="ltr">
        {current + 1} / {total}
      </div>

      {/* Dots pagination */}
      <div className="flex justify-center gap-2 mt-6 flex-wrap px-4">
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
        <div className="mt-3 h-0.5 bg-white/5 rounded-full overflow-hidden mx-auto max-w-sm">
          <div
            className="h-full bg-gold-500/60 rounded-full"
            style={{
              animation: 'progress-bar 6s linear infinite',
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SocialPostsSlider;
