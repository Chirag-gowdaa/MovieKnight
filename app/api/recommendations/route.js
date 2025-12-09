import { NextResponse } from 'next/server';
import { handleApiError, BadRequestError } from '@/lib/error-handler';

// Cache configuration
const CACHE_TTL = 60 * 60 * 12; // 12 hours in seconds
const cache = new Map();
const API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;

// Timeout for API requests (in milliseconds)
const API_TIMEOUT = 8000;

// Common movie genres for validation
const VALID_GENRES = [
  'action', 'adventure', 'animation', 'biography', 'comedy', 'crime', 'documentary',
  'drama', 'family', 'fantasy', 'film-noir', 'history', 'horror', 'music', 'musical',
  'mystery', 'romance', 'sci-fi', 'sport', 'thriller', 'war', 'western'
];

const VALID_TYPES = ['movie', 'series', 'episode', 'both'];

// Local static fallback movies (20 titles) used when OMDb is unavailable or empty
const LOCAL_FALLBACK_MOVIES = {
  action: [
    { title: 'The Dark Knight', year: '2008', imdbID: 'local-action-1', type: 'movie' },
    { title: 'Mad Max: Fury Road', year: '2015', imdbID: 'local-action-2', type: 'movie' },
    { title: 'John Wick', year: '2014', imdbID: 'local-action-3', type: 'movie' },
    { title: 'Mission: Impossible - Fallout', year: '2018', imdbID: 'local-action-4', type: 'movie' },
    { title: 'Gladiator', year: '2000', imdbID: 'local-action-5', type: 'movie' },
    { title: 'Die Hard', year: '1988', imdbID: 'local-action-6', type: 'movie' },
    { title: 'The Raid', year: '2011', imdbID: 'local-action-7', type: 'movie' },
    { title: 'The Bourne Ultimatum', year: '2007', imdbID: 'local-action-8', type: 'movie' },
    { title: 'Casino Royale', year: '2006', imdbID: 'local-action-9', type: 'movie' },
    { title: 'The Matrix', year: '1999', imdbID: 'local-action-10', type: 'movie' },
    { title: 'Inception', year: '2010', imdbID: 'local-action-11', type: 'movie' },
    { title: 'Top Gun: Maverick', year: '2022', imdbID: 'local-action-12', type: 'movie' },
    { title: 'Black Panther', year: '2018', imdbID: 'local-action-13', type: 'movie' },
    { title: 'Spider-Man: Into the Spider-Verse', year: '2018', imdbID: 'local-action-14', type: 'movie' },
    { title: 'Edge of Tomorrow', year: '2014', imdbID: 'local-action-15', type: 'movie' },
    { title: 'The Avengers', year: '2012', imdbID: 'local-action-16', type: 'movie' },
    { title: 'The Terminator', year: '1984', imdbID: 'local-action-17', type: 'movie' },
    { title: 'Terminator 2: Judgment Day', year: '1991', imdbID: 'local-action-18', type: 'movie' },
    { title: 'Oldboy', year: '2003', imdbID: 'local-action-19', type: 'movie' },
    { title: 'Heat', year: '1995', imdbID: 'local-action-20', type: 'movie' },
  ],
  comedy: [
    { title: 'Superbad', year: '2007', imdbID: 'local-comedy-1', type: 'movie' },
    { title: 'The Hangover', year: '2009', imdbID: 'local-comedy-2', type: 'movie' },
    { title: 'Step Brothers', year: '2008', imdbID: 'local-comedy-3', type: 'movie' },
    { title: 'Bridesmaids', year: '2011', imdbID: 'local-comedy-4', type: 'movie' },
    { title: 'Anchorman', year: '2004', imdbID: 'local-comedy-5', type: 'movie' },
    { title: 'Napoleon Dynamite', year: '2004', imdbID: 'local-comedy-6', type: 'movie' },
    { title: 'The Grand Budapest Hotel', year: '2014', imdbID: 'local-comedy-7', type: 'movie' },
    { title: 'The Nice Guys', year: '2016', imdbID: 'local-comedy-8', type: 'movie' },
    { title: '21 Jump Street', year: '2012', imdbID: 'local-comedy-9', type: 'movie' },
    { title: 'Crazy Rich Asians', year: '2018', imdbID: 'local-comedy-10', type: 'movie' },
    { title: 'Groundhog Day', year: '1993', imdbID: 'local-comedy-11', type: 'movie' },
    { title: 'The Big Lebowski', year: '1998', imdbID: 'local-comedy-12', type: 'movie' },
    { title: 'Mean Girls', year: '2004', imdbID: 'local-comedy-13', type: 'movie' },
    { title: 'Shaun of the Dead', year: '2004', imdbID: 'local-comedy-14', type: 'movie' },
    { title: 'Hot Fuzz', year: '2007', imdbID: 'local-comedy-15', type: 'movie' },
    { title: 'Monty Python and the Holy Grail', year: '1975', imdbID: 'local-comedy-16', type: 'movie' },
    { title: 'Dr. Strangelove', year: '1964', imdbID: 'local-comedy-17', type: 'movie' },
    { title: 'Borat', year: '2006', imdbID: 'local-comedy-18', type: 'movie' },
    { title: 'This Is Spinal Tap', year: '1984', imdbID: 'local-comedy-19', type: 'movie' },
    { title: 'The 40-Year-Old Virgin', year: '2005', imdbID: 'local-comedy-20', type: 'movie' },
  ],
  animation: [
    { title: 'Spider-Man: Into the Spider-Verse', year: '2018', imdbID: 'local-anim-1', type: 'movie' },
    { title: 'Toy Story', year: '1995', imdbID: 'local-anim-2', type: 'movie' },
    { title: 'Toy Story 3', year: '2010', imdbID: 'local-anim-3', type: 'movie' },
    { title: 'Up', year: '2009', imdbID: 'local-anim-4', type: 'movie' },
    { title: 'Inside Out', year: '2015', imdbID: 'local-anim-5', type: 'movie' },
    { title: 'Finding Nemo', year: '2003', imdbID: 'local-anim-6', type: 'movie' },
    { title: 'The Incredibles', year: '2004', imdbID: 'local-anim-7', type: 'movie' },
    { title: 'Coco', year: '2017', imdbID: 'local-anim-8', type: 'movie' },
    { title: 'Ratatouille', year: '2007', imdbID: 'local-anim-9', type: 'movie' },
    { title: 'How to Train Your Dragon', year: '2010', imdbID: 'local-anim-10', type: 'movie' },
    { title: 'Zootopia', year: '2016', imdbID: 'local-anim-11', type: 'movie' },
    { title: 'WALL·E', year: '2008', imdbID: 'local-anim-12', type: 'movie' },
    { title: 'Spirited Away', year: '2001', imdbID: 'local-anim-13', type: 'movie' },
    { title: 'My Neighbor Totoro', year: '1988', imdbID: 'local-anim-14', type: 'movie' },
    { title: 'Princess Mononoke', year: '1997', imdbID: 'local-anim-15', type: 'movie' },
    { title: 'Klaus', year: '2019', imdbID: 'local-anim-16', type: 'movie' },
    { title: 'The Lion King', year: '1994', imdbID: 'local-anim-17', type: 'movie' },
    { title: 'Shrek', year: '2001', imdbID: 'local-anim-18', type: 'movie' },
    { title: 'The Iron Giant', year: '1999', imdbID: 'local-anim-19', type: 'movie' },
    { title: 'Big Hero 6', year: '2014', imdbID: 'local-anim-20', type: 'movie' },
  ],
  drama: [
    { title: 'The Shawshank Redemption', year: '1994', imdbID: 'local-drama-1', type: 'movie' },
    { title: 'Forrest Gump', year: '1994', imdbID: 'local-drama-2', type: 'movie' },
    { title: 'The Godfather', year: '1972', imdbID: 'local-drama-3', type: 'movie' },
    { title: 'The Godfather Part II', year: '1974', imdbID: 'local-drama-4', type: 'movie' },
    { title: 'Fight Club', year: '1999', imdbID: 'local-drama-5', type: 'movie' },
    { title: 'Pulp Fiction', year: '1994', imdbID: 'local-drama-6', type: 'movie' },
    { title: 'The Social Network', year: '2010', imdbID: 'local-drama-7', type: 'movie' },
    { title: 'Parasite', year: '2019', imdbID: 'local-drama-8', type: 'movie' },
    { title: 'Whiplash', year: '2014', imdbID: 'local-drama-9', type: 'movie' },
    { title: 'La La Land', year: '2016', imdbID: 'local-drama-10', type: 'movie' },
    { title: 'There Will Be Blood', year: '2007', imdbID: 'local-drama-11', type: 'movie' },
    { title: 'No Country for Old Men', year: '2007', imdbID: 'local-drama-12', type: 'movie' },
    { title: 'The Green Mile', year: '1999', imdbID: 'local-drama-13', type: 'movie' },
    { title: 'Good Will Hunting', year: '1997', imdbID: 'local-drama-14', type: 'movie' },
    { title: 'The Pursuit of Happyness', year: '2006', imdbID: 'local-drama-15', type: 'movie' },
    { title: 'A Beautiful Mind', year: '2001', imdbID: 'local-drama-16', type: 'movie' },
    { title: 'The Departed', year: '2006', imdbID: 'local-drama-17', type: 'movie' },
    { title: 'American Beauty', year: '1999', imdbID: 'local-drama-18', type: 'movie' },
    { title: 'City of God', year: '2002', imdbID: 'local-drama-19', type: 'movie' },
    { title: 'Million Dollar Baby', year: '2004', imdbID: 'local-drama-20', type: 'movie' },
  ],
  'sci-fi': [
    { title: 'Inception', year: '2010', imdbID: 'local-scifi-1', type: 'movie' },
    { title: 'Interstellar', year: '2014', imdbID: 'local-scifi-2', type: 'movie' },
    { title: 'The Matrix', year: '1999', imdbID: 'local-scifi-3', type: 'movie' },
    { title: 'Blade Runner 2049', year: '2017', imdbID: 'local-scifi-4', type: 'movie' },
    { title: 'Arrival', year: '2016', imdbID: 'local-scifi-5', type: 'movie' },
    { title: 'Ex Machina', year: '2014', imdbID: 'local-scifi-6', type: 'movie' },
    { title: 'Dune', year: '2021', imdbID: 'local-scifi-7', type: 'movie' },
    { title: 'Dune: Part Two', year: '2024', imdbID: 'local-scifi-8', type: 'movie' },
    { title: 'Her', year: '2013', imdbID: 'local-scifi-9', type: 'movie' },
    { title: 'The Martian', year: '2015', imdbID: 'local-scifi-10', type: 'movie' },
    { title: 'Gravity', year: '2013', imdbID: 'local-scifi-11', type: 'movie' },
    { title: 'Minority Report', year: '2002', imdbID: 'local-scifi-12', type: 'movie' },
    { title: 'Looper', year: '2012', imdbID: 'local-scifi-13', type: 'movie' },
    { title: 'Edge of Tomorrow', year: '2014', imdbID: 'local-scifi-14', type: 'movie' },
    { title: 'District 9', year: '2009', imdbID: 'local-scifi-15', type: 'movie' },
    { title: 'Children of Men', year: '2006', imdbID: 'local-scifi-16', type: 'movie' },
    { title: 'Eternal Sunshine of the Spotless Mind', year: '2004', imdbID: 'local-scifi-17', type: 'movie' },
    { title: 'Star Trek', year: '2009', imdbID: 'local-scifi-18', type: 'movie' },
    { title: 'The Prestige', year: '2006', imdbID: 'local-scifi-19', type: 'movie' },
    { title: 'Tenet', year: '2020', imdbID: 'local-scifi-20', type: 'movie' },
  ],
  romance: [
    { title: 'Before Sunrise', year: '1995', imdbID: 'local-romance-1', type: 'movie' },
    { title: 'Before Sunset', year: '2004', imdbID: 'local-romance-2', type: 'movie' },
    { title: 'Before Midnight', year: '2013', imdbID: 'local-romance-3', type: 'movie' },
    { title: 'La La Land', year: '2016', imdbID: 'local-romance-4', type: 'movie' },
    { title: 'The Notebook', year: '2004', imdbID: 'local-romance-5', type: 'movie' },
    { title: 'Pride & Prejudice', year: '2005', imdbID: 'local-romance-6', type: 'movie' },
    { title: '500 Days of Summer', year: '2009', imdbID: 'local-romance-7', type: 'movie' },
    { title: 'Eternal Sunshine of the Spotless Mind', year: '2004', imdbID: 'local-romance-8', type: 'movie' },
    { title: 'About Time', year: '2013', imdbID: 'local-romance-9', type: 'movie' },
    { title: 'Crazy Rich Asians', year: '2018', imdbID: 'local-romance-10', type: 'movie' },
    { title: 'A Star Is Born', year: '2018', imdbID: 'local-romance-11', type: 'movie' },
    { title: 'Notting Hill', year: '1999', imdbID: 'local-romance-12', type: 'movie' },
    { title: 'Silver Linings Playbook', year: '2012', imdbID: 'local-romance-13', type: 'movie' },
    { title: 'Titanic', year: '1997', imdbID: 'local-romance-14', type: 'movie' },
    { title: 'Her', year: '2013', imdbID: 'local-romance-15', type: 'movie' },
    { title: 'Call Me by Your Name', year: '2017', imdbID: 'local-romance-16', type: 'movie' },
    { title: 'The Fault in Our Stars', year: '2014', imdbID: 'local-romance-17', type: 'movie' },
    { title: 'Brooklyn', year: '2015', imdbID: 'local-romance-18', type: 'movie' },
    { title: 'Carol', year: '2015', imdbID: 'local-romance-19', type: 'movie' },
    { title: 'Whisper of the Heart', year: '1995', imdbID: 'local-romance-20', type: 'movie' },
  ],
  horror: [
    { title: 'Get Out', year: '2017', imdbID: 'local-horror-1', type: 'movie' },
    { title: 'A Quiet Place', year: '2018', imdbID: 'local-horror-2', type: 'movie' },
    { title: 'Hereditary', year: '2018', imdbID: 'local-horror-3', type: 'movie' },
    { title: 'The Conjuring', year: '2013', imdbID: 'local-horror-4', type: 'movie' },
    { title: 'It Follows', year: '2014', imdbID: 'local-horror-5', type: 'movie' },
    { title: 'The Babadook', year: '2014', imdbID: 'local-horror-6', type: 'movie' },
    { title: 'Sinister', year: '2012', imdbID: 'local-horror-7', type: 'movie' },
    { title: 'The Witch', year: '2015', imdbID: 'local-horror-8', type: 'movie' },
    { title: 'The Shining', year: '1980', imdbID: 'local-horror-9', type: 'movie' },
    { title: 'Halloween', year: '1978', imdbID: 'local-horror-10', type: 'movie' },
    { title: 'Alien', year: '1979', imdbID: 'local-horror-11', type: 'movie' },
    { title: 'Aliens', year: '1986', imdbID: 'local-horror-12', type: 'movie' },
    { title: 'The Ring', year: '2002', imdbID: 'local-horror-13', type: 'movie' },
    { title: 'The Exorcist', year: '1973', imdbID: 'local-horror-14', type: 'movie' },
    { title: 'Scream', year: '1996', imdbID: 'local-horror-15', type: 'movie' },
    { title: 'Train to Busan', year: '2016', imdbID: 'local-horror-16', type: 'movie' },
    { title: 'The Thing', year: '1982', imdbID: 'local-horror-17', type: 'movie' },
    { title: 'Midsommar', year: '2019', imdbID: 'local-horror-18', type: 'movie' },
    { title: 'The Cabin in the Woods', year: '2011', imdbID: 'local-horror-19', type: 'movie' },
    { title: 'The Others', year: '2001', imdbID: 'local-horror-20', type: 'movie' },
  ],
  crime: [
    { title: 'The Godfather', year: '1972', imdbID: 'local-crime-1', type: 'movie' },
    { title: 'The Godfather Part II', year: '1974', imdbID: 'local-crime-2', type: 'movie' },
    { title: 'The Dark Knight', year: '2008', imdbID: 'local-crime-3', type: 'movie' },
    { title: 'Pulp Fiction', year: '1994', imdbID: 'local-crime-4', type: 'movie' },
    { title: 'Goodfellas', year: '1990', imdbID: 'local-crime-5', type: 'movie' },
    { title: 'Heat', year: '1995', imdbID: 'local-crime-6', type: 'movie' },
    { title: 'The Departed', year: '2006', imdbID: 'local-crime-7', type: 'movie' },
    { title: 'City of God', year: '2002', imdbID: 'local-crime-8', type: 'movie' },
    { title: 'Se7en', year: '1995', imdbID: 'local-crime-9', type: 'movie' },
    { title: 'Zodiac', year: '2007', imdbID: 'local-crime-10', type: 'movie' },
    { title: 'No Country for Old Men', year: '2007', imdbID: 'local-crime-11', type: 'movie' },
    { title: 'The Usual Suspects', year: '1995', imdbID: 'local-crime-12', type: 'movie' },
    { title: 'Reservoir Dogs', year: '1992', imdbID: 'local-crime-13', type: 'movie' },
    { title: 'The Irishman', year: '2019', imdbID: 'local-crime-14', type: 'movie' },
    { title: 'Scarface', year: '1983', imdbID: 'local-crime-15', type: 'movie' },
    { title: 'The Untouchables', year: '1987', imdbID: 'local-crime-16', type: 'movie' },
    { title: 'American Gangster', year: '2007', imdbID: 'local-crime-17', type: 'movie' },
    { title: 'L.A. Confidential', year: '1997', imdbID: 'local-crime-18', type: 'movie' },
    { title: 'Prisoners', year: '2013', imdbID: 'local-crime-19', type: 'movie' },
    { title: 'Sicario', year: '2015', imdbID: 'local-crime-20', type: 'movie' },
  ],
  adventure: [
    { title: 'Interstellar', year: '2014', imdbID: 'local-adv-1', type: 'movie' },
    { title: 'The Lord of the Rings: The Fellowship of the Ring', year: '2001', imdbID: 'local-adv-2', type: 'movie' },
    { title: 'The Lord of the Rings: The Two Towers', year: '2002', imdbID: 'local-adv-3', type: 'movie' },
    { title: 'The Lord of the Rings: The Return of the King', year: '2003', imdbID: 'local-adv-4', type: 'movie' },
    { title: 'Dune', year: '2021', imdbID: 'local-adv-5', type: 'movie' },
    { title: 'Dune: Part Two', year: '2024', imdbID: 'local-adv-6', type: 'movie' },
    { title: 'The Martian', year: '2015', imdbID: 'local-adv-7', type: 'movie' },
    { title: 'Gravity', year: '2013', imdbID: 'local-adv-8', type: 'movie' },
    { title: 'Edge of Tomorrow', year: '2014', imdbID: 'local-adv-9', type: 'movie' },
    { title: 'Avatar', year: '2009', imdbID: 'local-adv-10', type: 'movie' },
    { title: 'Jurassic Park', year: '1993', imdbID: 'local-adv-11', type: 'movie' },
    { title: 'Guardians of the Galaxy', year: '2014', imdbID: 'local-adv-12', type: 'movie' },
    { title: 'Pirates of the Caribbean: The Curse of the Black Pearl', year: '2003', imdbID: 'local-adv-13', type: 'movie' },
    { title: 'Indiana Jones and the Raiders of the Lost Ark', year: '1981', imdbID: 'local-adv-14', type: 'movie' },
    { title: 'Indiana Jones and the Last Crusade', year: '1989', imdbID: 'local-adv-15', type: 'movie' },
    { title: 'Life of Pi', year: '2012', imdbID: 'local-adv-16', type: 'movie' },
    { title: 'Cast Away', year: '2000', imdbID: 'local-adv-17', type: 'movie' },
    { title: 'The Revenant', year: '2015', imdbID: 'local-adv-18', type: 'movie' },
    { title: 'The Secret Life of Walter Mitty', year: '2013', imdbID: 'local-adv-19', type: 'movie' },
    { title: 'How to Train Your Dragon', year: '2010', imdbID: 'local-adv-20', type: 'movie' },
  ],
  fantasy: [
    { title: 'The Lord of the Rings: The Fellowship of the Ring', year: '2001', imdbID: 'local-fantasy-1', type: 'movie' },
    { title: 'The Lord of the Rings: The Two Towers', year: '2002', imdbID: 'local-fantasy-2', type: 'movie' },
    { title: 'The Lord of the Rings: The Return of the King', year: '2003', imdbID: 'local-fantasy-3', type: 'movie' },
    { title: 'Harry Potter and the Prisoner of Azkaban', year: '2004', imdbID: 'local-fantasy-4', type: 'movie' },
    { title: 'Harry Potter and the Deathly Hallows: Part 2', year: '2011', imdbID: 'local-fantasy-5', type: 'movie' },
    { title: 'Pan\'s Labyrinth', year: '2006', imdbID: 'local-fantasy-6', type: 'movie' },
    { title: 'Spirited Away', year: '2001', imdbID: 'local-fantasy-7', type: 'movie' },
    { title: 'Princess Mononoke', year: '1997', imdbID: 'local-fantasy-8', type: 'movie' },
    { title: 'Howl\'s Moving Castle', year: '2004', imdbID: 'local-fantasy-9', type: 'movie' },
    { title: 'Big Fish', year: '2003', imdbID: 'local-fantasy-10', type: 'movie' },
    { title: 'Stardust', year: '2007', imdbID: 'local-fantasy-11', type: 'movie' },
    { title: 'The Shape of Water', year: '2017', imdbID: 'local-fantasy-12', type: 'movie' },
    { title: 'The Hobbit: An Unexpected Journey', year: '2012', imdbID: 'local-fantasy-13', type: 'movie' },
    { title: 'The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', year: '2005', imdbID: 'local-fantasy-14', type: 'movie' },
    { title: 'Willow', year: '1988', imdbID: 'local-fantasy-15', type: 'movie' },
    { title: 'Legend', year: '1985', imdbID: 'local-fantasy-16', type: 'movie' },
    { title: 'Bridge to Terabithia', year: '2007', imdbID: 'local-fantasy-17', type: 'movie' },
    { title: 'The Green Knight', year: '2021', imdbID: 'local-fantasy-18', type: 'movie' },
    { title: 'The Princess Bride', year: '1987', imdbID: 'local-fantasy-19', type: 'movie' },
    { title: 'Labyrinth', year: '1986', imdbID: 'local-fantasy-20', type: 'movie' },
  ],
  family: [
    { title: 'Finding Nemo', year: '2003', imdbID: 'local-family-1', type: 'movie' },
    { title: 'Toy Story', year: '1995', imdbID: 'local-family-2', type: 'movie' },
    { title: 'Toy Story 3', year: '2010', imdbID: 'local-family-3', type: 'movie' },
    { title: 'The Incredibles', year: '2004', imdbID: 'local-family-4', type: 'movie' },
    { title: 'Up', year: '2009', imdbID: 'local-family-5', type: 'movie' },
    { title: 'Coco', year: '2017', imdbID: 'local-family-6', type: 'movie' },
    { title: 'The Lion King', year: '1994', imdbID: 'local-family-7', type: 'movie' },
    { title: 'Aladdin', year: '1992', imdbID: 'local-family-8', type: 'movie' },
    { title: 'Moana', year: '2016', imdbID: 'local-family-9', type: 'movie' },
    { title: 'Frozen', year: '2013', imdbID: 'local-family-10', type: 'movie' },
    { title: 'Zootopia', year: '2016', imdbID: 'local-family-11', type: 'movie' },
    { title: 'Shrek', year: '2001', imdbID: 'local-family-12', type: 'movie' },
    { title: 'Paddington 2', year: '2017', imdbID: 'local-family-13', type: 'movie' },
    { title: 'The Iron Giant', year: '1999', imdbID: 'local-family-14', type: 'movie' },
    { title: 'The Princess Bride', year: '1987', imdbID: 'local-family-15', type: 'movie' },
    { title: 'Matilda', year: '1996', imdbID: 'local-family-16', type: 'movie' },
    { title: 'School of Rock', year: '2003', imdbID: 'local-family-17', type: 'movie' },
    { title: 'The Sandlot', year: '1993', imdbID: 'local-family-18', type: 'movie' },
    { title: 'Home Alone', year: '1990', imdbID: 'local-family-19', type: 'movie' },
    { title: 'Harry Potter and the Sorcerer\'s Stone', year: '2001', imdbID: 'local-family-20', type: 'movie' },
  ],
  biography: [
    { title: 'Schindler\'s List', year: '1993', imdbID: 'local-bio-1', type: 'movie' },
    { title: 'Oppenheimer', year: '2023', imdbID: 'local-bio-2', type: 'movie' },
    { title: 'The Social Network', year: '2010', imdbID: 'local-bio-3', type: 'movie' },
    { title: 'A Beautiful Mind', year: '2001', imdbID: 'local-bio-4', type: 'movie' },
    { title: 'The King\'s Speech', year: '2010', imdbID: 'local-bio-5', type: 'movie' },
    { title: 'Lincoln', year: '2012', imdbID: 'local-bio-6', type: 'movie' },
    { title: 'The Imitation Game', year: '2014', imdbID: 'local-bio-7', type: 'movie' },
    { title: 'Catch Me If You Can', year: '2002', imdbID: 'local-bio-8', type: 'movie' },
    { title: 'Bohemian Rhapsody', year: '2018', imdbID: 'local-bio-9', type: 'movie' },
    { title: 'Walk the Line', year: '2005', imdbID: 'local-bio-10', type: 'movie' },
    { title: 'The Theory of Everything', year: '2014', imdbID: 'local-bio-11', type: 'movie' },
    { title: 'Into the Wild', year: '2007', imdbID: 'local-bio-12', type: 'movie' },
    { title: 'Raging Bull', year: '1980', imdbID: 'local-bio-13', type: 'movie' },
    { title: 'Moneyball', year: '2011', imdbID: 'local-bio-14', type: 'movie' },
    { title: 'Hacksaw Ridge', year: '2016', imdbID: 'local-bio-15', type: 'movie' },
    { title: 'The Big Short', year: '2015', imdbID: 'local-bio-16', type: 'movie' },
    { title: 'Steve Jobs', year: '2015', imdbID: 'local-bio-17', type: 'movie' },
    { title: 'The Wolf of Wall Street', year: '2013', imdbID: 'local-bio-18', type: 'movie' },
    { title: 'The Pianist', year: '2002', imdbID: 'local-bio-19', type: 'movie' },
    { title: '12 Years a Slave', year: '2013', imdbID: 'local-bio-20', type: 'movie' },
  ],
  history: [
    { title: 'Schindler\'s List', year: '1993', imdbID: 'local-hist-1', type: 'movie' },
    { title: 'Saving Private Ryan', year: '1998', imdbID: 'local-hist-2', type: 'movie' },
    { title: 'Braveheart', year: '1995', imdbID: 'local-hist-3', type: 'movie' },
    { title: 'Lincoln', year: '2012', imdbID: 'local-hist-4', type: 'movie' },
    { title: 'Gandhi', year: '1982', imdbID: 'local-hist-5', type: 'movie' },
    { title: 'The Last of the Mohicans', year: '1992', imdbID: 'local-hist-6', type: 'movie' },
    { title: 'Gladiator', year: '2000', imdbID: 'local-hist-7', type: 'movie' },
    { title: 'Kingdom of Heaven', year: '2005', imdbID: 'local-hist-8', type: 'movie' },
    { title: 'Dunkirk', year: '2017', imdbID: 'local-hist-9', type: 'movie' },
    { title: 'The Imitation Game', year: '2014', imdbID: 'local-hist-10', type: 'movie' },
    { title: 'Darkest Hour', year: '2017', imdbID: 'local-hist-11', type: 'movie' },
    { title: 'The King\'s Speech', year: '2010', imdbID: 'local-hist-12', type: 'movie' },
    { title: 'Apocalypto', year: '2006', imdbID: 'local-hist-13', type: 'movie' },
    { title: 'The Patriot', year: '2000', imdbID: 'local-hist-14', type: 'movie' },
    { title: 'Hotel Rwanda', year: '2004', imdbID: 'local-hist-15', type: 'movie' },
    { title: 'Letters from Iwo Jima', year: '2006', imdbID: 'local-hist-16', type: 'movie' },
    { title: 'The Last Samurai', year: '2003', imdbID: 'local-hist-17', type: 'movie' },
    { title: 'Master and Commander: The Far Side of the World', year: '2003', imdbID: 'local-hist-18', type: 'movie' },
    { title: 'Elizabeth', year: '1998', imdbID: 'local-hist-19', type: 'movie' },
    { title: 'The Last Emperor', year: '1987', imdbID: 'local-hist-20', type: 'movie' },
  ],
  war: [
    { title: 'Saving Private Ryan', year: '1998', imdbID: 'local-war-1', type: 'movie' },
    { title: 'Dunkirk', year: '2017', imdbID: 'local-war-2', type: 'movie' },
    { title: '1917', year: '2019', imdbID: 'local-war-3', type: 'movie' },
    { title: 'Hacksaw Ridge', year: '2016', imdbID: 'local-war-4', type: 'movie' },
    { title: 'Black Hawk Down', year: '2001', imdbID: 'local-war-5', type: 'movie' },
    { title: 'Fury', year: '2014', imdbID: 'local-war-6', type: 'movie' },
    { title: 'Apocalypse Now', year: '1979', imdbID: 'local-war-7', type: 'movie' },
    { title: 'Full Metal Jacket', year: '1987', imdbID: 'local-war-8', type: 'movie' },
    { title: 'Platoon', year: '1986', imdbID: 'local-war-9', type: 'movie' },
    { title: 'The Thin Red Line', year: '1998', imdbID: 'local-war-10', type: 'movie' },
    { title: 'Letters from Iwo Jima', year: '2006', imdbID: 'local-war-11', type: 'movie' },
    { title: 'The Hurt Locker', year: '2008', imdbID: 'local-war-12', type: 'movie' },
    { title: 'Inglourious Basterds', year: '2009', imdbID: 'local-war-13', type: 'movie' },
    { title: 'Pearl Harbor', year: '2001', imdbID: 'local-war-14', type: 'movie' },
    { title: 'War Horse', year: '2011', imdbID: 'local-war-15', type: 'movie' },
    { title: 'The Pianist', year: '2002', imdbID: 'local-war-16', type: 'movie' },
    { title: 'Defiance', year: '2008', imdbID: 'local-war-17', type: 'movie' },
    { title: 'Enemy at the Gates', year: '2001', imdbID: 'local-war-18', type: 'movie' },
    { title: 'Patton', year: '1970', imdbID: 'local-war-19', type: 'movie' },
    { title: 'We Were Soldiers', year: '2002', imdbID: 'local-war-20', type: 'movie' },
  ],
  thriller: [
    { title: 'Se7en', year: '1995', imdbID: 'local-thriller-1', type: 'movie' },
    { title: 'Zodiac', year: '2007', imdbID: 'local-thriller-2', type: 'movie' },
    { title: 'Gone Girl', year: '2014', imdbID: 'local-thriller-3', type: 'movie' },
    { title: 'Shutter Island', year: '2010', imdbID: 'local-thriller-4', type: 'movie' },
    { title: 'The Silence of the Lambs', year: '1991', imdbID: 'local-thriller-5', type: 'movie' },
    { title: 'Prisoners', year: '2013', imdbID: 'local-thriller-6', type: 'movie' },
    { title: 'Nightcrawler', year: '2014', imdbID: 'local-thriller-7', type: 'movie' },
    { title: 'Oldboy', year: '2003', imdbID: 'local-thriller-8', type: 'movie' },
    { title: 'The Girl with the Dragon Tattoo', year: '2011', imdbID: 'local-thriller-9', type: 'movie' },
    { title: 'Heat', year: '1995', imdbID: 'local-thriller-10', type: 'movie' },
    { title: 'Memento', year: '2000', imdbID: 'local-thriller-11', type: 'movie' },
    { title: 'The Prestige', year: '2006', imdbID: 'local-thriller-12', type: 'movie' },
    { title: 'Whiplash', year: '2014', imdbID: 'local-thriller-13', type: 'movie' },
    { title: 'The Departed', year: '2006', imdbID: 'local-thriller-14', type: 'movie' },
    { title: 'Insomnia', year: '2002', imdbID: 'local-thriller-15', type: 'movie' },
    { title: 'Collateral', year: '2004', imdbID: 'local-thriller-16', type: 'movie' },
    { title: 'Drive', year: '2011', imdbID: 'local-thriller-17', type: 'movie' },
    { title: 'Black Swan', year: '2010', imdbID: 'local-thriller-18', type: 'movie' },
    { title: 'Misery', year: '1990', imdbID: 'local-thriller-19', type: 'movie' },
    { title: 'A Quiet Place', year: '2018', imdbID: 'local-thriller-20', type: 'movie' },
  ],
  mystery: [
    { title: 'Knives Out', year: '2019', imdbID: 'local-mystery-1', type: 'movie' },
    { title: 'Glass Onion', year: '2022', imdbID: 'local-mystery-2', type: 'movie' },
    { title: 'Gone Girl', year: '2014', imdbID: 'local-mystery-3', type: 'movie' },
    { title: 'Shutter Island', year: '2010', imdbID: 'local-mystery-4', type: 'movie' },
    { title: 'Zodiac', year: '2007', imdbID: 'local-mystery-5', type: 'movie' },
    { title: 'Se7en', year: '1995', imdbID: 'local-mystery-6', type: 'movie' },
    { title: 'Memento', year: '2000', imdbID: 'local-mystery-7', type: 'movie' },
    { title: 'The Sixth Sense', year: '1999', imdbID: 'local-mystery-8', type: 'movie' },
    { title: 'Arrival', year: '2016', imdbID: 'local-mystery-9', type: 'movie' },
    { title: 'The Prestige', year: '2006', imdbID: 'local-mystery-10', type: 'movie' },
    { title: 'Prisoners', year: '2013', imdbID: 'local-mystery-11', type: 'movie' },
    { title: 'Insomnia', year: '2002', imdbID: 'local-mystery-12', type: 'movie' },
    { title: 'The Girl with the Dragon Tattoo', year: '2011', imdbID: 'local-mystery-13', type: 'movie' },
    { title: 'Mulholland Drive', year: '2001', imdbID: 'local-mystery-14', type: 'movie' },
    { title: 'The Others', year: '2001', imdbID: 'local-mystery-15', type: 'movie' },
    { title: 'Gone Baby Gone', year: '2007', imdbID: 'local-mystery-16', type: 'movie' },
    { title: 'Chinatown', year: '1974', imdbID: 'local-mystery-17', type: 'movie' },
    { title: 'The Usual Suspects', year: '1995', imdbID: 'local-mystery-18', type: 'movie' },
    { title: 'Rear Window', year: '1954', imdbID: 'local-mystery-19', type: 'movie' },
    { title: 'Vertigo', year: '1958', imdbID: 'local-mystery-20', type: 'movie' },
  ],
  documentary: [
    { title: 'Free Solo', year: '2018', imdbID: 'local-doc-1', type: 'movie' },
    { title: 'The Social Dilemma', year: '2020', imdbID: 'local-doc-2', type: 'movie' },
    { title: 'Won\'t You Be My Neighbor?', year: '2018', imdbID: 'local-doc-3', type: 'movie' },
    { title: '13th', year: '2016', imdbID: 'local-doc-4', type: 'movie' },
    { title: 'The Last Dance', year: '2020', imdbID: 'local-doc-5', type: 'series' },
    { title: 'Planet Earth', year: '2006', imdbID: 'local-doc-6', type: 'series' },
    { title: 'Planet Earth II', year: '2016', imdbID: 'local-doc-7', type: 'series' },
    { title: 'March of the Penguins', year: '2005', imdbID: 'local-doc-8', type: 'movie' },
    { title: 'Man on Wire', year: '2008', imdbID: 'local-doc-9', type: 'movie' },
    { title: 'Senna', year: '2010', imdbID: 'local-doc-10', type: 'movie' },
    { title: 'Amy', year: '2015', imdbID: 'local-doc-11', type: 'movie' },
    { title: 'Jiro Dreams of Sushi', year: '2011', imdbID: 'local-doc-12', type: 'movie' },
    { title: 'Inside Job', year: '2010', imdbID: 'local-doc-13', type: 'movie' },
    { title: 'The Cove', year: '2009', imdbID: 'local-doc-14', type: 'movie' },
    { title: 'Searching for Sugar Man', year: '2012', imdbID: 'local-doc-15', type: 'movie' },
    { title: 'Icarus', year: '2017', imdbID: 'local-doc-16', type: 'movie' },
    { title: 'Citizenfour', year: '2014', imdbID: 'local-doc-17', type: 'movie' },
    { title: 'Fyre', year: '2019', imdbID: 'local-doc-18', type: 'movie' },
    { title: 'The Rescue', year: '2021', imdbID: 'local-doc-19', type: 'movie' },
    { title: 'American Factory', year: '2019', imdbID: 'local-doc-20', type: 'movie' },
  ],
  music: [
    { title: 'La La Land', year: '2016', imdbID: 'local-music-1', type: 'movie' },
    { title: 'Whiplash', year: '2014', imdbID: 'local-music-2', type: 'movie' },
    { title: 'Bohemian Rhapsody', year: '2018', imdbID: 'local-music-3', type: 'movie' },
    { title: 'Walk the Line', year: '2005', imdbID: 'local-music-4', type: 'movie' },
    { title: 'Inside Llewyn Davis', year: '2013', imdbID: 'local-music-5', type: 'movie' },
    { title: 'A Star Is Born', year: '2018', imdbID: 'local-music-6', type: 'movie' },
    { title: 'Yesterday', year: '2019', imdbID: 'local-music-7', type: 'movie' },
    { title: 'Rocketman', year: '2019', imdbID: 'local-music-8', type: 'movie' },
    { title: 'Ray', year: '2004', imdbID: 'local-music-9', type: 'movie' },
    { title: 'Amadeus', year: '1984', imdbID: 'local-music-10', type: 'movie' },
    { title: 'School of Rock', year: '2003', imdbID: 'local-music-11', type: 'movie' },
    { title: 'The Blues Brothers', year: '1980', imdbID: 'local-music-12', type: 'movie' },
    { title: '8 Mile', year: '2002', imdbID: 'local-music-13', type: 'movie' },
    { title: 'Pitch Perfect', year: '2012', imdbID: 'local-music-14', type: 'movie' },
    { title: 'Begin Again', year: '2013', imdbID: 'local-music-15', type: 'movie' },
    { title: 'This Is Spinal Tap', year: '1984', imdbID: 'local-music-16', type: 'movie' },
    { title: 'The Sound of Metal', year: '2019', imdbID: 'local-music-17', type: 'movie' },
    { title: 'Ma Rainey\'s Black Bottom', year: '2020', imdbID: 'local-music-18', type: 'movie' },
    { title: 'Blinded by the Light', year: '2019', imdbID: 'local-music-19', type: 'movie' },
    { title: 'Wild Rose', year: '2018', imdbID: 'local-music-20', type: 'movie' },
  ],
  musical: [
    { title: 'La La Land', year: '2016', imdbID: 'local-musical-1', type: 'movie' },
    { title: 'The Greatest Showman', year: '2017', imdbID: 'local-musical-2', type: 'movie' },
    { title: 'Les Misérables', year: '2012', imdbID: 'local-musical-3', type: 'movie' },
    { title: 'Moulin Rouge!', year: '2001', imdbID: 'local-musical-4', type: 'movie' },
    { title: 'Chicago', year: '2002', imdbID: 'local-musical-5', type: 'movie' },
    { title: 'West Side Story', year: '1961', imdbID: 'local-musical-6', type: 'movie' },
    { title: 'West Side Story', year: '2021', imdbID: 'local-musical-7', type: 'movie' },
    { title: 'Hairspray', year: '2007', imdbID: 'local-musical-8', type: 'movie' },
    { title: 'Pitch Perfect', year: '2012', imdbID: 'local-musical-9', type: 'movie' },
    { title: 'Mamma Mia!', year: '2008', imdbID: 'local-musical-10', type: 'movie' },
    { title: 'Sweeney Todd: The Demon Barber of Fleet Street', year: '2007', imdbID: 'local-musical-11', type: 'movie' },
    { title: 'Grease', year: '1978', imdbID: 'local-musical-12', type: 'movie' },
    { title: 'Sing Street', year: '2016', imdbID: 'local-musical-13', type: 'movie' },
    { title: 'Annie', year: '1982', imdbID: 'local-musical-14', type: 'movie' },
    { title: 'The Sound of Music', year: '1965', imdbID: 'local-musical-15', type: 'movie' },
    { title: 'The Rocky Horror Picture Show', year: '1975', imdbID: 'local-musical-16', type: 'movie' },
    { title: 'Into the Woods', year: '2014', imdbID: 'local-musical-17', type: 'movie' },
    { title: 'Enchanted', year: '2007', imdbID: 'local-musical-18', type: 'movie' },
    { title: 'Beauty and the Beast', year: '1991', imdbID: 'local-musical-19', type: 'movie' },
    { title: 'Frozen', year: '2013', imdbID: 'local-musical-20', type: 'movie' },
  ],
  western: [
    { title: 'The Good, the Bad and the Ugly', year: '1966', imdbID: 'local-western-1', type: 'movie' },
    { title: 'Unforgiven', year: '1992', imdbID: 'local-western-2', type: 'movie' },
    { title: 'Django Unchained', year: '2012', imdbID: 'local-western-3', type: 'movie' },
    { title: 'True Grit', year: '2010', imdbID: 'local-western-4', type: 'movie' },
    { title: 'No Country for Old Men', year: '2007', imdbID: 'local-western-5', type: 'movie' },
    { title: '3:10 to Yuma', year: '2007', imdbID: 'local-western-6', type: 'movie' },
    { title: 'The Assassination of Jesse James by the Coward Robert Ford', year: '2007', imdbID: 'local-western-7', type: 'movie' },
    { title: 'The Revenant', year: '2015', imdbID: 'local-western-8', type: 'movie' },
    { title: 'Bone Tomahawk', year: '2015', imdbID: 'local-western-9', type: 'movie' },
    { title: 'The Magnificent Seven', year: '1960', imdbID: 'local-western-10', type: 'movie' },
    { title: 'Once Upon a Time in the West', year: '1968', imdbID: 'local-western-11', type: 'movie' },
    { title: 'The Hateful Eight', year: '2015', imdbID: 'local-western-12', type: 'movie' },
    { title: 'Tombstone', year: '1993', imdbID: 'local-western-13', type: 'movie' },
    { title: 'Open Range', year: '2003', imdbID: 'local-western-14', type: 'movie' },
    { title: 'The Proposition', year: '2005', imdbID: 'local-western-15', type: 'movie' },
    { title: 'Hell or High Water', year: '2016', imdbID: 'local-western-16', type: 'movie' },
    { title: 'High Noon', year: '1952', imdbID: 'local-western-17', type: 'movie' },
    { title: 'Stagecoach', year: '1939', imdbID: 'local-western-18', type: 'movie' },
    { title: 'Meek\'s Cutoff', year: '2010', imdbID: 'local-western-19', type: 'movie' },
    { title: 'The Power of the Dog', year: '2021', imdbID: 'local-western-20', type: 'movie' },
  ],
  sport: [
    { title: 'Rocky', year: '1976', imdbID: 'local-sport-1', type: 'movie' },
    { title: 'Rocky II', year: '1979', imdbID: 'local-sport-2', type: 'movie' },
    { title: 'Rocky IV', year: '1985', imdbID: 'local-sport-3', type: 'movie' },
    { title: 'Creed', year: '2015', imdbID: 'local-sport-4', type: 'movie' },
    { title: 'Creed II', year: '2018', imdbID: 'local-sport-5', type: 'movie' },
    { title: 'Raging Bull', year: '1980', imdbID: 'local-sport-6', type: 'movie' },
    { title: 'Million Dollar Baby', year: '2004', imdbID: 'local-sport-7', type: 'movie' },
    { title: 'Remember the Titans', year: '2000', imdbID: 'local-sport-8', type: 'movie' },
    { title: 'Coach Carter', year: '2005', imdbID: 'local-sport-9', type: 'movie' },
    { title: 'Moneyball', year: '2011', imdbID: 'local-sport-10', type: 'movie' },
    { title: 'The Blind Side', year: '2009', imdbID: 'local-sport-11', type: 'movie' },
    { title: 'Hoosiers', year: '1986', imdbID: 'local-sport-12', type: 'movie' },
    { title: 'A League of Their Own', year: '1992', imdbID: 'local-sport-13', type: 'movie' },
    { title: 'The Sandlot', year: '1993', imdbID: 'local-sport-14', type: 'movie' },
    { title: 'The Fighter', year: '2010', imdbID: 'local-sport-15', type: 'movie' },
    { title: 'Rush', year: '2013', imdbID: 'local-sport-16', type: 'movie' },
    { title: 'Ford v Ferrari', year: '2019', imdbID: 'local-sport-17', type: 'movie' },
    { title: 'Chariots of Fire', year: '1981', imdbID: 'local-sport-18', type: 'movie' },
    { title: 'Warrior', year: '2011', imdbID: 'local-sport-19', type: 'movie' },
    { title: 'Cool Runnings', year: '1993', imdbID: 'local-sport-20', type: 'movie' },
  ],
  default: [
    { title: 'The Dark Knight', year: '2008', imdbID: 'local-tdk', type: 'movie' },
    { title: 'Inception', year: '2010', imdbID: 'local-inception', type: 'movie' },
    { title: 'Interstellar', year: '2014', imdbID: 'local-interstellar', type: 'movie' },
    { title: 'The Shawshank Redemption', year: '1994', imdbID: 'local-ssr', type: 'movie' },
    { title: 'The Godfather', year: '1972', imdbID: 'local-gf', type: 'movie' },
    { title: 'Pulp Fiction', year: '1994', imdbID: 'local-pf', type: 'movie' },
    { title: 'Fight Club', year: '1999', imdbID: 'local-fc', type: 'movie' },
    { title: 'Forrest Gump', year: '1994', imdbID: 'local-fg', type: 'movie' },
    { title: 'The Matrix', year: '1999', imdbID: 'local-matrix', type: 'movie' },
    { title: 'Gladiator', year: '2000', imdbID: 'local-gladiator', type: 'movie' },
    { title: 'The Avengers', year: '2012', imdbID: 'local-avengers', type: 'movie' },
    { title: 'Mad Max: Fury Road', year: '2015', imdbID: 'local-madmax', type: 'movie' },
    { title: 'John Wick', year: '2014', imdbID: 'local-johnwick', type: 'movie' },
    { title: 'La La Land', year: '2016', imdbID: 'local-lalaland', type: 'movie' },
    { title: 'Whiplash', year: '2014', imdbID: 'local-whiplash', type: 'movie' },
    { title: 'The Social Network', year: '2010', imdbID: 'local-tsn', type: 'movie' },
    { title: 'Parasite', year: '2019', imdbID: 'local-parasite', type: 'movie' },
    { title: 'Dune', year: '2021', imdbID: 'local-dune', type: 'movie' },
    { title: 'Oppenheimer', year: '2023', imdbID: 'local-oppenheimer', type: 'movie' },
    { title: 'Everything Everywhere All at Once', year: '2022', imdbID: 'local-eeaao', type: 'movie' },
  ],
};

