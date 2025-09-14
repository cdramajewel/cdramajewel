import React, { useState, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import { useContent } from '../context/ContentContext';
import ContentCard from './ContentCard';
import Spinner from './Spinner';
import type { Genre, ContentType } from '../types';

const AIRecommendations: React.FC = () => {
  const { recommendations, loadingRecommendations, getRecommendations } = useAI();
  const { content, getContentById } = useContent();
  const [userPreferences, setUserPreferences] = useState({
    likedGenres: [] as Genre[],
    watchedContent: [] as string[],
    preferredTypes: [] as ContentType[],
  });

  useEffect(() => {
    // Load user preferences from localStorage or generate from watch history
    const storedProgress = localStorage.getItem('c-drama-jewel-progress');
    const watchHistory: string[] = storedProgress ? Object.keys(JSON.parse(storedProgress)) : [];
    
    // Analyze watched content to determine preferences
    const watchedContent = watchHistory.map(id => getContentById(id)).filter(Boolean);
    const likedGenres = new Set<Genre>();
    const preferredTypes = new Set<ContentType>();
    
    watchedContent.forEach(item => {
      if (item) {
        item.genres.forEach(genre => likedGenres.add(genre));
        preferredTypes.add(item.type);
      }
    });

    setUserPreferences({
      likedGenres: Array.from(likedGenres),
      watchedContent: watchHistory,
      preferredTypes: Array.from(preferredTypes),
    });
  }, [getContentById]);

  useEffect(() => {
    if (userPreferences.likedGenres.length > 0 || userPreferences.watchedContent.length > 0) {
      getRecommendations(userPreferences);
    }
  }, [userPreferences, getRecommendations]);

  const handleRefreshRecommendations = () => {
    getRecommendations(userPreferences);
  };

  const recommendationContent = recommendations
    .map(rec => getContentById(rec.contentId))
    .filter(Boolean);

  if (loadingRecommendations) {
    return (
      <div className="bg-logo-white rounded-logo p-6 shadow-logo">
        <div className="flex items-center justify-center h-32">
          <Spinner />
          <span className="ml-3 text-logo-text">AI is analyzing your preferences...</span>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-logo-white rounded-logo p-6 shadow-logo">
        <h3 className="text-xl font-bold text-logo-text mb-4 flex items-center">
          <span className="mr-2">🤖</span>
          AI Recommendations
        </h3>
        <p className="text-logo-gray">
          Watch some content to get personalized AI recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-logo-white rounded-logo p-6 shadow-logo">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-logo-text flex items-center">
          <span className="mr-2">🤖</span>
          AI Recommendations
          <span className="ml-2 text-sm font-normal text-logo-gray">
            ({recommendations.length} suggestions)
          </span>
        </h3>
        <button
          onClick={handleRefreshRecommendations}
          className="btn-primary text-sm px-4 py-2"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recommendationContent.map((item, index) => {
          const recommendation = recommendations.find(rec => rec.contentId === item?.id);
          return (
            <div key={item?.id} className="relative">
              <ContentCard item={item!} />
              {recommendation && (
                <div className="mt-2 p-2 bg-logo-peach-light rounded-logo">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-logo-blue">
                      {Math.round(recommendation.confidence * 100)}% match
                    </span>
                    <div className="flex">
                      {recommendation.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-logo-blue text-logo-white px-2 py-1 rounded-full mr-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-logo-text">
                    {recommendation.reason}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-logo-yellow/20 rounded-logo">
        <h4 className="font-semibold text-logo-text mb-2">💡 AI Insights</h4>
        <div className="text-sm text-logo-gray">
          <p>Based on your viewing history, you enjoy:</p>
          <ul className="list-disc list-inside mt-1">
            {userPreferences.likedGenres.slice(0, 3).map(genre => (
              <li key={genre}>{genre}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;


