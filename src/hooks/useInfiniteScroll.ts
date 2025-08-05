import { useEffect, useState, useRef } from 'react';

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  loading: boolean;
  threshold?: number; // Distance from bottom to trigger loading (in pixels)
}

export const useInfiniteScroll = ({
  hasNextPage,
  fetchNextPage,
  loading,
  threshold = 300
}: UseInfiniteScrollOptions) => {
  const [isFetching, setIsFetching] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !loading && !isFetching) {
          setIsFetching(true);
          fetchNextPage();
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasNextPage, fetchNextPage, loading, isFetching, threshold]);

  useEffect(() => {
    if (!loading) {
      setIsFetching(false);
    }
  }, [loading]);

  return { sentinelRef, isFetching };
};
