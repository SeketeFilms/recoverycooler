import React, { useCallback, useEffect } from 'react';
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
  
  const currentIndex = MAIN_ROUTES.indexOf(location.pathname);
  const isMainRoute = currentIndex !== -1;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: currentIndex >= 0 ? currentIndex : 0,
    watchDrag: isMainRoute,
    loop: false,
    skipSnaps: false,
  });

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
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

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

  return (
    <div className="overflow-hidden h-full" ref={emblaRef}>
      <div className="flex h-full touch-pan-y">
        {MAIN_ROUTES.map((route, index) => (
          <div 
            key={route} 
            className="flex-[0_0_100%] min-w-0 h-full overflow-y-auto"
          >
            {location.pathname === route && children}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwipeableLayout;
