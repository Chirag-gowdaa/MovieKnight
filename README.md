# MovieKnight - Movie Search & Recommendations

MovieKnight is a modern, responsive movie search and recommendation web application built with Next.js, Tailwind CSS, and the OMDb API. Discover new movies, get personalized recommendations, and explore detailed information about your favorite films.

## ✨ Features

### Core Features
- 🎬 **Personalized Recommendations** - Get movie suggestions based on your genre, year, and language preferences
- 🔍 **Advanced Search** - Powerful search functionality with real-time results
- 🎨 **Beautiful UI** - Responsive design with smooth animations and glassmorphism effects
- 📱 **Mobile-First** - Works seamlessly on all devices
- ⚡ **Optimized Performance** - Fast loading with intelligent caching
- 🌓 **Dark Theme** - Modern dark mode with gradient backgrounds

### Recommendation Features (NEW)
- 🔥 **Trending Movies** - Discover what's hot right now
- 🎯 **Similar Movies** - "You Might Also Like" suggestions based on selected movie
- 🎭 **Genre-Based Collections** - Curated collections for Comedy, Action, Drama, Sci-Fi, Horror, and Romance
- 📊 **Smart Filtering** - Filter by genre, year range, movie type, and language
- 🔄 **Multiple Sort Options** - Sort by relevance, latest first, or alphabetically
- 💾 **Smart Caching** - 12-hour cache for recommendations, 6-hour for trending movies

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Heroicons](https://heroicons.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **API**: [OMDb API](http://www.omdbapi.com/)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- OMDb API key (get it from [OMDb API](http://www.omdbapi.com/apikey.aspx))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/movieknight.git
   cd movieknight
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your OMDb API key:
   ```env
   NEXT_PUBLIC_OMDB_API_KEY=your_omdb_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Project Structure

```
├── app/                           # App Router
│   ├── api/
│   │   ├── recommendations/       # Recommendations API (NEW: enhanced with filtering & sorting)
│   │   ├── similar/               # Similar movies API (NEW)
│   │   ├── trending/              # Trending movies API (NEW)
│   │   ├── search/                # Search API
│   │   └── movies/                # Movie details API
│   ├── globals.css                # Global styles
│   ├── layout.js                  # Root layout
│   ├── page.jsx                   # Home page with preference wizard
│   ├── recommendations/           # Recommendations page (ENHANCED)
│   └── search/                    # Search results page
├── components/                    # Reusable components
│   ├── MovieCard.jsx              # Movie card component
│   ├── MovieModal.jsx             # Movie details modal (ENHANCED: with similar movies)
│   ├── Navbar.jsx                 # Navigation bar
│   ├── RecommendationsGrid.jsx    # Grid layout for movies
│   └── SearchBar.jsx              # Search input component
├── hooks/                         # Custom React hooks
│   ├── useMovieRecommendations.js # Recommendations hook
│   └── ...other hooks
├── lib/                           # Utility functions
│   ├── api.js                     # API client (ENHANCED: new functions)
│   ├── api-client.js              # Client-side API wrapper
│   └── error-handler.js           # Error handling
├── public/                        # Static files
│   └── no-poster.png              # Default poster image
├── config.js                      # App configuration
└── package.json                   # Project dependencies
```

## Environment Variables

To run this project, you need to set the following environment variables in your `.env.local` file:

- `NEXT_PUBLIC_OMDB_API_KEY`: Your OMDb API key (get it from [OMDb API](http://www.omdbapi.com/apikey.aspx))

## API Documentation

### New Recommendation APIs

#### 1. Enhanced Recommendations API
**Endpoint:** `GET /api/recommendations`

**Parameters:**
- `genre` (required) - Movie genre (e.g., "action", "comedy", "drama")
- `year` (optional) - Year or year range (e.g., "2020" or "2020-2024")
- `page` (optional) - Page number for pagination (default: 1)
- `sortBy` (optional) - Sort order: "relevance", "year", or "title" (default: "relevance")

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "tt0468569",
      "imdbID": "tt0468569",
      "title": "The Dark Knight",
      "year": "2008",
      "type": "movie",
      "poster": "https://..."
    }
  ],
  "totalResults": 150,
  "page": 1,
  "hasMore": true,
  "genre": "action",
  "yearRange": "2020-2024",
  "sortBy": "relevance"
}
```

#### 2. Similar Movies API (NEW)
**Endpoint:** `GET /api/similar`

**Parameters:**
- `id` (required) - IMDb movie ID
- `limit` (optional) - Number of similar movies to return (1-50, default: 10)

**Response:**
```json
{
  "success": true,
  "similar": [
    {
      "id": "tt1392190",
      "imdbID": "tt1392190",
      "title": "Mad Max: Fury Road",
      "year": "2015",
      "type": "movie",
      "poster": "https://..."
    }
  ],
  "originalMovie": {
    "id": "tt0468569",
    "title": "The Dark Knight",
    "genres": ["Action", "Crime", "Drama"]
  },
  "count": 8
}
```

#### 3. Trending Movies API (NEW)
**Endpoint:** `GET /api/trending`

**Parameters:**
- `limit` (optional) - Number of trending movies to return (1-50, default: 10)

**Response:**
```json
{
  "success": true,
  "trending": [
    {
      "id": "tt15398776",
      "imdbID": "tt15398776",
      "title": "Oppenheimer",
      "year": "2023",
      "type": "movie",
      "poster": "https://..."
    }
  ],
  "count": 8,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### Caching Strategy
- **Recommendations**: 12-hour cache TTL
- **Trending Movies**: 6-hour cache TTL
- **Similar Movies**: 12-hour cache TTL
- Automatic cache cleanup for expired entries

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Usage Guide

### Getting Recommendations
1. **Start on Home Page**: Answer 4 simple questions about your preferences:
   - Select up to 3 favorite genres
   - Choose preferred decades or custom year range
   - Pick movie or series preference
   - Select preferred languages

2. **View Recommendations**: Get personalized suggestions with:
   - Trending movies section
   - Genre-based curated collections
   - Featured movie collections (The Hangover trilogy, Recent blockbusters)

3. **Explore Similar Movies**: Click on any movie to:
   - View detailed information
   - See ratings and cast
   - Discover similar movies in the "You Might Also Like" section

### Sorting & Filtering
- **Sort Options**: Relevance, Latest First, or A-Z
- **Search**: Use the search bar to find specific movies
- **Filters**: Results automatically filter by your selected preferences

## Recent Improvements (Interview Ready)

### ✅ Enhanced Recommendation System
- **Smart Filtering**: Filter recommendations by year range (e.g., 2020-2024)
- **Multiple Sort Options**: Sort by relevance, latest year, or alphabetically
- **Better Caching**: Intelligent 12-hour cache for recommendations

### ✅ New Similar Movies Feature
- **"You Might Also Like"**: Discover similar movies based on genre
- **Modal Integration**: View similar movies directly in the movie details modal
- **Smart Suggestions**: Automatically fetches and displays 6 similar movies

### ✅ Trending Movies Section
- **Real-time Trending**: Displays currently popular movies
- **6-hour Cache**: Fresh trending data with smart caching
- **Featured Section**: Prominent placement on recommendations page

### ✅ Improved UI/UX
- **Sort Buttons**: Easy-to-use sorting controls
- **Better Organization**: Trending section before curated collections
- **Enhanced Modal**: Similar movies section in movie details
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop

### ✅ Code Quality
- **Error Handling**: Comprehensive error handling for all APIs
- **Input Validation**: Strict validation for all parameters
- **Performance**: Optimized caching and API calls
- **Documentation**: Well-documented API endpoints and functions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
