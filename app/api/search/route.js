import { NextResponse } from 'next/server';
import { handleApiError, BadRequestError, NotFoundError } from '@/lib/error-handler';

// Cache configuration
const CACHE_TTL = 60 * 60 * 6; // 6 hours in seconds
const cache = new Map();

/**
 * Search movies by title
 * @route GET /api/search?q={query}&page={page}&year={year}&type={type}
 * @param {Request} req - The incoming request object
 * @returns {Promise<NextResponse>} The search results
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const year = searchParams.get('year');
    const type = searchParams.get('type'); // movie, series, episode

    // Input validation
    if (!query || query.length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters long');
    }

    if (page < 1) {
      throw new BadRequestError('Page number must be greater than 0');
    }

    // Construct cache key
    const cacheKey = `search:${query.toLowerCase()}:${page}:${year || ''}:${type || ''}`;
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
      s: query,
      page: page.toString(),
      ...(year && { y: year }),
      ...(type && { type }),
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
      if (data.Error === 'Movie not found!' || data.Error === 'Incorrect IMDb ID.') {
        throw new NotFoundError('No movies found matching your search criteria');
      }
      throw new Error(data.Error || 'Failed to fetch data from OMDb API');
    }

    // Cache the successful response
    const cacheValue = {
      data,
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
      totalResults: parseInt(data.totalResults, 10) || 0,
      page,
      results: data.Search || [],
    });
  } catch (error) {
    console.error('Search API Error:', error);
    
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status || 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while processing your request',
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