// Curated movie lists by genre (IMDb IDs)
const GENRE_MOVIES = {
  'action': [
    'tt1745960', // Top Gun: Maverick
    'tt2488496', // Mad Max: Fury Road
    'tt2911666', // John Wick
    'tt4912910', // Mission: Impossible - Fallout
    'tt0468569', // The Dark Knight
    'tt1375666', // Inception
    'tt0848228', // The Avengers
    'tt1825683', // Black Panther
    'tt4633694', // Spider-Man: Into the Spider-Verse
    'tt0120737', // The Lord of the Rings: The Fellowship of the Ring
  ],
  'adventure': [
    'tt1160419', // Dune
    'tt14208870', // Dune: Part Two
    'tt0816692', // Interstellar
    'tt1856101', // Blade Runner 2049
    'tt2543164', // Arrival
    'tt3659388', // The Martian
    'tt1454468', // Gravity
    'tt1631867', // Edge of Tomorrow
    'tt0109830', // Forrest Gump
    'tt0120689', // The Green Mile
  ],
  'animation': [
    'tt4633694', // Spider-Man: Into the Spider-Verse
    'tt1979595', // Toy Story 3
    'tt1345836', // The Dark Knight Rises
    'tt0068646', // The Godfather
    'tt0110912', // Pulp Fiction
    'tt0111161', // The Shawshank Redemption
    'tt0068646', // The Godfather
    'tt1345836', // The Dark Knight Rises
    'tt0816692', // Interstellar
    'tt1160419', // Dune
  ],
  'biography': [
    'tt15398776', // Oppenheimer
    'tt10954984', // Killers of the Flower Moon
    'tt13238346', // The Brutalist
    'tt0108052', // Schindler's List
    'tt0111161', // The Shawshank Redemption
    'tt0109830', // Forrest Gump
    'tt0068646', // The Godfather
    'tt0099685', // Goodfellas
    'tt0133093', // Fight Club
    'tt0110912', // Pulp Fiction
  ],
  'comedy': [
    'tt1119646', // The Hangover
    'tt1411697', // The Hangover Part II
    'tt1951261', // The Hangover Part III
    'tt0829482', // Superbad
    'tt1478338', // Bridesmaids
    'tt0405422', // The 40-Year-Old Virgin
    'tt0478311', // Knocked Up
    'tt1245492', // This Is the End
    'tt1517268', // Barbie
    'tt0068646', // The Godfather
  ],
  'crime': [
    'tt0468569', // The Dark Knight
    'tt0099685', // Goodfellas
    'tt0110912', // Pulp Fiction
    'tt0111161', // The Shawshank Redemption
    'tt0068646', // The Godfather
    'tt0068646', // The Godfather
    'tt0133093', // Fight Club
    'tt1345836', // The Dark Knight Rises
    'tt2488496', // Mad Max: Fury Road
    'tt2911666', // John Wick
  ],
  'documentary': [
    'tt0068646', // The Godfather
    'tt0111161', // The Shawshank Redemption
    'tt0109830', // Forrest Gump
    'tt0110912', // Pulp Fiction
    'tt0468569', // The Dark Knight
    'tt1375666', // Inception
    'tt0816692', // Interstellar
    'tt1160419', // Dune
    'tt15398776', // Oppenheimer
    'tt1745960', // Top Gun: Maverick
  ],
  'drama': [
    'tt0111161', // The Shawshank Redemption
    'tt0109830', // Forrest Gump
    'tt0120689', // The Green Mile
    'tt0108052', // Schindler's List
    'tt0068646', // The Godfather
    'tt0110912', // Pulp Fiction
    'tt0133093', // Fight Club
    'tt0099685', // Goodfellas
    'tt15398776', // Oppenheimer
    'tt13238346', // The Brutalist
  ],
  'family': [
    'tt0109830', // Forrest Gump
    'tt1979595', // Toy Story 3
    'tt0816692', // Interstellar
    'tt1160419', // Dune
    'tt1517268', // Barbie
    'tt0468569', // The Dark Knight
    'tt4633694', // Spider-Man: Into the Spider-Verse
    'tt0120737', // The Lord of the Rings: The Fellowship of the Ring
    'tt1375666', // Inception
    'tt0848228', // The Avengers
  ],
  'fantasy': [
    'tt1160419', // Dune
    'tt14208870', // Dune: Part Two
    'tt0120737', // The Lord of the Rings: The Fellowship of the Ring
    'tt0816692', // Interstellar
    'tt1375666', // Inception
    'tt4633694', // Spider-Man: Into the Spider-Verse
    'tt1825683', // Black Panther
    'tt0848228', // The Avengers
    'tt2488496', // Mad Max: Fury Road
    'tt1631867', // Edge of Tomorrow
  ],
  'film-noir': [
    'tt0110912', // Pulp Fiction
    'tt0099685', // Goodfellas
    'tt0133093', // Fight Club
    'tt0468569', // The Dark Knight
    'tt0068646', // The Godfather
    'tt0111161', // The Shawshank Redemption
    'tt0109830', // Forrest Gump
    'tt0120689', // The Green Mile
    'tt0108052', // Schindler's List
    'tt1345836', // The Dark Knight Rises
  ],
  'history': [
    'tt15398776', // Oppenheimer
    'tt10954984', // Killers of the Flower Moon
    'tt0108052', // Schindler's List
    'tt0068646', // The Godfather
    'tt0111161', // The Shawshank Redemption
    'tt0109830', // Forrest Gump
    'tt0120689', // The Green Mile
    'tt13238346', // The Brutalist
    'tt0110912', // Pulp Fiction
    'tt0099685', // Goodfellas
  ],
  'horror': [
    'tt5052448', // Get Out
    'tt6644200', // A Quiet Place
    'tt7784604', // Hereditary
    'tt1457767', // The Conjuring
    'tt3235888', // It Follows
    'tt2321549', // The Babadook
    'tt1922777', // Sinister
    'tt4263482', // The Witch
    'tt0468569', // The Dark Knight
    'tt0133093', // Fight Club
  ],
  'music': [
    'tt3783958', // La La Land
    'tt1517268', // Barbie
    'tt0468569', // The Dark Knight
    'tt0111161', // The Shawshank Redemption
    'tt0109830', // Forrest Gump
    'tt0110912', // Pulp Fiction
    'tt0068646', // The Godfather
    'tt0099685', // Goodfellas
    'tt0133093', // Fight Club
    'tt1375666', // Inception
  ],
  'musical': [
    'tt3783958', // La La Land
    'tt1517268', // Barbie
    'tt0468569', // The Dark Knight
    'tt0111161', // The Shawshank Redemption
    'tt0109830', // Forrest Gump
    'tt0110912', // Pulp Fiction
    'tt0068646', // The Godfather
    'tt0099685', // Goodfellas
    'tt0133093', // Fight Club
    'tt1375666', // Inception
  ],
  'mystery': [
    'tt0468569', // The Dark Knight
    'tt0110912', // Pulp Fiction
    'tt0111161', // The Shawshank Redemption
    'tt0133093', // Fight Club
    'tt0099685', // Goodfellas
    'tt1345836', // The Dark Knight Rises
    'tt0068646', // The Godfather
    'tt1375666', // Inception
    'tt0816692', // Interstellar
    'tt2543164', // Arrival
  ],
  'romance': [
    'tt3783958', // La La Land
    'tt0332280', // The Notebook
    'tt1022603', // 500 Days of Summer
    'tt0338013', // Eternal Sunshine of the Spotless Mind
    'tt0112471', // Before Sunrise
    'tt2194499', // About Time
    'tt2582846', // The Fault in Our Stars
    'tt3104988', // Crazy Rich Asians
    'tt0109830', // Forrest Gump
    'tt0120689', // The Green Mile
  ],
  'sci-fi': [
    'tt1160419', // Dune
    'tt14208870', // Dune: Part Two
    'tt0816692', // Interstellar
    'tt1856101', // Blade Runner 2049
    'tt2543164', // Arrival
    'tt0470752', // Ex Machina
    'tt3659388', // The Martian
    'tt1454468', // Gravity
    'tt1798709', // Her
    'tt1631867', // Edge of Tomorrow
  ],
  'sport': [
    'tt0109830', // Forrest Gump
    'tt0111161', // The Shawshank Redemption
    'tt0468569', // The Dark Knight
    'tt0068646', // The Godfather
    'tt0110912', // Pulp Fiction
    'tt0133093', // Fight Club
    'tt0099685', // Goodfellas
    'tt0120689', // The Green Mile
    'tt1375666', // Inception
    'tt0816692', // Interstellar
  ],
  'thriller': [
    'tt0468569', // The Dark Knight
    'tt1345836', // The Dark Knight Rises
    'tt0110912', // Pulp Fiction
    'tt0133093', // Fight Club
    'tt1375666', // Inception
    'tt2488496', // Mad Max: Fury Road
    'tt2911666', // John Wick
    'tt4912910', // Mission: Impossible - Fallout
    'tt1631867', // Edge of Tomorrow
    'tt0816692', // Interstellar
  ],
  'war': [
    'tt15398776', // Oppenheimer
    'tt10954984', // Killers of the Flower Moon
    'tt0108052', // Schindler's List
    'tt0068646', // The Godfather
    'tt0111161', // The Shawshank Redemption
    'tt0109830', // Forrest Gump
    'tt0120689', // The Green Mile
    'tt13238346', // The Brutalist
    'tt0110912', // Pulp Fiction
    'tt0099685', // Goodfellas
  ],
  'western': [
    'tt0068646', // The Godfather
    'tt0111161', // The Shawshank Redemption
    'tt0109830', // Forrest Gump
    'tt0110912', // Pulp Fiction
    'tt0468569', // The Dark Knight
    'tt1375666', // Inception
    'tt0816692', // Interstellar
    'tt1160419', // Dune
    'tt15398776', // Oppenheimer
    'tt1745960', // Top Gun: Maverick
  ]
};

