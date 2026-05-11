
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Section, GalleryImage } from '../types';
import { Maximize2, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface GallerySectionProps {
    images: GalleryImage[];
}

const GallerySection: React.FC<GallerySectionProps> = ({ images }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isInteracting, setIsInteracting] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const autoScrollPausedRef = useRef(false);
    const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Triple images for seamless looping in the slider
    const displayImages = [...images, ...images, ...images];

    useEffect(() => {
        const slider = scrollRef.current;
        if (!slider || images.length === 0) return;

        const initScroll = () => {
            const oneThird = slider.scrollWidth / 3;
            slider.scrollLeft = -oneThird;
        };

        const timeoutId = setTimeout(initScroll, 200);

        let animationFrameId: number;
        const speed = 0.8; 

        const step = () => {
            if (!isInteracting && !autoScrollPausedRef.current && slider) {
                slider.scrollLeft -= speed;
                const currentScroll = Math.abs(slider.scrollLeft);
                const oneThird = slider.scrollWidth / 3;
                
                if (currentScroll >= oneThird * 2) {
                    slider.scrollLeft = -oneThird;
                } else if (slider.scrollLeft >= 0) {
                    slider.scrollLeft = -oneThird;
                }
            }
            animationFrameId = requestAnimationFrame(step);
        };

        animationFrameId = requestAnimationFrame(step);
        return () => {
            cancelAnimationFrame(animationFrameId);
            clearTimeout(timeoutId);
        };
    }, [images.length, isInteracting]);

    const pauseAutoScroll = () => {
        autoScrollPausedRef.current = true;
        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = setTimeout(() => {
            autoScrollPausedRef.current = false;
        }, 3000);
    };

    const scrollManual = (direction: 'right' | 'left') => {
        const slider = scrollRef.current;
        if (!slider) return;
        pauseAutoScroll();
        const scrollAmount = window.innerWidth < 768 ? 250 : 400;
        slider.scrollBy({
            left: direction === 'right' ? scrollAmount : -scrollAmount,
            behavior: 'smooth'
        });
    };

    const handleNextImage = useCallback(() => {
        if (selectedIndex !== null) {
            setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
        }
    }, [selectedIndex, images.length]);

    const handlePrevImage = useCallback(() => {
        if (selectedIndex !== null) {
            setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
        }
    }, [selectedIndex, images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return;
            if (e.key === 'ArrowRight') handlePrevImage(); 
            if (e.key === 'ArrowLeft') handleNextImage();  
            if (e.key === 'Escape') setSelectedIndex(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, handleNextImage, handlePrevImage]);

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
        <section id={Section.GALLERY} className="py-20 bg-slate-950 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

            <div className="container mx-auto px-4 relative z-10 mb-12 text-center">
                <span className="text-gold-500 font-bold tracking-wider text-sm">مكتبة الصور</span>
                <h2 className="text-3xl md:text-5xl font-heading font-black text-white mt-2">
                    ذاكرة <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-600">فوتوغرافية</span>
                </h2>
                <div className="w-24 h-1 bg-gold-500 mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="relative group/slider">
                {/* Side Controls for Slider */}
                <button 
                    onClick={() => scrollManual('right')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-black transition-all active:scale-90 md:opacity-0 md:group-hover/slider:opacity-100"
                >
                    <ChevronRight size={28} />
                </button>
                <button 
                    onClick={() => scrollManual('left')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-black transition-all active:scale-90 md:opacity-0 md:group-hover/slider:opacity-100"
                >
                    <ChevronLeft size={28} />
                </button>

                {/* Visual Fades */}
                <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none"></div>

                <div 
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={stopInteraction}
                    onMouseUp={stopInteraction}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={stopInteraction}
                    onTouchMove={handleTouchMove}
                    className="flex gap-4 overflow-x-auto scrollbar-hide py-10 px-4 cursor-grab active:cursor-grabbing select-none touch-pan-y"
                    style={{ scrollBehavior: isInteracting ? 'auto' : 'smooth' }} 
                >
                    {displayImages.map((img, idx) => (
                        <div 
                            key={`${img.id}-${idx}`} 
                            className="relative flex-shrink-0 h-56 md:h-80 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group/item transition-transform duration-500 hover:scale-[1.02]"
                            onClick={() => !isInteracting && setSelectedIndex(idx % images.length)}
                        >
                            <img 
                                src={img.src} 
                                alt="Gallery" 
                                className="h-full w-auto object-cover pointer-events-none" 
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="text-white w-8 h-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox / Modal with Navigation */}
            {selectedIndex !== null && (
                <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center backdrop-blur-lg transition-all duration-300">
                    <button 
                        onClick={() => setSelectedIndex(null)} 
                        className="absolute top-6 right-6 text-white/70 hover:text-gold-500 transition-colors z-[110]"
                    >
                        <X size={36} />
                    </button>

                    {/* Navigation Buttons for Modal */}
                    <button 
                        onClick={handlePrevImage}
                        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-gold-500 transition-all z-[110] p-2 bg-white/5 rounded-full backdrop-blur-md border border-white/10 hover:scale-110 active:scale-95"
                    >
                        <ChevronRight size={48} className="md:w-16 md:h-16" />
                    </button>
                    <button 
                        onClick={handleNextImage}
                        className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-gold-500 transition-all z-[110] p-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 hover:scale-110 active:scale-95"
                    >
                        <ChevronLeft size={48} className="md:w-16 md:h-16" />
                    </button>

                    <div className="max-w-6xl w-full flex flex-col items-center px-4 relative">
                        {/* Image counter */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-white/40 text-sm font-bold tracking-widest">
                            {selectedIndex + 1} / {images.length}
                        </div>

                        <div className="relative group/modalimg">
                            <img 
                                key={images[selectedIndex].id}
                                src={images[selectedIndex].src} 
                                alt="Full Size" 
                                className="max-h-[85vh] max-w-full rounded-xl shadow-2xl border border-white/10 animate-fade-in object-contain" 
                            />
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default GallerySection;
