'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const MovieModalContext = createContext(null);

export function MovieModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [movieId, setMovieId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [movie, setMovie] = useState(null);

  // Open the modal with a specific movie ID
  const openModal = useCallback((id) => {
    if (!id) return;
    
    setMovieId(id);
    setIsOpen(true);
    
    // Reset state
    setMovie(null);
    setError(null);
    setIsLoading(true);
    
    // Fetch movie details in the background
    // This would be replaced with an actual API call in a real implementation
    setTimeout(() => {
      try {
        // Simulate API call
        const mockMovie = {
          id,
          title: 'Sample Movie',
          year: '2023',
          plot: 'This is a sample movie plot.',
          // ... other movie details
        };
        setMovie(mockMovie);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details');
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, []);

  // Close the modal
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setMovieId(null);
    setMovie(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return (
    <MovieModalContext.Provider
      value={{
        isOpen,
        movieId,
        movie,
        isLoading,
        error,
        openModal,
        closeModal,
      }}
    >
      {children}
    </MovieModalContext.Provider>
  );
}

export function useMovieModal() {
  const context = useContext(MovieModalContext);
  if (!context) {
    throw new Error('useMovieModal must be used within a MovieModalProvider');
  }
  return context;
}
