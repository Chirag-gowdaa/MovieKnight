'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import { StarIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function MovieCard({ movie, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : '/no-poster.png';

  return (
    <motion.div
      className="relative rounded-xl overflow-hidden bg-neutral-900/60 border border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={posterUrl}
          alt={movie.Title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {isHovered && (
          <motion.div 
            className="absolute inset-0 bg-black/60 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-amber-500 p-3 rounded-full">
              <PlayIcon className="h-6 w-6 text-white" />
            </div>
          </motion.div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-100 line-clamp-1">{movie.Title}</h3>
        <div className="flex items-center mt-1 text-sm text-gray-300">
          {movie.imdbRating && (
            <div className="flex items-center mr-4">
              <StarIcon className="h-4 w-4 text-amber-500 mr-1" />
              <span>{movie.imdbRating}</span>
            </div>
          )}
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span>{movie.Year}</span>
          </div>
        </div>
        {movie.Type && (
          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-300 rounded-full">
            {movie.Type}
          </span>
        )}
      </div>
    </motion.div>
  );
}
