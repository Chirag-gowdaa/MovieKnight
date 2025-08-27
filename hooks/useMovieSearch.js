import { useState, useEffect, useCallback } from 'react';
import { searchMovies } from '@/lib/api-client';

export function useMovieSearch(initialQuery = '', initialPage = 1) {
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Reset pagination when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  // Fetch movies when query or page changes
  const fetchMovies = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await searchMovies(query, page);
      
      // If it's the first page, replace results, otherwise append
      setResults(prevResults => 
        page === 1 ? data.results : [...prevResults, ...data.results]
      );
      
      setTotalResults(data.totalResults);
      setHasMore(data.page * 10 < data.totalResults);
    } catch (err) {
      console.error('Error searching movies:', err);
      setError(err.message || 'Failed to search movies');
    } finally {
      setIsLoading(false);
    }
  }, [query, page]);

  // Initial fetch and when dependencies change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2 || query.trim() === '') {
        fetchMovies();
      }
    }, 300); // Debounce the search

    return () => clearTimeout(timer);
  }, [query, page, fetchMovies]);

  // Load more results
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage(prevPage => prevPage + 1);
    }
  }, [hasMore, isLoading]);

  // Reset search
  const resetSearch = useCallback(() => {
    setQuery('');
    setPage(1);
    setResults([]);
    setTotalResults(0);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    page,
    setPage,
    results,
    totalResults,
    isLoading,
    error,
    hasMore,
    loadMore,
    resetSearch,
  };
}

export default useMovieSearch;
