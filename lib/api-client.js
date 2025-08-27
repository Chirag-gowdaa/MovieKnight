/**
 * Client-side API client for making requests to our Next.js API routes
 */

const API_BASE_URL = '/api';

/**
 * Make a GET request to an API endpoint
 * @param {string} path - The API endpoint path
 * @param {Object} params - Query parameters
 * @returns {Promise<any>} The response data
 */
export async function get(path, params = {}) {
  try {
    // Convert params object to URLSearchParams
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Enable CORS credentials if needed
      // credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Search for movies by title
 * @param {string} query - The search query
 * @param {number} [page=1] - The page number
 * @returns {Promise<{results: Array, totalResults: number, page: number}>}
 */
export async function searchMovies(query, page = 1) {
  if (!query || query.trim().length < 2) {
    return { results: [], totalResults: 0, page: 1 };
  }

  const data = await get('/search', { q: query, page });
  return {
    results: data.results || [],
    totalResults: data.totalResults || 0,
    page: data.page || 1,
  };
}

/**
 * Get movie details by IMDb ID
 * @param {string} id - The IMDb ID
 * @returns {Promise<Object>} The movie details
 */
export async function getMovieDetails(id) {
  if (!id) {
    throw new Error('Movie ID is required');
  }
  const data = await get(`/movies/${id}`);
  return data.data;
}

/**
 * Get movie recommendations by genre and year
 * @param {string} genre - The movie genre
 * @param {string} [year] - The release year
 * @param {number} [page=1] - The page number
 * @returns {Promise<{results: Array, totalResults: number, page: number, hasMore: boolean}>}
 */
export async function getRecommendations(genre, year, page = 1) {
  if (!genre) {
    throw new Error('Genre is required');
  }

  const data = await get('/recommendations', { genre, ...(year && { year }), page });
  
  return {
    results: data.results || [],
    totalResults: data.totalResults || 0,
    page: data.page || 1,
    hasMore: data.hasMore || false,
  };
}

/**
 * Get trending movies (placeholder - would be implemented with a real API)
 * @param {number} [limit=10] - Maximum number of movies to return
 * @returns {Promise<Array>} Array of trending movies
 */
export async function getTrendingMovies(limit = 10) {
  // This is a placeholder - in a real app, you would call a trending movies API
  // For now, we'll return an empty array
  return [];
}

export default {
  get,
  searchMovies,
  getMovieDetails,
  getRecommendations,
  getTrendingMovies,
};
