"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FilmIcon, StarIcon, UserIcon, CalendarIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    genres: [],
    years: [],
    types: [],
    languages: [],
  });

  const genres = [
    "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", 
    "Documentary", "Drama", "Family", "Fantasy", "Film-Noir", "History", 
    "Horror", "Music", "Musical", "Mystery", "Romance", "Sci-Fi", 
    "Sport", "Thriller", "War", "Western"
  ];

  const decades = [
    { label: "2020s", range: "2020-2025" },
    { label: "2010s", range: "2010-2019" },
    { label: "2000s", range: "2000-2009" },
    { label: "1990s", range: "1990-1999" },
    { label: "1980s", range: "1980-1989" },
    { label: "1970s", range: "1970-1979" },
    { label: "1960s", range: "1960-1969" },
    { label: "1950s", range: "1950-1959" }
  ];

  const types = ["Movie", "Series", "Both"];

  const languages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", 
    "Russian", "Japanese", "Korean", "Chinese", "Hindi", "Arabic", 
    "Turkish", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish"
  ];

  const handleGenreToggle = (genre) => {
    setPreferences(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : prev.genres.length < 3
          ? [...prev.genres, genre]
          : prev.genres
    }));
  };

  const handleDecadeToggle = (decade) => {
    setPreferences(prev => ({
      ...prev,
      years: prev.years.includes(decade.range)
        ? prev.years.filter(y => y !== decade.range)
        : [...prev.years, decade.range]
    }));
  };

  const handleYearRangeChange = (minYear, maxYear) => {
    const range = `${minYear}-${maxYear}`;
    setPreferences(prev => ({
      ...prev,
      years: [range]
    }));
  };

  const handleTypeToggle = (type) => {
    setPreferences(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const handleLanguageToggle = (language) => {
    setPreferences(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams({
      genres: preferences.genres.join(','),
      years: preferences.years.join(','),
      types: preferences.types.join(','),
      languages: preferences.languages.join(','),
    });
    router.push(`/recommendations?${queryParams.toString()}`);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return preferences.genres.length > 0;
      case 2: return preferences.years.length > 0;
      case 3: return preferences.types.length > 0;
      case 4: return preferences.languages.length > 0;
      default: return false;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'radial-gradient(1200px 800px at 10% -10%, rgba(17,24,39,0.9), transparent), radial-gradient(1200px 800px at 110% 10%, rgba(17,24,39,0.9), transparent), linear-gradient(180deg, #0a0a0a, #0b0b0b)' }}>
      {/* animated blobs background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="blob w-[36rem] h-[36rem] bg-amber-500/20 top-[-6rem] left-[-4rem]" />
        <div className="blob blob-delay-2 w-[30rem] h-[30rem] bg-rose-500/20 bottom-[-8rem] right-[-6rem]" />
        <div className="blob blob-delay-4 w-[28rem] h-[28rem] bg-indigo-500/10 bottom-[20%] left-[10%]" />
      </div>

      {/* Superhero orbs */}
      <div className="hero-orb spider w-32 h-32 top-[15%] left-[20%]" />
      <div className="hero-orb superman w-40 h-40 bottom-[25%] left-[15%]" />
      <div className="hero-orb flash w-36 h-36 top-[60%] right-[25%]" />

      {/* Superhero symbols */}
      <div className="hero-symbol spider top-[12%] left-[18%]">
        <img src="/spider.png" alt="Spider-Man" className="w-full h-full" />
      </div>
      <div className="hero-symbol superman bottom-[22%] left-[12%]">
        <img src="/super.png" alt="Superman" className="w-full h-full" />
      </div>
      <div className="hero-symbol flash top-[57%] right-[22%]">
        <img src="/flash.png" alt="Flash" className="w-full h-full" />
      </div>

      {/* Lightning effects for Flash */}
      <div className="lightning top-[10%] right-[30%]" />
      <div className="lightning top-[15%] right-[35%]" style={{ animationDelay: '1s' }} />
      <div className="lightning top-[20%] right-[40%]" style={{ animationDelay: '2s' }} />

      {/* Web strands for Spider-Man */}
      <div className="web-strand top-[25%] left-[25%]" />
      <div className="web-strand top-[30%] left-[30%]" style={{ animationDelay: '1s' }} />
      <div className="web-strand top-[35%] left-[35%]" style={{ animationDelay: '2s' }} />

      {/* Kryptonite glow for Superman */}
      <div className="kryptonite-glow bottom-[20%] left-[10%]" />

      {/* bat-signal */}
      <div className="bat-signal">
        <div className="beam" />
        <div className="icon">
          <img src="/bat.png" alt="Bat Signal" className="w-12 h-12 opacity-90" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-100 mb-4">
            Find Your Perfect Movie Match
          </h1>
          <p className="text-xl text-gray-400">
            Answer a few questions to get personalized movie recommendations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-dark glossy-shine rounded-2xl overflow-hidden float-slow"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex-1 flex items-center ${i < 4 ? "justify-center" : ""
                    }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= i
                        ? "bg-amber-500 text-white"
                        : "bg-neutral-800 text-gray-500"
                      } font-medium`}
                  >
                    {i}
                  </div>
                  {i < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${step > i ? "bg-amber-500" : "bg-neutral-800"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-500/20 mb-4">
                        <FilmIcon className="h-6 w-6 text-amber-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-100 mb-2">
                        Choose up to 3 genres you love
                      </h2>
                      <p className="text-gray-400">
                        Select your favorite movie genres (max 3)
                      </p>
                      <p className="text-sm text-amber-400 mt-2">
                        Selected: {preferences.genres.length}/3
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                      {genres.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleGenreToggle(genre)}
                          className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${preferences.genres.includes(genre)
                              ? "border-amber-500 bg-amber-500/10 text-amber-300"
                              : preferences.genres.length >= 3 && !preferences.genres.includes(genre)
                                ? "border-white/5 bg-neutral-800/50 text-gray-500 cursor-not-allowed"
                                : "border-white/10 hover:border-amber-400 text-gray-200"
                            }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-500/20 mb-4">
                        <CalendarIcon className="h-6 w-6 text-amber-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-100 mb-2">
                        Select your preferred decades
                      </h2>
                      <p className="text-gray-400">
                        Choose decades or use the year range slider below
                      </p>
                    </div>
                    
                    {/* Decade buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {decades.map((decade) => (
                        <button
                          key={decade.range}
                          type="button"
                          onClick={() => handleDecadeToggle(decade)}
                          className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${preferences.years.includes(decade.range)
                              ? "border-amber-500 bg-amber-500/10 text-amber-300"
                              : "border-white/10 hover:border-amber-400 text-gray-200"
                            }`}
                        >
                          <div className="font-bold">{decade.label}</div>
                          <div className="text-xs opacity-75">{decade.range}</div>
                        </button>
                      ))}
                    </div>

                    {/* Year range slider */}
                    <div className="mt-8 p-6 bg-neutral-900/50 rounded-lg border border-white/10">
                      <h3 className="text-lg font-semibold text-gray-100 mb-4 text-center">
                        Or select a custom year range
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>1950</span>
                          <span>2024</span>
                        </div>
                        <div className="relative">
                          <input
                            type="range"
                            min="1950"
                            max="2024"
                            defaultValue="1990"
                            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                            onChange={(e) => {
                              const startYear = e.target.value;
                              const endYear = Math.min(parseInt(startYear) + 10, 2024);
                              handleYearRangeChange(startYear, endYear);
                            }}
                          />
                        </div>
                        <div className="text-center text-sm text-amber-400">
                          Selected: 1990-2000
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-500/20 mb-4">
                        <UserIcon className="h-6 w-6 text-amber-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-100 mb-2">
                        Movie or Series?
                      </h2>
                      <p className="text-gray-400">
                        Choose your preferred content type
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {types.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleTypeToggle(type)}
                          className={`px-6 py-4 rounded-lg border-2 text-sm font-medium transition-colors ${preferences.types.includes(type)
                              ? "border-amber-500 bg-amber-500/10 text-amber-300"
                              : "border-white/10 hover:border-amber-400 text-gray-200"
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-500/20 mb-4">
                        <GlobeAltIcon className="h-6 w-6 text-amber-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-100 mb-2">
                        Select languages
                      </h2>
                      <p className="text-gray-400">
                        Choose your preferred languages (select multiple)
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                      {languages.map((language) => (
                        <button
                          key={language}
                          type="button"
                          onClick={() => handleLanguageToggle(language)}
                          className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${preferences.languages.includes(language)
                              ? "border-amber-500 bg-amber-500/10 text-amber-300"
                              : "border-white/10 hover:border-amber-400 text-gray-200"
                            }`}
                        >
                          {language}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between pt-6">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      disabled={!canProceed()}
                      className={`ml-auto px-6 py-2.5 rounded-lg text-sm font-medium ${!canProceed()
                          ? "bg-neutral-800 text-gray-500 cursor-not-allowed"
                          : "bg-amber-600 text-white hover:bg-amber-500"
                        } transition-colors`}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!canProceed()}
                      className={`ml-auto px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center ${!canProceed()
                          ? "bg-neutral-800 text-gray-500 cursor-not-allowed"
                          : "bg-amber-600 text-white hover:bg-amber-500"
                        }`}
                    >
                      Find My Movies
                      <StarIcon className="ml-2 h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
