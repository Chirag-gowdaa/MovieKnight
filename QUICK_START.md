# MovieKnight - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### 1. Prerequisites
- Node.js 18+ installed
- OMDb API key (free from [omdbapi.com](http://www.omdbapi.com/apikey.aspx))

### 2. Setup
```bash
# Navigate to project
cd movie

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_OMDB_API_KEY=your_api_key_here" > .env.local

# Start development server
npm run dev
```

### 3. Open in Browser
Visit: `http://localhost:3000`

---

## 📱 How to Use

### Step 1: Set Your Preferences
1. Select up to 3 favorite genres
2. Choose preferred decades or custom year range
3. Pick movie or series preference
4. Select preferred languages
5. Click "Find My Movies"

### Step 2: Explore Recommendations
- **Trending Now**: See what's hot right now
- **Genre Collections**: Browse curated collections
- **Sort Results**: Use Relevance, Latest First, or A-Z buttons
- **Search**: Use the search bar to find specific movies

### Step 3: Discover Similar Movies
1. Click on any movie card
2. View movie details in the modal
3. Scroll down to "You Might Also Like"
4. Click similar movies to explore more

---

## 🎯 Key Features

| Feature | Location | How to Use |
|---------|----------|-----------|
| Trending Movies | Recommendations page | Auto-loads on page load |
| Similar Movies | Movie modal | Click any movie to see |
| Sort Options | Recommendations page | Click sort buttons |
| Search | Top of recommendations page | Type movie name |
| Filters | Home page | Select preferences |

---

## 🔧 Development

### Available Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

### Project Structure
```
movie/
├── app/
│   ├── api/              # API routes
│   ├── recommendations/  # Recommendations page
│   └── page.jsx          # Home page
├── components/           # React components
├── lib/                  # Utilities
├── hooks/                # Custom hooks
└── public/               # Static files
```

---

## 📚 API Endpoints

### Recommendations
```
GET /api/recommendations?genre=action&year=2020-2024&sortBy=year
```

### Similar Movies
```
GET /api/similar?id=tt0468569&limit=6
```

### Trending Movies
```
GET /api/trending?limit=8
```

---

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.js` and update color values

### Add More Genres
Edit `app/page.jsx` and add to `genres` array

### Modify Trending Keywords
Edit `app/api/trending/route.js` and update `TRENDING_KEYWORDS`

### Adjust Cache TTL
Edit API route files and change `CACHE_TTL` value

---

## 🐛 Troubleshooting

### "API key not found" error
- Make sure `.env.local` file exists
- Check API key is correct
- Restart development server

### Movies not loading
- Check internet connection
- Verify OMDb API key is valid
- Check browser console for errors

### Slow performance
- Clear browser cache
- Restart development server
- Check network tab in DevTools

---

## 📊 Performance Tips

1. **Caching**: Results are cached for 12 hours
2. **Pagination**: Load more results as needed
3. **Search**: Use specific keywords for faster results
4. **Sorting**: Pre-sorted results load faster

---

## 🎓 Interview Preparation

### Key Points to Mention
1. **Full-Stack**: Built with Next.js (frontend + backend)
2. **Performance**: Implemented smart caching strategy
3. **UX**: Trending movies and similar suggestions
4. **Quality**: Error handling, validation, documentation
5. **Scalability**: Modular design, easy to extend

### Demo Flow
1. Show home page with preference wizard
2. Select preferences and go to recommendations
3. Show trending movies section
4. Click a movie to show similar movies
5. Demonstrate sorting options
6. Show search functionality

---

## 📝 Documentation Files

- **README.md** - Full project documentation
- **IMPROVEMENTS.md** - Detailed improvement guide
- **QUICK_START.md** - This file

---

## ✅ Pre-Interview Checklist

- [ ] API key configured in `.env.local`
- [ ] Development server running (`npm run dev`)
- [ ] App loads at `http://localhost:3000`
- [ ] Can select preferences on home page
- [ ] Recommendations page shows trending movies
- [ ] Can click movies to see similar suggestions
- [ ] Sort buttons work correctly
- [ ] Search functionality works
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop

---

## 🚀 Ready to Deploy

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 📞 Support

For issues or questions:
1. Check the README.md
2. Review IMPROVEMENTS.md for technical details
3. Check console for error messages
4. Verify API key is correct

---

**Status**: ✅ Ready for Interview

Your MovieKnight application is now fully set up with all recommendation and suggestion features!
