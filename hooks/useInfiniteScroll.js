import { useEffect, useRef, useCallback } from 'react';

/**
 * A custom hook for implementing infinite scroll functionality
 * @param {Object} options - Configuration options
 * @param {Function} options.fetchMore - Function to call when more data should be loaded
 * @param {boolean} options.hasMore - Whether there is more data to load
 * @param {boolean} options.isLoading - Whether data is currently being loaded
 * @param {number} [options.threshold=100] - Distance from bottom of page to trigger loading (in pixels)
 * @param {boolean} [options.enabled=true] - Whether the infinite scroll is enabled
 */
function useInfiniteScroll({ 
  fetchMore, 
  hasMore, 
  isLoading, 
  threshold = 100,
  enabled = true 
}) {
  const observerRef = useRef(null);
  const isFetchingRef = useRef(false);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isLoading && !isFetchingRef.current) {
      isFetchingRef.current = true;
      fetchMore().finally(() => {
        isFetchingRef.current = false;
      });
    }
  }, [fetchMore, hasMore, isLoading]);

  // Set up the intersection observer
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;

    const options = {
      root: null, // viewport
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleObserver, options);
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [handleObserver, threshold, enabled]);

  // Reset the fetching state when dependencies change
  useEffect(() => {
    isFetchingRef.current = false;
  }, [fetchMore, hasMore, isLoading]);

  return { observerRef };
}

export default useInfiniteScroll;
