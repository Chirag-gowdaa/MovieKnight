const API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;
const BASE_URL = 'https://www.omdbapi.com/';

// Cache for API responses
const cache = new Map();

function handleMissingApiKey() {
  if (!API_KEY || API_KEY === 'your_omdb_api_key_here') {
    return {
      error: 'Missing OMDb API key. Set NEXT_PUBLIC_OMDB_API_KEY in .env.local',
    };
  }
  return null;
}

export async function searchMovies(query, page = 1) {
  const keyError = handleMissingApiKey();
  if (keyError) {
    return { movies: [], totalResults: 0, error: keyError.error };
  }
  
  const cacheKey = `search_${query}_${page}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${page}&type=movie`
    );
    const data = await response.json();
    
    if (data.Response === 'True') {
      const result = {
        movies: data.Search || [],
        totalResults: parseInt(data.totalResults, 10),
        error: null,
      };
      cache.set(cacheKey, result);
      return result;
    } else {
      return {
        movies: [],
        totalResults: 0,
        error: data.Error || 'An error occurred while searching for movies',
      };
    }
  } catch (error) {
    console.error('Error searching movies:', error);
    return {
      movies: [],
      totalResults: 0,
      error: 'Failed to fetch movies. Please try again later.',
    };
  }
}

export async function getMovieById(id) {
  const keyError = handleMissingApiKey();
  if (keyError) {
    return { movie: null, error: keyError.error };
  }
  
  const cacheKey = `movie_${id}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}?apikey=${API_KEY}&i=${id}&plot=full`
    );
    const data = await response.json();
    
    if (data.Response === 'True') {
      const result = { movie: data, error: null };
      cache.set(cacheKey, result);
      return result;
    } else {
      return { movie: null, error: data.Error || 'Movie not found' };
    }
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return { movie: null, error: 'Failed to fetch movie details' };
  }
}

export async function getMultipleMoviesById(ids) {
  const keyError = handleMissingApiKey();
  if (keyError) {
    return { movies: [], error: keyError.error };
  }
  
  try {
    const promises = ids.map(id => getMovieById(id));
    const results = await Promise.all(promises);
    
    const movies = results
      .filter(result => result.movie && !result.error)
      .map(result => result.movie);
    
    return { movies, error: null };
  } catch (error) {
    console.error('Error fetching multiple movies:', error);
    return { movies: [], error: 'Failed to fetch movies' };
  }
}

export async function getRecommendationsByGenre(genre, year = '') {
  const keyError = handleMissingApiKey();
  if (keyError) {
    return { movies: [], error: keyError.error };
  }
  
  const cacheKey = `recommendations_${genre}_${year}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  try {
    // First, search for movies by genre
    const response = await fetch(
      `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(genre)}&type=movie&y=${year}`
    );
    const data = await response.json();
    
    if (data.Response === 'True') {
      // Fetch full details for each movie
      const detailedMovies = await Promise.all(
        data.Search.slice(0, 10).map(movie => getMovieById(movie.imdbID))
      );
      
      const result = {
        movies: detailedMovies
          .filter(result => result.movie && result.movie.imdbRating !== 'N/A')
          .sort((a, b) => parseFloat(b.movie.imdbRating) - parseFloat(a.movie.imdbRating))
          .map(result => result.movie),
        error: null,
      };
      
      cache.set(cacheKey, result);
      return result;
    } else {
      return {
        movies: [],
        error: data.Error || 'No recommendations found',
      };
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return {
      movies: [],
      error: 'Failed to fetch recommendations',
    };
  }
}

/**
 * Get trending movies - returns popular recent movies from a predefined list
 */
export async function getTrendingMovies(limit = 10) {
  const trendingIds = [
    'tt14208870', // Dune: Part Two (2024)
    'tt1160419',  // Dune (2021)
    'tt13238346', // The Brutalist (2023)
    'tt15398776', // Oppenheimer (2023)
    'tt1745960',  // Top Gun: Maverick (2022)
    'tt6710474',  // Everything Everywhere All at Once (2022)
    'tt10872600', // The Adam Project (2022)
    'tt11286314', // Don't Look Up (2021)
    'tt1517268',  // Barbie (2023)
    'tt2382320',  // No Time to Die (2021)
    'tt10954984', // Killers of the Flower Moon (2023)
    'tt9362722',  // The Irishman (2019)
  ];

  try {
    const movies = [];
    const selectedIds = trendingIds.slice(0, Math.min(limit, trendingIds.length));
    
    for (const id of selectedIds) {
      try {
        const { movie } = await getMovieById(id);
        if (movie && movie.Poster && movie.Poster !== 'N/A') {
          movies.push(movie);
        }
      } catch (err) {
        console.warn(`Failed to fetch movie ${id}:`, err);
        // Continue with next movie if one fails
      }
    }
    
    return { 
      trending: movies, 
      count: movies.length, 
      lastUpdated: new Date().toISOString(),
      success: true 
    };
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return { trending: [], count: 0, lastUpdated: null, success: false };
  }
}

/**
 * Get similar movies based on a movie ID
 */
export async function getSimilarMovies(movieId, limit = 10) {
  if (!movieId) {
    return { similar: [], originalMovie: null, count: 0 };
  }

  try {
    const { movie: originalMovie } = await getMovieById(movieId);
    if (!originalMovie) {
      return { similar: [], originalMovie: null, count: 0 };
    }

    // Extract genre from original movie and search for similar movies
    const genres = originalMovie.Genre ? originalMovie.Genre.split(',')[0].trim() : '';
    
    if (!genres) {
      return { similar: [], originalMovie, count: 0 };
    }

    const cacheKey = `similar_${movieId}_${limit}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const response = await fetch(
      `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(genres)}&type=movie`
    );
    const data = await response.json();

    let similar = [];
    if (data.Response === 'True' && data.Search) {
      // Filter out the original movie and get similar ones
      const filteredMovies = data.Search
        .filter(m => m.imdbID !== movieId)
        .slice(0, limit);

      for (const movie of filteredMovies) {
        const { movie: details } = await getMovieById(movie.imdbID);
        if (details) {
          similar.push(details);
        }
      }
    }

    const result = { similar, originalMovie, count: similar.length };
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return { similar: [], originalMovie: null, count: 0 };
  }
}

// Clear cache function for development
export function clearCache() {
  cache.clear();
}
