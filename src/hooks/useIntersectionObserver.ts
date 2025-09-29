import { useEffect, useRef } from 'react';

export function useIntersectionObserver(
  callback: () => void,
  enabled: boolean,
  deps: any[] = []
) {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!targetRef.current || !enabled) return;
    
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && callback(),
      { rootMargin: '100px', threshold: 0.1 }
    );
    
    observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, [enabled, callback, ...deps]);

  return targetRef;
}

