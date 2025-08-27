import { NextResponse } from 'next/server';
import { handleApiError, BadRequestError, NotFoundError } from '@/lib/error-handler';

// Cache configuration
const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds
const cache = new Map();

/**
 * Get movie details by IMDb ID
 * @route GET /api/movies/{id}
 * @param {Request} req - The incoming request object
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Route parameters (Next 15)
 * @returns {Promise<NextResponse>} The movie details
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // Input validation
    if (!id || !/^tt\d+$/.test(id)) {
      throw new BadRequestError('Invalid IMDb ID format');
    }

    // Construct cache key
    const cacheKey = `movie:${id}`;
    const cachedData = cache.get(cacheKey);
    
    // Return cached response if available and not expired
    if (cachedData && (Date.now() - cachedData.timestamp) / 1000 < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        ...cachedData.data,
        cached: true,
      });
    }

    // Build OMDb API URL
    const queryParams = new URLSearchParams({
      apikey: process.env.NEXT_PUBLIC_OMDB_API_KEY,
      i: id,
      plot: 'full',
    });

    const apiUrl = `https://www.omdbapi.com/?${queryParams.toString()}`;
    
    // Fetch from OMDb API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`OMDb API returned status ${response.status}`);
    }

    const data = await response.json();

    // Handle OMDb API errors
    if (data.Response === 'False') {
      if (data.Error === 'Incorrect IMDb ID.') {
        throw new NotFoundError('Movie not found');
      }
      throw new Error(data.Error || 'Failed to fetch data from OMDb API');
    }

    // Transform the data to a more consistent format
    const movie = {
      id: data.imdbID,
      title: data.Title,
      year: data.Year,
      rated: data.Rated,
      released: data.Released,
      runtime: data.Runtime,
      genre: data.Genre?.split(', ').filter(Boolean) || [],
      director: data.Director,
      writer: data.Writer,
      actors: data.Actors?.split(', ').filter(Boolean) || [],
      plot: data.Plot,
      language: data.Language,
      country: data.Country,
      awards: data.Awards,
      poster: data.Poster !== 'N/A' ? data.Poster : null,
      ratings: data.Ratings?.map(rating => ({
        source: rating.Source,
        value: rating.Value,
      })) || [],
      metascore: data.Metascore,
      imdbRating: data.imdbRating,
      imdbVotes: data.imdbVotes,
      type: data.Type,
      dvd: data.DVD,
      boxOffice: data.BoxOffice,
      production: data.Production,
      website: data.Website,
    };

    // Cache the successful response
    const cacheValue = {
      data: movie,
      timestamp: Date.now(),
    };
    cache.set(cacheKey, cacheValue);

    // Clean up old cache entries
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if ((now - value.timestamp) / 1000 > CACHE_TTL) {
        cache.delete(key);
      }
    }

    return NextResponse.json({
      success: true,
      data: movie,
    });
  } catch (error) {
    console.error('Movie Details API Error:', error);
    
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status || 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching movie details',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      },
      { status: 500 }
    );
  }
}

// Configure CORS headers
export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
