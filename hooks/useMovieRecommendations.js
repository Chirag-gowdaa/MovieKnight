import { useState, useEffect, useCallback } from 'react';
import { getRecommendations } from '@/lib/api-client';

export function useMovieRecommendations(initialGenre = '', initialYear = '') {
  const [genre, setGenre] = useState(initialGenre);
  const [year, setYear] = useState(initialYear);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [genre, year]);

  // Fetch recommendations when filters or page changes
  const fetchRecommendations = useCallback(async () => {
    if (!genre) {
      setResults([]);
      setTotalResults(0);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getRecommendations(genre, year, page);
      
      // If it's the first page, replace results, otherwise append
      setResults(prevResults => 
        page === 1 ? data.results : [...prevResults, ...data.results]
      );
      
      setTotalResults(data.totalResults);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message || 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [genre, year, page]);

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Load more results
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage(prevPage => prevPage + 1);
    }
  }, [hasMore, isLoading]);

  // Update filters
  const updateFilters = useCallback((newGenre, newYear = '') => {
    setGenre(newGenre);
    setYear(newYear);
    setPage(1);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setGenre('');
    setYear('');
    setPage(1);
    setResults([]);
    setTotalResults(0);
    setError(null);
  }, []);

  return {
    genre,
    year,
    page,
    results,
    totalResults,
    isLoading,
    error,
    hasMore,
    loadMore,
    updateFilters,
    resetFilters,
  };
}

export default useMovieRecommendations;
