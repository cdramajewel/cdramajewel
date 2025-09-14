import React, { useState, useMemo } from 'react';
import { useContent } from '../context/ContentContext';
import { useAI } from '../context/AIContext';
import ContentRow from '../components/ContentRow';
import AIRecommendations from '../components/AIRecommendations';
import Spinner from '../components/Spinner';
import type { Genre } from '../types';
import { ALL_GENRES, ALL_CONTENT_TYPES } from '../constants';
import { ContentType } from '../types';

const HomePage: React.FC = () => {
  const { content, loading, error, getContinueWatchingContent } = useContent();
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'All'>('All');

  const filteredContent = useMemo(() => {
    if (selectedGenre === 'All') return content;
    return content.filter(item => item.genres.includes(selectedGenre));
  }, [content, selectedGenre]);
  
  const continueWatching = useMemo(() => getContinueWatchingContent(), [getContinueWatchingContent]);
  
  const featuredContent = useMemo(() => content.filter(item => item.featured), [content]);


  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }
  
  const trendingContent = [...content].sort((a, b) => b.views - a.views).slice(0, 10);
  const recentlyAdded = [...content].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 10);

  return (
    <div className="overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-extrabold text-white mb-2">Welcome to C-Drama Jewel</h1>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl">
              C-Drama Jewel is a web-based streaming platform where you can watch Korean Dramas, Chinese Dramas, Web Series, Movies, Anime, and TV Shows — all in one place. Enjoy a Netflix-style experience with curated playlists, organized genres, and smooth autoplay.
            </p>

            <div className="mb-8">
                <label htmlFor="genre-filter" className="sr-only">Filter by genre</label>
                <select 
                    id="genre-filter"
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value as Genre | 'All')}
                    className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-brand-purple focus:border-brand-purple block p-2.5"
                >
                    <option value="All">All Genres</option>
                    {ALL_GENRES.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                </select>
            </div>
        </div>
      
      {featuredContent.length > 0 && <ContentRow title="Featured" items={featuredContent} />}
      {continueWatching.length > 0 && <ContentRow title="Continue Watching" items={continueWatching} />}
      
      {/* AI Recommendations Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AIRecommendations />
      </div>
      
      <ContentRow title="Top Trending" items={trendingContent} />
      <ContentRow title="Recently Added" items={recentlyAdded} />
      
      {ALL_CONTENT_TYPES.map(type => (
          <ContentRow 
            key={type}
            title={type} 
            items={filteredContent.filter(item => item.type === type)} 
          />
      ))}
    </div>
  );
};

export default HomePage;