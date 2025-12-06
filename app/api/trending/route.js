import { NextResponse } from 'next/server';

// Cache configuration
const CACHE_TTL = 60 * 60 * 6; // 6 hours in seconds
const cache = new Map();

// Popular movie titles and keywords that typically trend
const TRENDING_KEYWORDS = [
  'Oppenheimer', 'Barbie', 'Killers of the Flower Moon', 'Dune Part Two',
  'The Marvels', 'Elemental', 'Insidious', 'The Nun II',
  'Asteroid City', 'Dungeons & Dragons', 'Indiana Jones',
  'Fast X', 'Mission Impossible', 'Aquaman', 'The Flash'
];

/**
 * Get trending movies
 * @route GET /api/trending?limit={limit}
 * @param {Request} req - The incoming request object
 * @returns {Promise<NextResponse>} Trending movies
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { success: false, message: 'Limit must be between 1 and 50' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `trending:${limit}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp) / 1000 < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        ...cachedData.data,
        cached: true,
      });
    }

    // Fetch trending movies
    const trendingMovies = [];
    const fetchedIds = new Set();

    // Try to fetch each trending keyword
    for (const keyword of TRENDING_KEYWORDS) {
      if (trendingMovies.length >= limit) break;

      try {
        const params = new URLSearchParams({
          apikey: process.env.NEXT_PUBLIC_OMDB_API_KEY,
          s: keyword,
          type: 'movie',
          page: '1',
        });

        const response = await fetch(`https://www.omdbapi.com/?${params.toString()}`);
        const data = await response.json();

        if (data.Response === 'True' && data.Search) {
          for (const movie of data.Search) {
            if (trendingMovies.length >= limit) break;
            
            if (
              !fetchedIds.has(movie.imdbID) &&
              movie.Poster && movie.Poster !== 'N/A' &&
              movie.Year && movie.imdbID
            ) {
              trendingMovies.push({
                id: movie.imdbID,
                imdbID: movie.imdbID,
                title: movie.Title,
                year: movie.Year,
                type: movie.Type,
                poster: movie.Poster,
              });
              fetchedIds.add(movie.imdbID);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching trending movies for ${keyword}:`, error);
        continue;
      }
    }

    // Cache the response
    const cacheValue = {
      data: {
        trending: trendingMovies,
        count: trendingMovies.length,
        lastUpdated: new Date().toISOString(),
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
    console.error('Trending Movies API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching trending movies',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      },
      { status: 500 }
    );
  }
}
