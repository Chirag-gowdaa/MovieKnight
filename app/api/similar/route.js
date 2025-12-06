import { NextResponse } from 'next/server';
import { BadRequestError } from '@/lib/error-handler';

// Cache configuration
const CACHE_TTL = 60 * 60 * 12; // 12 hours in seconds
const cache = new Map();

/**
 * Get similar movies based on a movie ID
 * Fetches the movie details and searches for similar movies by genre
 * @route GET /api/similar?id={movieId}
 * @param {Request} req - The incoming request object
 * @returns {Promise<NextResponse>} Similar movies
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Input validation
    if (!movieId) {
      throw new BadRequestError('Movie ID is required');
    }

    if (limit < 1 || limit > 50) {
      throw new BadRequestError('Limit must be between 1 and 50');
    }

    // Check cache
    const cacheKey = `similar:${movieId}:${limit}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp) / 1000 < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        ...cachedData.data,
        cached: true,
      });
    }

    // Fetch the original movie details
    const movieParams = new URLSearchParams({
      apikey: process.env.NEXT_PUBLIC_OMDB_API_KEY,
      i: movieId,
      plot: 'full',
    });

    const movieResponse = await fetch(`https://www.omdbapi.com/?${movieParams.toString()}`);
    const movieData = await movieResponse.json();

    if (movieData.Response === 'False') {
      throw new Error('Movie not found');
    }

    // Extract genres from the movie
    const genres = movieData.Genre ? movieData.Genre.split(', ') : [];
    
    if (genres.length === 0) {
      return NextResponse.json({
        success: true,
        similar: [],
        message: 'No genres found for this movie',
      });
    }

    // Search for similar movies using the first genre
    const primaryGenre = genres[0].toLowerCase();
    const searchParams2 = new URLSearchParams({
      apikey: process.env.NEXT_PUBLIC_OMDB_API_KEY,
      s: primaryGenre,
      type: 'movie',
      page: '1',
    });

    const searchResponse = await fetch(`https://www.omdbapi.com/?${searchParams2.toString()}`);
    const searchData = await searchResponse.json();

    if (searchData.Response === 'False') {
      return NextResponse.json({
        success: true,
        similar: [],
        message: 'No similar movies found',
      });
    }

    // Filter and process results
    let similar = (searchData.Search || [])
      .filter(movie => 
        movie.imdbID !== movieId && // Exclude the original movie
        movie.Poster && movie.Poster !== 'N/A' && 
        movie.Year && movie.imdbID
      )
      .slice(0, limit)
      .map(movie => ({
        id: movie.imdbID,
        imdbID: movie.imdbID,
        title: movie.Title,
        year: movie.Year,
        type: movie.Type,
        poster: movie.Poster,
      }));

    // Cache the response
    const cacheValue = {
      data: {
        similar,
        originalMovie: {
          id: movieData.imdbID,
          title: movieData.Title,
          genres: genres,
        },
        count: similar.length,
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
    console.error('Similar Movies API Error:', error);
    
    if (error instanceof BadRequestError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching similar movies',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      },
      { status: 500 }
    );
  }
}
