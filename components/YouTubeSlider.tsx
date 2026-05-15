
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Youtube, Play, X, Calendar, Eye, ChevronRight, ChevronLeft } from 'lucide-react';
import { Section, Video } from '../types';

interface YouTubeSliderProps {
    videos: Video[];
}

const YouTubeSlider: React.FC<YouTubeSliderProps> = ({ videos }) => {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const autoScrollPausedRef = useRef(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayVideos = [...videos, ...videos, ...videos];

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider || videos.length === 0) return;

    const initScroll = () => {
        const oneThird = slider.scrollWidth / 3;
        slider.scrollLeft = -oneThird;
    };

    const timeoutId = setTimeout(initScroll, 200);

    let animationFrameId: number;
    const speed = 0.6; 

    const step = () => {
        if (!isInteracting && !autoScrollPausedRef.current && slider) {
            slider.scrollLeft -= speed;
            const currentScroll = Math.abs(slider.scrollLeft);
            const totalWidth = slider.scrollWidth / 3;
            
            if (currentScroll >= totalWidth * 2) {
                slider.scrollLeft = -totalWidth;
            } else if (slider.scrollLeft >= 0) {
                slider.scrollLeft = -totalWidth;
            }
        }
        animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => {
        cancelAnimationFrame(animationFrameId);
        clearTimeout(timeoutId);
    };
  }, [videos.length, isInteracting]);

  const pauseAutoScroll = () => {
    autoScrollPausedRef.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
        autoScrollPausedRef.current = false;
    }, 4000);
  };

  const scrollManual = (direction: 'right' | 'left') => {
      const slider = scrollRef.current;
      if (!slider) return;
      pauseAutoScroll();
      const scrollAmount = window.innerWidth < 768 ? 300 : 450;
      slider.scrollBy({
          left: direction === 'right' ? scrollAmount : -scrollAmount,
          behavior: 'smooth'
      });
  };

  const handleNextVideo = useCallback(() => {
      if (selectedVideoIndex !== null) {
          setSelectedVideoIndex((prev) => (prev !== null && prev < videos.length - 1 ? prev + 1 : 0));
      }
  }, [selectedVideoIndex, videos.length]);

  const handlePrevVideo = useCallback(() => {
      if (selectedVideoIndex !== null) {
          setSelectedVideoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : videos.length - 1));
      }
  }, [selectedVideoIndex, videos.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsInteracting(true);
      pauseAutoScroll();
      setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
      setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isInteracting || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      setIsInteracting(true);
      pauseAutoScroll();
      setStartX(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0));
      setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!isInteracting || !scrollRef.current) return;
      const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const stopInteraction = () => setIsInteracting(false);

  return (
    <section id={Section.VIDEOS} className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 mb-12">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-600 p-2 rounded-lg text-white"><Youtube size={24} /></div>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900">
                مكتبة <span className="text-red-600">الفيديو</span>
            </h2>
        </div>
      </div>

      <div className="relative group/slider">
        {/* Modern Controls for Slider */}
        <button 
            onClick={() => scrollManual('right')}
            className="absolute right-4 top-[40%] -translate-y-1/2 z-30 w-12 h-12 bg-white/60 backdrop-blur-md border border-gray-200 rounded-full flex items-center justify-center text-red-600 shadow-lg hover:bg-red-600 hover:text-white transition-all active:scale-90 md:opacity-0 md:group-hover/slider:opacity-100"
        >
            <ChevronRight size={28} />
        </button>
        <button 
            onClick={() => scrollManual('left')}
            className="absolute left-4 top-[40%] -translate-y-1/2 z-30 w-12 h-12 bg-white/60 backdrop-blur-md border border-gray-200 rounded-full flex items-center justify-center text-red-600 shadow-lg hover:bg-red-600 hover:text-white transition-all active:scale-90 md:opacity-0 md:group-hover/slider:opacity-100"
        >
            <ChevronLeft size={28} />
        </button>

        {/* Visual Fades */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={stopInteraction}
          onMouseUp={stopInteraction}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={stopInteraction}
          onTouchMove={handleTouchMove}
          className="flex gap-8 overflow-x-auto scrollbar-hide py-8 px-4 cursor-grab active:cursor-grabbing select-none touch-pan-y"
          style={{ scrollBehavior: isInteracting ? 'auto' : 'smooth' }}
        >
            {displayVideos.map((video, idx) => (
                <div 
                    key={`${video.id}-${idx}`} 
                    className="min-w-[300px] md:min-w-[380px] bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col pointer-events-auto overflow-hidden group/card"
                    onClick={() => !isInteracting && setSelectedVideoIndex(idx % videos.length)}
                >
                    <div className="relative aspect-video overflow-hidden bg-gray-900">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover/card:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl group-hover/card:bg-red-700 transition-colors">
                                <Play fill="currentColor" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 text-right" dir="rtl">
                        <h3 className="text-lg font-bold text-slate-800 line-clamp-2">{video.title}</h3>
                        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Calendar size={12}/> {video.date}</span>
                            <span className="flex items-center gap-1"><Eye size={12}/> {video.views}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Video Modal with Navigation */}
      {selectedVideoIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center backdrop-blur-md">
           <button 
                onClick={() => setSelectedVideoIndex(null)} 
                className="absolute top-6 right-6 text-white/70 hover:text-red-600 transition-colors p-2 z-[110]"
            >
                <X size={40} />
            </button>

            {/* Modal Navigation Buttons */}
            <button 
                onClick={handlePrevVideo}
                className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-red-600 transition-all z-[110] p-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/10"
            >
                <ChevronRight size={48} className="md:w-16 md:h-16" />
            </button>
            <button 
                onClick={handleNextVideo}
                className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-red-600 transition-all z-[110] p-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/10"
            >
                <ChevronLeft size={48} className="md:w-16 md:h-16" />
            </button>

           <div className="w-full max-w-5xl px-4 flex flex-col items-center">
                <div className="mb-4 text-white/40 text-sm font-bold bg-white/5 px-4 py-1 rounded-full border border-white/10">
                    فيديو {selectedVideoIndex + 1} من {videos.length}
                </div>
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 animate-fade-in">
                    <iframe 
                        key={videos[selectedVideoIndex].id}
                        width="100%" height="100%" 
                        src={`https://www.youtube.com/embed/${videos[selectedVideoIndex].id}?autoplay=1&rel=0`} 
                        allowFullScreen 
                        className="w-full h-full"
                    />
                </div>
                <div className="mt-6 text-center text-white w-full max-w-3xl">
                    <h3 className="text-xl md:text-2xl font-bold font-heading mb-2">{videos[selectedVideoIndex].title}</h3>
                    <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
                        <span className="flex items-center gap-1"><Calendar size={14}/> {videos[selectedVideoIndex].date}</span>
                        <span className="flex items-center gap-1"><Eye size={14}/> {videos[selectedVideoIndex].views}</span>
                    </div>
                </div>
           </div>
        </div>
      )}
    </section>
  );
};

export default YouTubeSlider;
