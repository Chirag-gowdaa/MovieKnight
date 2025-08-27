import { NextResponse } from 'next/server';
import { handleApiError, BadRequestError } from '@/lib/error-handler';

// Cache configuration
const CACHE_TTL = 60 * 60 * 12; // 12 hours in seconds
const cache = new Map();

// Common movie genres for validation
const VALID_GENRES = [
  'action', 'adventure', 'animation', 'biography', 'comedy', 'crime', 'documentary',
  'drama', 'family', 'fantasy', 'film-noir', 'history', 'horror', 'music', 'musical',
  'mystery', 'romance', 'sci-fi', 'sport', 'thriller', 'war', 'western'
];

/**
 * Get movie recommendations based on genre and year
 * @route GET /api/recommendations?genre={genre}&year={year}&page={page}
 * @param {Request} req - The incoming request object
 * @returns {Promise<NextResponse>} The recommended movies
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const genre = searchParams.get('genre')?.toLowerCase();
    const year = searchParams.get('year');
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Input validation
    if (!genre) {
      throw new BadRequestError('Genre is required');
    }

    if (!VALID_GENRES.includes(genre)) {
      throw new BadRequestError(
        `Invalid genre. Must be one of: ${VALID_GENRES.join(', ')}`
      );
    }

    if (year && !/^\d{4}$/.test(year)) {
      throw new BadRequestError('Year must be a valid 4-digit year');
    }

    if (page < 1) {
      throw new BadRequestError('Page number must be greater than 0');
    }

    // Construct cache key
    const cacheKey = `recommendations:${genre}:${year || 'any'}:${page}`;
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
    const params = new URLSearchParams({
      apikey: process.env.NEXT_PUBLIC_OMDB_API_KEY,
      s: genre,
      type: 'movie',
      page: page.toString(),
      ...(year && { y: year }),
    });

    const apiUrl = `https://www.omdbapi.com/?${params.toString()}`;
    
    // Fetch from OMDb API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`OMDb API returned status ${response.status}`);
    }

    const data = await response.json();

    // Handle OMDb API errors
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Failed to fetch recommendations');
    }

    // Filter out movies without poster and with missing data
    const results = (data.Search || [])
      .filter(movie => 
        movie.Poster && movie.Poster !== 'N/A' && 
        movie.Year && movie.imdbID
      )
      .map(movie => ({
        id: movie.imdbID,
        title: movie.Title,
        year: movie.Year,
        type: movie.Type,
        poster: movie.Poster,
      }));

    // Cache the successful response
    const cacheValue = {
      data: {
        results,
        totalResults: parseInt(data.totalResults, 10) || 0,
        page,
        hasMore: (data.totalResults || 0) > page * 10,
      },
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
      ...cacheValue.data,
    });
  } catch (error) {
    console.error('Recommendations API Error:', error);
    
    if (error instanceof BadRequestError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching recommendations',
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
