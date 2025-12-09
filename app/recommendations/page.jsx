'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import RecommendationsGrid from '@/components/RecommendationsGrid';
import MovieModal from '@/components/MovieModal';
import { searchMovies, getMovieById, getTrendingMovies, getSimilarMovies } from '@/lib/api';
import { 
  FilmIcon, 
  StarIcon, 
  FireIcon, 
  HeartIcon, 
  SparklesIcon,
  ClockIcon,
  GlobeAltIcon,
  UserGroupIcon,
  MagnifyingGlassIcon as SearchIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Curated movie collections
const CURATED_COLLECTIONS = {
  comedy: {
    title: "Comedy Classics",
    icon: "😄",
    description: "Laugh-out-loud movies that never get old",
    movies: [
      { title: "The Hangover", year: "2009", imdbID: "tt1119646" },
      { title: "The Hangover Part II", year: "2011", imdbID: "tt1411697" },
      { title: "The Hangover Part III", year: "2013", imdbID: "tt1951261" },
      { title: "Superbad", year: "2007", imdbID: "tt0829482" },
      { title: "Bridesmaids", year: "2011", imdbID: "tt1478338" },
      { title: "The 40-Year-Old Virgin", year: "2005", imdbID: "tt0405422" },
      { title: "Knocked Up", year: "2007", imdbID: "tt0478311" },
      { title: "This Is the End", year: "2013", imdbID: "tt1245492" }
    ]
  },
  action: {
    title: "Action Blockbusters",
    icon: "💥",
    description: "High-octane thrillers and explosive adventures",
    movies: [
      { title: "Mad Max: Fury Road", year: "2015", imdbID: "tt1392190" },
      { title: "John Wick", year: "2014", imdbID: "tt2911666" },
      { title: "Mission: Impossible - Fallout", year: "2018", imdbID: "tt4912910" },
      { title: "The Dark Knight", year: "2008", imdbID: "tt0468569" },
      { title: "Inception", year: "2010", imdbID: "tt1375666" },
      { title: "The Avengers", year: "2012", imdbID: "tt0848228" },
      { title: "Black Panther", year: "2018", imdbID: "tt1825683" },
      { title: "Spider-Man: Into the Spider-Verse", year: "2018", imdbID: "tt4633694" }
    ]
  },
  drama: {
    title: "Drama Masterpieces",
    icon: "🎭",
    description: "Emotional journeys and powerful storytelling",
    movies: [
      { title: "The Shawshank Redemption", year: "1994", imdbID: "tt0111161" },
      { title: "Forrest Gump", year: "1994", imdbID: "tt0109830" },
      { title: "The Green Mile", year: "1999", imdbID: "tt0120689" },
      { title: "Schindler's List", year: "1993", imdbID: "tt0108052" },
      { title: "The Godfather", year: "1972", imdbID: "tt0068646" },
      { title: "Pulp Fiction", year: "1994", imdbID: "tt0110912" },
      { title: "Fight Club", year: "1999", imdbID: "tt0133093" },
      { title: "Goodfellas", year: "1990", imdbID: "tt0099685" }
    ]
  },
  scifi: {
    title: "Sci-Fi Adventures",
    icon: "🚀",
    description: "Futuristic worlds and mind-bending concepts",
    movies: [
      { title: "Interstellar", year: "2014", imdbID: "tt0816692" },
      { title: "Blade Runner 2049", year: "2017", imdbID: "tt1856101" },
      { title: "Arrival", year: "2016", imdbID: "tt2543164" },
      { title: "Ex Machina", year: "2014", imdbID: "tt0470752" },
      { title: "The Martian", year: "2015", imdbID: "tt3659388" },
      { title: "Gravity", year: "2013", imdbID: "tt1454468" },
      { title: "Her", year: "2013", imdbID: "tt1798709" },
      { title: "Edge of Tomorrow", year: "2014", imdbID: "tt1631867" }
    ]
  },
  horror: {
    title: "Horror Thrillers",
    icon: "👻",
    description: "Spine-chilling scares and psychological terror",
    movies: [
      { title: "Get Out", year: "2017", imdbID: "tt5052448" },
      { title: "A Quiet Place", year: "2018", imdbID: "tt6644200" },
      { title: "Hereditary", year: "2018", imdbID: "tt7784604" },
      { title: "The Conjuring", year: "2013", imdbID: "tt1457767" },
      { title: "It Follows", year: "2014", imdbID: "tt3235888" },
      { title: "The Babadook", year: "2014", imdbID: "tt2321549" },
      { title: "Sinister", year: "2012", imdbID: "tt1922777" },
      { title: "The Witch", year: "2015", imdbID: "tt4263482" }
    ]
  },
  romance: {
    title: "Romance & Love",
    icon: "💕",
    description: "Heartwarming love stories and romantic comedies",
    movies: [
      { title: "La La Land", year: "2016", imdbID: "tt3783958" },
      { title: "The Notebook", year: "2004", imdbID: "tt0332280" },
      { title: "500 Days of Summer", year: "2009", imdbID: "tt1022603" },
      { title: "Eternal Sunshine of the Spotless Mind", year: "2004", imdbID: "tt0338013" },
      { title: "Before Sunrise", year: "1995", imdbID: "tt0112471" },
      { title: "About Time", year: "2013", imdbID: "tt2194499" },
      { title: "The Fault in Our Stars", year: "2014", imdbID: "tt2582846" },
      { title: "Crazy Rich Asians", year: "2018", imdbID: "tt3104988" }
    ]
  }
};

// Special featured sections
const FEATURED_SECTIONS = {
  hangover: {
    title: "The Hangover Trilogy",
    subtitle: "The OG Comedy Series You Love",
    icon: "🍺",
    description: "The legendary trilogy that redefined comedy movies",
    movies: [
      { title: "The Hangover", year: "2009", imdbID: "tt1119646", special: "The Original" },
      { title: "The Hangover Part II", year: "2011", imdbID: "tt1411697", special: "Bangkok Madness" },
      { title: "The Hangover Part III", year: "2013", imdbID: "tt1951261", special: "The Final Chapter" }
    ]
  },
  recent: {
    title: "Recent Blockbusters",
    subtitle: "Latest & Greatest",
    icon: "🎬",
    description: "The hottest movies from recent years",
    movies: [
      { title: "Dune: Part Two", year: "2024", imdbID: "tt14208870" },
      { title: "The Brutalist", year: "2023", imdbID: "tt13238346" },
      { title: "Oppenheimer", year: "2023", imdbID: "tt15398776" },
      { title: "Killers of the Flower Moon", year: "2023", imdbID: "tt10954984" },
      { title: "Barbie", year: "2023", imdbID: "tt1517268" },
      { title: "Top Gun: Maverick", year: "2022", imdbID: "tt1745960" }
    ]
  }
};

export default function RecommendationsPage() {
  const searchParams = useSearchParams();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [movieDetails, setMovieDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showSimilar, setShowSimilar] = useState(false);
  const [apiRecommendations, setApiRecommendations] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  // Get user preferences from URL params
  const genres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
  const years = searchParams.get('years')?.split(',').filter(Boolean) || [];
  const types = searchParams.get('types')?.split(',').filter(Boolean) || [];
  const languages = searchParams.get('languages')?.split(',').filter(Boolean) || [];

  // Handle search functionality
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const { movies: results } = await searchMovies(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle movie selection
  const handleMovieSelect = async (movie) => {
    try {
      const { movie: details } = await getMovieById(movie.imdbID || movie.id);
      setSelectedMovie(details);
      setIsModalOpen(true);
      
      // Fetch similar movies
      try {
        const { similar } = await getSimilarMovies(movie.imdbID || movie.id, 6);
        setSimilarMovies(similar);
        setShowSimilar(true);
      } catch (error) {
        console.error('Error fetching similar movies:', error);
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  // Fetch movie details for curated collections
  const fetchMovieDetails = async (movieList) => {
    setLoading(true);
    const details = {};
    
    for (const movie of movieList) {
      try {
        const { movie: detail } = await getMovieById(movie.imdbID);
        if (detail) {
          details[movie.imdbID] = detail;
        }
      } catch (error) {
        console.error(`Error fetching ${movie.title}:`, error);
      }
    }
    
    setMovieDetails(details);
    setLoading(false);
  };

  // Fetch API recommendations based on genres
  const fetchApiRecommendations = async () => {
    if (genres.length === 0) return;
    
    setApiLoading(true);
    try {
      const typeParam = types.includes('Both')
        ? 'both'
        : (types.includes('Series') && !types.includes('Movie')) ? 'series' : 'movie';
      const languageParam = languages.map(lang => lang.toLowerCase()).join(',');

      // Fetch recommendations for all genres in parallel
      const yearParam = years.length > 0 ? years[0] : '';
      
      const requests = genres.map(genre => {
        const params = new URLSearchParams({
          genre: genre.toLowerCase(),
          ...(yearParam && { year: yearParam }),
          ...(typeParam && { type: typeParam }),
          ...(languageParam && { languages: languageParam }),
          sortBy: sortBy,
        });
        
        return fetch(`/api/recommendations?${params.toString()}`)
          .then(res => res.json())
          .catch(error => {
            console.error(`Error fetching recommendations for ${genre}:`, error);
            return { success: false, results: [] };
          });
      });
      
      // Wait for all requests to complete
      const responses = await Promise.all(requests);
      
      // Combine results and remove duplicates
      const allRecommendations = [];
      const seenIds = new Set();
      
      for (const data of responses) {
        if (data.success && data.results) {
          for (const movie of data.results) {
            if (!seenIds.has(movie.imdbID)) {
              allRecommendations.push(movie);
              seenIds.add(movie.imdbID);
            }
          }
        }
      }
      
      const sortedRecommendations = [...allRecommendations];
      if (sortBy === 'year') {
        sortedRecommendations.sort((a, b) => parseInt(b.year || '0') - parseInt(a.year || '0'));
      } else if (sortBy === 'title') {
        sortedRecommendations.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      }

      setApiRecommendations(sortedRecommendations);
    } catch (error) {
      console.error('Error fetching API recommendations:', error);
      setApiRecommendations([]);
    } finally {
      setApiLoading(false);
    }
  };

  // Load movie details on component mount
  useEffect(() => {
    const allMovies = [
      ...Object.values(CURATED_COLLECTIONS).flatMap(collection => collection.movies),
      ...Object.values(FEATURED_SECTIONS).flatMap(section => section.movies)
    ];
    fetchMovieDetails(allMovies);
    
    // Load trending movies
    const loadTrending = async () => {
      try {
        const { trending } = await getTrendingMovies(8);
        setTrendingMovies(trending);
      } catch (error) {
        console.error('Error fetching trending movies:', error);
      }
    };
    loadTrending();
  }, []);

  // Fetch API recommendations when genres change
  useEffect(() => {
    if (genres.length > 0) {
      fetchApiRecommendations();
    }
  }, [genres, years, sortBy, types, languages]);

  // Filter collections based on user preferences
  const getFilteredCollections = () => {
    if (genres.length === 0) return CURATED_COLLECTIONS;
    
    return Object.entries(CURATED_COLLECTIONS).filter(([key, collection]) => {
      return genres.some(genre => 
        collection.title.toLowerCase().includes(genre.toLowerCase()) ||
        key.toLowerCase().includes(genre.toLowerCase())
      );
    }).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  };

  const filteredCollections = getFilteredCollections();
  const displayMovies = searchQuery ? searchResults : [];
  const showRecommendations = !searchQuery;
  const showSearchResults = searchQuery && searchResults.length > 0;

  return (
    <div className="min-h-screen" style={{ 
      background: 'radial-gradient(1200px 800px at 10% -10%, rgba(17,24,39,0.9), transparent), radial-gradient(1200px 800px at 110% 10%, rgba(17,24,39,0.9), transparent), linear-gradient(180deg, #0a0a0a, #0b0b0b)' 
    }}>
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="blob w-[40rem] h-[40rem] bg-amber-500/10 top-[-8rem] left-[-6rem]" />
        <div className="blob blob-delay-2 w-[35rem] h-[35rem] bg-rose-500/10 bottom-[-10rem] right-[-8rem]" />
        <div className="blob blob-delay-4 w-[30rem] h-[30rem] bg-indigo-500/5 bottom-[30%] left-[15%]" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-100 mb-4">
            MovieKnight Recommendations
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover amazing movies curated just for you based on your preferences
          </p>
          
          {/* User preferences display */}
          {(genres.length > 0 || years.length > 0 || types.length > 0 || languages.length > 0) && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {genres.map(genre => (
                <span key={genre} className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm">
                  {genre}
                </span>
              ))}
              {years.map(year => (
                <span key={year} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  {year}
                </span>
              ))}
              {types.map(type => (
                <span key={type} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                  {type}
                </span>
              ))}
              {languages.map(lang => (
                <span key={lang} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  {lang}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Search Bar and Filters */}
        <div className="mb-12 space-y-4">
          <SearchBar 
            onSearch={handleSearch}
            initialQuery={searchQuery}
          />
          
          {/* Sort Options */}
          {!searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              <button
                onClick={() => setSortBy('relevance')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === 'relevance'
                    ? 'bg-amber-500 text-white'
                    : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                }`}
              >
                Relevance
              </button>
              <button
                onClick={() => setSortBy('year')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === 'year'
                    ? 'bg-amber-500 text-white'
                    : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                }`}
              >
                Latest First
              </button>
              <button
                onClick={() => setSortBy('title')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === 'title'
                    ? 'bg-amber-500 text-white'
                    : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                }`}
              >
                A-Z
              </button>
            </motion.div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading amazing movies...</p>
            </div>
          </div>
        )}

        {/* Search Results */}
        {isSearching && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Searching for movies...</p>
            </div>
          </div>
        )}

        {showSearchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 glass-dark rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-gray-100 mb-6 flex items-center">
              <SearchIcon className="h-8 w-8 text-amber-400 mr-3" />
              Search Results for "{searchQuery}"
            </h2>
            <RecommendationsGrid 
              movies={searchResults} 
              onMovieSelect={handleMovieSelect} 
            />
          </motion.div>
        )}

        {/* API Recommendations Section */}
        {showRecommendations && (genres.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="glass-dark rounded-2xl p-8 border border-amber-500/20">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-100 mb-2">
                  Personalized Recommendations
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Movies based on your selected preferences
                </p>
              </div>
              
              {apiLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading recommendations...</p>
                  </div>
                </div>
              ) : apiRecommendations.length > 0 ? (
                <RecommendationsGrid 
                  movies={apiRecommendations} 
                  onMovieSelect={handleMovieSelect} 
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No recommendations found for your preferences.</p>
                  <p className="text-sm text-gray-500">Try adjusting your filters or check out our curated collections below.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Trending Now Section */}
        {showRecommendations && trendingMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="glass-dark rounded-2xl p-8 border border-rose-500/20">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-rose-400" />
                  <span className="text-4xl">🔥</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-100 mb-2">
                  Trending Now
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  The hottest movies everyone is watching right now
                </p>
              </div>
              
              <RecommendationsGrid 
                movies={trendingMovies} 
                onMovieSelect={handleMovieSelect} 
              />
            </div>
          </motion.div>
        )}

        {/* Featured Hangover Section */}
        {showRecommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="glass-dark rounded-2xl p-8 border border-amber-500/20">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{FEATURED_SECTIONS.hangover.icon}</div>
                <h2 className="text-4xl font-bold text-gray-100 mb-2">
                  {FEATURED_SECTIONS.hangover.title}
                </h2>
                <p className="text-xl text-amber-400 font-semibold mb-2">
                  {FEATURED_SECTIONS.hangover.subtitle}
                </p>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  {FEATURED_SECTIONS.hangover.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FEATURED_SECTIONS.hangover.movies.map((movie, index) => {
                  const details = movieDetails[movie.imdbID];
                  return (
                    <motion.div
                      key={movie.imdbID}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group cursor-pointer"
                      onClick={() => details && handleMovieSelect(details)}
                    >
                      <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-6 border border-amber-500/30 hover:border-amber-400/50 transition-all duration-300 hover:scale-105">
                        <div className="text-center">
                          <div className="text-4xl mb-3">🍺</div>
                          <h3 className="text-xl font-bold text-gray-100 mb-1">
                            {movie.title}
                          </h3>
                          <p className="text-amber-400 font-semibold mb-2">
                            {movie.special}
                          </p>
                          <p className="text-gray-400 mb-3">{movie.year}</p>
                          {details && (
                            <div className="flex items-center justify-center text-amber-400">
                              <StarIcon className="h-4 w-4 mr-1" />
                              <span className="text-sm">{details.imdbRating}/10</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Blockbusters */}
        {showRecommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="glass-dark rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">{FEATURED_SECTIONS.recent.icon}</div>
                <h2 className="text-3xl font-bold text-gray-100 mb-2">
                  {FEATURED_SECTIONS.recent.title}
                </h2>
                <p className="text-xl text-gray-400">
                  {FEATURED_SECTIONS.recent.description}
                </p>
              </div>
              
              <RecommendationsGrid 
                movies={FEATURED_SECTIONS.recent.movies.map(movie => movieDetails[movie.imdbID]).filter(Boolean)} 
                onMovieSelect={handleMovieSelect} 
              />
            </div>
          </motion.div>
        )}

        {/* Genre-based Collections */}
        {showRecommendations && Object.keys(filteredCollections).length > 0 && (
          <div className="space-y-16">
            {Object.entries(filteredCollections).map(([key, collection], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-dark rounded-2xl p-8"
              >
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">{collection.icon}</div>
                  <h2 className="text-3xl font-bold text-gray-100 mb-2">
                    {collection.title}
                  </h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    {collection.description}
                  </p>
                </div>
                
                <RecommendationsGrid 
                  movies={collection.movies.map(movie => movieDetails[movie.imdbID]).filter(Boolean)} 
                  onMovieSelect={handleMovieSelect} 
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {showRecommendations && Object.keys(filteredCollections).length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 glass-dark rounded-2xl"
          >
            <div className="text-6xl mb-6">🎬</div>
            <h3 className="text-2xl font-bold text-gray-100 mb-4">
              No specific recommendations found
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              But don't worry! We've got amazing curated collections for you to explore.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-500 transition-colors"
            >
              Adjust Preferences
            </button>
          </motion.div>
        )}
      </main>

      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setShowSimilar(false);
          setSimilarMovies([]);
        }}
        similarMovies={showSimilar ? similarMovies : []}
        onSimilarMovieSelect={handleMovieSelect}
      />
    </div>
  );
}
