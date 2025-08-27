'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, StarIcon, ClockIcon, FilmIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useEffect } from 'react';

export default function MovieModal({ movie, isOpen, onClose }) {
  if (!isOpen || !movie) return null;

  const backdropUrl = movie.Poster !== 'N/A' ? movie.Poster : '/no-poster.png';

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            className="fixed inset-0 transition-opacity bg-black/80"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>

          <motion.div
            className="inline-block w-full max-w-4xl text-left align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="absolute top-4 right-4 z-10">
                <button
                  type="button"
                  className="bg-white rounded-full p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="relative h-64 md:h-96 w-full">
                <Image
                  src={backdropUrl}
                  alt={movie.Title}
                  fill
                  className="object-cover rounded-t-lg"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent rounded-t-lg" />
                <div className="absolute bottom-0 left-0 p-6">
                  <div className="bg-black/70 backdrop-blur-sm text-white rounded-lg p-4 shadow-lg max-w-[95%]">
                    <h2 className="text-3xl font-bold mb-2">{movie.Title}</h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <span className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {movie.Year}
                      </span>
                      {movie.Genre && (
                        <span className="flex items-center">
                          <FilmIcon className="h-4 w-4 mr-1" />
                          {movie.Genre}
                        </span>
                      )}
                      {movie.Runtime && (
                        <span className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {movie.Runtime}
                        </span>
                      )}
                      {movie.imdbRating && (
                        <span className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                          {movie.imdbRating}/10
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-100">Plot</h3>
                  <p className="text-gray-300 leading-relaxed">{movie.Plot || 'No plot available.'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {movie.Director && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Director</h4>
                      <p className="text-gray-100">{movie.Director}</p>
                    </div>
                  )}
                  {movie.Writer && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Writer</h4>
                      <p className="text-gray-100">{movie.Writer}</p>
                    </div>
                  )}
                  {movie.Actors && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-400">Cast</h4>
                      <p className="text-gray-100">{movie.Actors}</p>
                    </div>
                  )}
                </div>

                {movie.Ratings && movie.Ratings.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Ratings</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {movie.Ratings.map((rating, index) => (
                        <div key={index} className="bg-neutral-900/60 border border-white/10 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-100">{rating.Source}</div>
                          <div className="text-2xl font-bold text-amber-400">{rating.Value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-white/10 text-gray-200 bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
