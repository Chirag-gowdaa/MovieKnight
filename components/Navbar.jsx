'use client';

import React from 'react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
              MovieKnight
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/search"
              className="text-gray-300 hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium"
            >
              Search
            </a>
            <a
              href="/recommendations"
              className="text-gray-300 hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium"
            >
              My Recommendations
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