/**
 * Parse year range string (e.g., "2020-2024" or "2020")
 */
function parseYearRange(yearStr) {
  if (!yearStr) return null;
  
  if (yearStr.includes('-')) {
    const [start, end] = yearStr.split('-').map(y => parseInt(y, 10));
    return { start, end };
  }
  
  const year = parseInt(yearStr, 10);
  return { start: year, end: year };
}

/**
 * Check if movie year falls within range
 */
function isYearInRange(movieYear, range) {
  if (!range) return true;
  const year = parseInt(movieYear, 10);
  return year >= range.start && year <= range.end;
}

/**
 * Check if movie languages match user preferences
 */
function matchesLanguage(movieLanguages, selectedLanguages) {
  if (!selectedLanguages?.length) return true;
  if (!movieLanguages) return false;
  
  const movieLangSet = movieLanguages
    .toLowerCase()
    .split(',')
    .map(lang => lang.trim())
    .filter(Boolean);
    
  return selectedLanguages.some(lang => movieLangSet.includes(lang.toLowerCase()));
}

/**
 * Provide local fallback results when external API fails
 */
function buildLocalFallback(genre, page, type, languages, yearRange) {
  const pool = LOCAL_FALLBACK_MOVIES[genre] || LOCAL_FALLBACK_MOVIES.default;
  const filtered = pool.filter(movie => {
    const matchesType = type === 'both' || movie.type === type || movie.type === 'movie';
    const matchesLang = !languages?.length || true; // no language metadata; accept all
    const matchesYear = !yearRange || isYearInRange(movie.year, yearRange);
    return matchesType && matchesLang && matchesYear;
  });

  const start = (page - 1) * 20;
  const pageItems = filtered.slice(start, start + 20);

  return {
    results: pageItems.map(m => ({
      ...m,
      poster: '/no-poster.png',
    })),
    totalResults: filtered.length,
    hasMore: filtered.length > page * 20,
  };
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, timeout = API_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Process recommendations data
 */
function processRecommendations(data, yearRange, page, genre, year, sortBy) {
  let results = (data.Search || [])
    .filter(movie => 
      movie.Poster && movie.Poster !== 'N/A' && 
      movie.Year && movie.imdbID &&
      isYearInRange(movie.Year, yearRange)
    )
    .map(movie => ({
      id: movie.imdbID,
      imdbID: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      type: movie.Type,
      poster: movie.Poster,
    }));

  // Sort results based on sortBy parameter
  if (sortBy === 'year') {
    results.sort((a, b) => parseInt(b.year) - parseInt(a.year));
  } else if (sortBy === 'title') {
    results.sort((a, b) => a.title.localeCompare(b.title));
  }

  return {
    results,
    totalResults: parseInt(data.totalResults, 10) || 0,
    page,
    hasMore: (data.totalResults || 0) > page * 10,
    genre,
    yearRange: year || null,
    sortBy,
  };
}

/**
 * Get movie recommendations based on genre and year with enhanced filtering
 * @route GET /api/recommendations?genre={genre}&year={year}&page={page}&sortBy={sortBy}
 * @param {Request} req - The incoming request object
 * @returns {Promise<NextResponse>} The recommended movies
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const genre = searchParams.get('genre')?.toLowerCase();
    const year = searchParams.get('year');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sortBy = searchParams.get('sortBy') || 'relevance'; // relevance, year, title
    const type = (searchParams.get('type') || 'movie').toLowerCase();
    const languages = searchParams.get('languages')
      ? searchParams.get('languages').split(',').filter(Boolean).map(l => l.toLowerCase())
      : [];

    // Input validation
    if (!genre) {
      throw new BadRequestError('Genre is required');
    }

    if (!VALID_GENRES.includes(genre)) {
      throw new BadRequestError(
        `Invalid genre. Must be one of: ${VALID_GENRES.join(', ')}`
      );
    }

    if (year && !/^[\d\-]+$/.test(year)) {
      throw new BadRequestError('Year must be a valid year or year range (e.g., 2020-2024)');
    }

    if (page < 1) {
      throw new BadRequestError('Page number must be greater than 0');
    }

    if (!VALID_TYPES.includes(type)) {
      throw new BadRequestError(
        `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`
      );
    }

    // Short-circuit when API key is missing: return curated items without remote fetch
    if (!API_KEY || API_KEY === 'your_omdb_api_key_here') {
      const local = buildLocalFallback(genre, page, type, languages, parseYearRange(year));
      return NextResponse.json({
        success: true,
        results: local.results,
        totalResults: local.totalResults,
        page,
        hasMore: local.hasMore,
        genre,
        yearRange: year || null,
        sortBy,
        type,
        languages,
        warning: 'Missing OMDb API key. Using local fallback list. Add NEXT_PUBLIC_OMDB_API_KEY in .env.local',
      });
    }

    // Construct cache key
    const cacheKey = `recommendations:${genre}:${year || 'any'}:${page}:${sortBy}:${type}:${languages.join('|') || 'any'}`;
    const cachedData = cache.get(cacheKey);
    
    // Return cached response if available and not expired
    if (cachedData && (Date.now() - cachedData.timestamp) / 1000 < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        ...cachedData.data,
        cached: true,
      });
    }

    // Parse year range
    const yearRange = parseYearRange(year);

    // Get curated movies for this genre
    const genreMovieIds = GENRE_MOVIES[genre] || [];
    
    if (genreMovieIds.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        totalResults: 0,
        page,
        hasMore: false,
        genre,
        yearRange: year || null,
        sortBy,
      });
    }

    // Fetch movie details for the genre
    const movieIds = genreMovieIds.slice((page - 1) * 10, page * 10);
    const results = [];
    const seenIds = new Set();
    let totalResultsCount = genreMovieIds.length;

    for (const id of movieIds) {
      try {
        const movieResponse = await fetchWithTimeout(
          `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&i=${id}`,
          API_TIMEOUT
        );
        
        if (movieResponse.ok) {
          const movieData = await movieResponse.json();
          
          if (movieData.Response === 'True' && 
              movieData.Poster && movieData.Poster !== 'N/A' &&
              isYearInRange(movieData.Year, yearRange) &&
              (type === 'both' || movieData.Type === type) &&
              matchesLanguage(movieData.Language, languages) &&
              !seenIds.has(movieData.imdbID)) {
            seenIds.add(movieData.imdbID);
            results.push({
              id: movieData.imdbID,
              imdbID: movieData.imdbID,
              title: movieData.Title,
              year: movieData.Year,
              type: movieData.Type,
              poster: movieData.Poster,
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch movie ${id}:`, error);
        // Continue with next movie
      }
    }

    // Fallback tiers: first try strict filters, then relax language/year if still empty
    const runFallbackSearch = async (options = {}) => {
      const {
        ignoreYear = false,
        ignoreLanguage = false,
        forceTypeBoth = false,
      } = options;

      const fallbackParams = new URLSearchParams({
        apikey: API_KEY,
        s: genre,
        page: page.toString(),
      });

      const effectiveType = forceTypeBoth ? 'both' : type;
      if (effectiveType !== 'both') {
        fallbackParams.set('type', effectiveType);
      }

      if (!ignoreYear && yearRange && yearRange.start === yearRange.end) {
        fallbackParams.set('y', yearRange.start.toString());
      }

      const fallbackResponse = await fetchWithTimeout(
        `https://www.omdbapi.com/?${fallbackParams.toString()}`,
        API_TIMEOUT
      );

      if (!fallbackResponse.ok) return;
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.Response !== 'True') return;

      totalResultsCount = parseInt(fallbackData.totalResults, 10) || totalResultsCount;
      const fallbackMovies = fallbackData.Search || [];

      for (const movie of fallbackMovies) {
        try {
          const detailResponse = await fetchWithTimeout(
            `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`,
            API_TIMEOUT
          );

          if (!detailResponse.ok) continue;
          const detail = await detailResponse.json();

          if (detail.Response === 'True' &&
              detail.Poster && detail.Poster !== 'N/A' &&
              (ignoreYear || isYearInRange(detail.Year, yearRange)) &&
              (forceTypeBoth || type === 'both' || detail.Type === type) &&
              (ignoreLanguage || matchesLanguage(detail.Language, languages)) &&
              !seenIds.has(detail.imdbID)) {
            seenIds.add(detail.imdbID);
            results.push({
              id: detail.imdbID,
              imdbID: detail.imdbID,
              title: detail.Title,
              year: detail.Year,
              type: detail.Type,
              poster: detail.Poster,
            });
          }
        } catch (detailError) {
          console.warn(`Failed to fetch fallback movie ${movie.imdbID}:`, detailError);
        }
      }
    };

    if (results.length === 0) {
      try {
        // Tier 1: keep all filters
        await runFallbackSearch();

        // Tier 2: relax language filter
        if (results.length === 0) {
          await runFallbackSearch({ ignoreLanguage: true });
        }

        // Tier 3: relax year + language + allow both types
        if (results.length === 0) {
          await runFallbackSearch({ ignoreLanguage: true, ignoreYear: true, forceTypeBoth: true });
        }

        // Tier 4: local static fallback
        if (results.length === 0) {
          const local = buildLocalFallback(genre, page, type, languages, yearRange);
          results.push(...local.results);
          totalResultsCount = local.totalResults || results.length;
        }
      } catch (fallbackError) {
        console.warn('Fallback recommendation fetch failed:', fallbackError);
      }
    }

    // Sort results based on sortBy parameter
    if (sortBy === 'year') {
      results.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    } else if (sortBy === 'title') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    }

    const response_data = {
      results,
      totalResults: totalResultsCount,
      page,
      hasMore: totalResultsCount > page * 10,
      genre,
      yearRange: year || null,
      sortBy,
      type,
      languages,
    };
    
    // Cache the successful response
    const cacheValue = {
      data: response_data,
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
      ...response_data,
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
