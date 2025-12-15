import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const MAIN_ROUTES = ['/home', '/cooldown', '/spending', '/profile', '/settings'];

interface SwipeableLayoutProps {
  children: React.ReactNode;
}

const SwipeableLayout = ({ children }: SwipeableLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trigger } = useHapticFeedback();
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const currentIndex = MAIN_ROUTES.indexOf(location.pathname);
  const isMainRoute = currentIndex !== -1;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: currentIndex >= 0 ? currentIndex : 0,
    watchDrag: isMainRoute,
    loop: false,
    skipSnaps: false,
    duration: 25,
  });

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progress = emblaApi.scrollProgress();
    setScrollProgress(progress);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi || !isMainRoute) return;
    const selectedIndex = emblaApi.selectedScrollSnap();
    const targetRoute = MAIN_ROUTES[selectedIndex];
    
    if (targetRoute && targetRoute !== location.pathname) {
      trigger('light');
      navigate(targetRoute, { replace: true });
    }
  }, [emblaApi, navigate, location.pathname, isMainRoute, trigger]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('scroll', onScroll);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('scroll', onScroll);
    };
  }, [emblaApi, onSelect, onScroll]);

  // Sync carousel with route changes from BottomNav
  useEffect(() => {
    if (!emblaApi || !isMainRoute) return;
    const targetIndex = MAIN_ROUTES.indexOf(location.pathname);
    if (targetIndex !== -1 && targetIndex !== emblaApi.selectedScrollSnap()) {
      emblaApi.scrollTo(targetIndex, false);
    }
  }, [emblaApi, location.pathname, isMainRoute]);

  // For non-main routes, just render children normally
  if (!isMainRoute) {
    return <>{children}</>;
  }

  // Calculate individual slide transforms based on scroll progress
  const getSlideStyle = (index: number) => {
    const totalSlides = MAIN_ROUTES.length;
    const slideProgress = scrollProgress * (totalSlides - 1);
    const distance = Math.abs(slideProgress - index);
    const isActive = distance < 1;
    
    const scale = isActive ? 1 - distance * 0.05 : 0.95;
    const opacity = isActive ? 1 - distance * 0.3 : 0.7;
    
    return {
      transform: `scale(${scale})`,
      opacity,
      transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
    };
  };

  return (
    <div className="overflow-hidden h-full" ref={emblaRef}>
      <div className="flex h-full touch-pan-y">
        {MAIN_ROUTES.map((route, index) => (
          <div 
            key={route} 
            className="flex-[0_0_100%] min-w-0 h-full overflow-y-auto"
            style={getSlideStyle(index)}
          >
            {location.pathname === route && children}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwipeableLayout;
