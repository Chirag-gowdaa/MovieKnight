# MovieKnight - Movie Search & Recommendations

MovieKnight is a modern, responsive movie search and recommendation web application built with Next.js, Tailwind CSS, and the OMDb API. Discover new movies, get personalized recommendations, and explore detailed information about your favorite films.

## Link - https://movie-knight-eta.vercel.app/

## Features

- 🎬 Personalized movie recommendations based on your preferences
- 🔍 Powerful search functionality with real-time results
- 🎨 Beautiful, responsive UI with smooth animations
- 📱 Mobile-first design that works on all devices
- ⚡ Fast and optimized performance
- 🌓 Light and dark mode support

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
├── app/                    # App Router
│   ├── api/                # API routes
│   ├── globals.css         # Global styles
│   ├── layout.js           # Root layout
│   ├── page.jsx            # Home page
│   ├── recommendations/    # Recommendations page
│   └── search/             # Search results page
├── components/             # Reusable components
│   ├── MovieCard.jsx       # Movie card component
│   ├── MovieModal.jsx      # Movie details modal
│   ├── Navbar.jsx          # Navigation bar
│   ├── RecommendationsGrid.jsx # Grid layout for movies
│   └── SearchBar.jsx       # Search input component
├── lib/                    # Utility functions
│   └── api.js              # API client
├── public/                 # Static files
│   └── no-poster.png       # Default poster image
├── config.js               # App configuration
└── package.json            # Project dependencies
```

## Environment Variables

To run this project, you need to set the following environment variables in your `.env.local` file:

- `NEXT_PUBLIC_OMDB_API_KEY`: Your OMDb API key (get it from [OMDb API](http://www.omdbapi.com/apikey.aspx))

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

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
