'use client';

import { motion } from 'framer-motion';
import MovieCard from './MovieCard';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function RecommendationsGrid({ movies, onMovieSelect }) {
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No movies found</h3>
        <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 sm:px-6 lg:px-8 py-8"
    >
      {movies.map((movie) => (
        <motion.div key={movie.imdbID} variants={item}>
          <MovieCard 
            movie={movie} 
            onClick={() => onMovieSelect(movie)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
