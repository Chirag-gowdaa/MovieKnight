/**
 * Format movie data from OMDb API to our consistent format
 * @param {Object} data - Raw movie data from OMDb API
 * @returns {Object} Formatted movie object
 */
export function formatMovieData(data) {
  if (!data) return null;

  return {
    id: data.imdbID,
    title: data.Title || 'Unknown Title',
    year: data.Year || 'N/A',
    rated: data.Rated || 'N/A',
    released: data.Released || 'N/A',
    runtime: data.Runtime || 'N/A',
    genre: data.Genre ? data.Genre.split(', ').filter(Boolean) : [],
    director: data.Director || 'N/A',
    writer: data.Writer || 'N/A',
    actors: data.Actors ? data.Actors.split(', ').filter(Boolean) : [],
    plot: data.Plot || 'No plot available.',
    language: data.Language || 'N/A',
    country: data.Country || 'N/A',
    awards: data.Awards || 'N/A',
    poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : null,
    ratings: data.Ratings
      ? data.Ratings.map(rating => ({
          source: rating.Source,
          value: rating.Value,
        }))
      : [],
    metascore: data.Metascore || 'N/A',
    imdbRating: data.imdbRating || 'N/A',
    imdbVotes: data.imdbVotes || 'N/A',
    type: data.Type || 'movie',
    dvd: data.DVD || 'N/A',
    boxOffice: data.BoxOffice || 'N/A',
    production: data.Production || 'N/A',
    website: data.Website || 'N/A',
  };
}

/**
 * Format a duration string (e.g., "PT2H22M") to a human-readable format (e.g., "2h 22m")
 * @param {string} duration - ISO 8601 duration string
 * @returns {string} Formatted duration
 */
export function formatDuration(duration) {
  if (!duration) return 'N/A';
  
  // Simple implementation - can be enhanced for more complex cases
  const hoursMatch = duration.match(/(\d+)H/);
  const minutesMatch = duration.match(/(\d+)M/);
  
  const hours = hoursMatch ? `${hoursMatch[1]}h` : '';
  const minutes = minutesMatch ? `${minutesMatch[1]}m` : '';
  
  return [hours, minutes].filter(Boolean).join(' ').trim() || 'N/A';
}

/**
 * Format a number with commas as thousand separators
 * @param {number|string} num - The number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num === null || num === undefined || num === 'N/A') return 'N/A';
  return Number(num).toLocaleString();
}

/**
 * Get the appropriate poster image URL or a fallback image
 * @param {string} posterUrl - The poster URL from the API
 * @param {Object} options - Options
 * @param {string} [options.size='original'] - Image size ('original', 'small', 'medium', 'large')
 * @returns {string} Image URL
 */
export function getPosterImage(posterUrl, { size = 'original' } = {}) {
  if (!posterUrl || posterUrl === 'N/A') {
    return '/no-poster.png';
  }

  // In a real app, you might use an image CDN to resize images
  // This is a simplified example
  return posterUrl;
}

/**
 * Format a rating value with the appropriate number of decimal places
 * @param {string|number} rating - The rating value
 * @param {number} [max=10] - Maximum possible rating
 * @returns {string} Formatted rating
 */
export function formatRating(rating, max = 10) {
  if (rating === 'N/A' || rating === null || rating === undefined) {
    return 'N/A';
  }
  
  const num = typeof rating === 'string' ? parseFloat(rating) : rating;
  if (isNaN(num)) return 'N/A';
  
  // Format to 1 decimal place if not a whole number
  return num % 1 === 0 ? num.toString() : num.toFixed(1);
}

/**
 * Get the appropriate color class for a rating value
 * @param {string|number} rating - The rating value
 * @returns {string} Tailwind CSS color class
 */
export function getRatingColorClass(rating) {
  if (rating === 'N/A') return 'bg-gray-200 text-gray-800';
  
  const num = typeof rating === 'string' ? parseFloat(rating) : rating;
  if (isNaN(num)) return 'bg-gray-200 text-gray-800';
  
  if (num >= 7.5) return 'bg-green-500 text-white';
  if (num >= 5) return 'bg-yellow-500 text-gray-900';
  return 'bg-red-500 text-white';
}

/**
 * Get the appropriate icon for a rating source
 * @param {string} source - The rating source (e.g., 'Internet Movie Database', 'Rotten Tomatoes')
 * @returns {Object} Icon component and color class
 */
export function getRatingIcon(source) {
  const lowerSource = source.toLowerCase();
  
  if (lowerSource.includes('internet movie database')) {
    return {
      icon: 'IMDb',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
    };
  }
  
  if (lowerSource.includes('rotten tomatoes')) {
    return {
      icon: 'RT',
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    };
  }
  
  if (lowerSource.includes('metacritic')) {
    return {
      icon: 'MC',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    };
  }
  
  // Default icon
  return {
    icon: '★',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  };
}
