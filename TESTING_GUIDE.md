# Testing Guide - Personalized Recommendations Feature

## Quick Start Testing

### 1. Start the Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

### 2. Test the Recommendation Flow

#### Step 1: Home Page Preferences
1. Navigate to `http://localhost:3000`
2. Select 2-3 genres (e.g., Action, Comedy, Drama)
3. Select a year range (e.g., 2020s)
4. Select content type (Movie, Series, or Both)
5. Select 1-2 languages
6. Click "Find My Movies"

#### Step 2: Recommendations Page
1. Page should load quickly (1-2 seconds)
2. You should see:
   - **Personalized Recommendations** section with movies matching your genres
   - **Trending Now** section with popular movies
   - **The Hangover Trilogy** special section
   - **Recent Blockbusters** section
   - Genre-based curated collections

### 3. Verify Performance

#### Check Loading Time
- Open browser DevTools (F12)
- Go to Network tab
- Refresh the page
- Look for `/api/recommendations?` requests
- Each request should complete in 1-2 seconds
- All requests should complete in parallel (not sequential)

#### Check Console for Errors
- Open browser DevTools (F12)
- Go to Console tab
- Should see no red error messages
- May see info/debug logs about fetching recommendations

### 4. Test Error Scenarios

#### Scenario A: No Results for Genre
1. Select an obscure genre combination
2. Recommendations should either show results or display:
   "No recommendations found for your preferences"
3. Other sections (Trending, Curated Collections) should still display

#### Scenario B: Slow Network
1. Open DevTools Network tab
2. Set throttling to "Slow 3G"
3. Navigate through recommendations
4. Should see loading spinner
5. Results should eventually load (may take longer)
6. Should not timeout or show errors

#### Scenario C: API Timeout
1. The app has an 8-second timeout per API request
2. If OMDb API is slow, requests will timeout gracefully
3. Should show empty results instead of error
4. Other sections should still work

### 5. Test Movie Interactions

#### Click on a Movie
1. Click any movie card
2. Movie modal should open with details
3. Should show similar movies section
4. Can click similar movies to view them

#### Search Functionality
1. Use the search bar on recommendations page
2. Type a movie title
3. Should show search results
4. Can click to view movie details

### 6. Test Sorting Options

1. On recommendations page, you should see sort buttons:
   - **Relevance** (default)
   - **Latest First** (by year)
   - **A-Z** (alphabetical)
2. Click each to verify sorting works
3. Results should reorder accordingly

## Expected Results

### Success Indicators
✅ Recommendations load within 1-2 seconds
✅ Multiple genres show combined results
✅ No duplicate movies in results
✅ Year filtering works correctly
✅ Fallback sections (Trending, Collections) always display
✅ No JavaScript errors in console
✅ Movie modals open and display correctly
✅ Search functionality works
✅ Sorting options work

### Performance Metrics
- Initial page load: < 2 seconds
- API response time: < 1 second per request
- All genre requests: Parallel (not sequential)
- Timeout handling: 8 seconds per request

## Troubleshooting

### Issue: "Loading recommendations..." stays forever
**Solution**: 
- Check browser console for errors
- Verify OMDb API key is set in `.env.local`
- Check network tab to see if API requests are failing
- Try refreshing the page

### Issue: No recommendations showing
**Solution**:
- This is normal if the genre combination has no results
- Check the "No recommendations found" message
- Curated collections should still display
- Try different genre combinations

### Issue: Movies not loading in curated sections
**Solution**:
- Some movies might not be available in OMDb API
- This is expected - the app gracefully handles missing movies
- Other movies in the collection should still display

### Issue: Slow loading on first visit
**Solution**:
- First requests to OMDb API might be slower
- Subsequent requests are cached
- Try refreshing - should be faster
- Check your internet connection speed

## API Endpoints Being Called

When you select preferences and navigate to recommendations, these endpoints are called:

1. **GET `/api/recommendations?genre=action&year=2020-2024&sortBy=relevance`**
   - Called for each selected genre
   - All calls happen in parallel
   - Returns movies matching the genre and year range

2. **GET `/api/movies/[id]`**
   - Called to fetch full movie details
   - Used for curated collections and search results

3. **GET `/api/trending`**
   - Called to fetch trending movies
   - Cached for performance

4. **GET `/api/similar?id=[movieId]`**
   - Called when you click on a movie
   - Finds similar movies based on genre

## Browser Compatibility

Tested and working on:
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- The app uses OMDb API which has rate limits
- Responses are cached to reduce API calls
- Genre searches use keyword matching (not direct genre filtering)
- Some movies might not have posters and are filtered out
