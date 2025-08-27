'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import RecommendationsGrid from '@/components/RecommendationsGrid';
import MovieModal from '@/components/MovieModal';
import { searchMovies, getMovieById } from '@/lib/api';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState('');

  // Fetch search results when query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setMovies([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { movies: results, totalResults: total, error } = await searchMovies(query, page);
        if (error) {
          setError(error);
          setMovies([]);
        } else {
          setMovies(prev => page === 1 ? results : [...prev, ...results]);
          setTotalResults(parseInt(total, 10) || 0);
          setError('');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch search results. Please try again.');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, page]);

  // Handle movie selection
  const handleMovieSelect = async (movie) => {
    try {
      const { movie: details } = await getMovieById(movie.imdbID);
      setSelectedMovie(details);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (movies.length < totalResults) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(1000px 700px at 0% 0%, rgba(17,24,39,0.9), transparent), radial-gradient(1000px 700px at 100% 20%, rgba(17,24,39,0.9), transparent), linear-gradient(180deg, #0a0a0a, #0b0b0b)' }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <SearchBar onSearch={(q) => q && window.history.replaceState(null, '', `/search?q=${encodeURIComponent(q)}`)} initialQuery={query} />
        </div>
        <div className="glass-dark rounded-2xl p-6">
          {loading && movies.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-gray-100 mb-2">Error</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors"
              >
                Back to Home
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-100 mb-8">
                Search Results for "{query}"
              </h1>
              
              {movies.length > 0 ? (
                <>
                  <RecommendationsGrid 
                    movies={movies} 
                    onMovieSelect={handleMovieSelect} 
                  />
                  
                  {movies.length < totalResults && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-6 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-sm font-medium text-gray-200 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                      >
                        {loading ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-xl font-medium text-gray-100 mb-2">No movies found</h3>
                  <p className="text-gray-400 mb-4">Try a different search term.</p>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
