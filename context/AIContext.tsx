import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { aiService, type AIRecommendation, type AIContentAnalysis, type AISearchResult } from '../services/aiService';
import type { Content, Genre, ContentType } from '../types';

interface AIContextType {
  // AI Recommendations
  recommendations: AIRecommendation[];
  loadingRecommendations: boolean;
  getRecommendations: (userPreferences: {
    likedGenres: Genre[];
    watchedContent: string[];
    preferredTypes: ContentType[];
  }) => Promise<void>;
  
  // AI Content Analysis
  contentAnalysis: { [contentId: string]: AIContentAnalysis };
  loadingAnalysis: boolean;
  analyzeContent: (content: Content) => Promise<AIContentAnalysis>;
  
  // AI Search
  searchResults: AISearchResult | null;
  loadingSearch: boolean;
  searchContent: (query: string) => Promise<void>;
  
  // AI Watchlist
  watchlistSuggestions: Content[];
  loadingWatchlist: boolean;
  getWatchlistSuggestions: () => Promise<void>;
  
  // AI Generated Content
  generatedDescriptions: { [key: string]: string };
  generateDescription: (title: string, type: ContentType, genres: Genre[]) => Promise<string>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [contentAnalysis, setContentAnalysis] = useState<{ [contentId: string]: AIContentAnalysis }>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [searchResults, setSearchResults] = useState<AISearchResult | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [watchlistSuggestions, setWatchlistSuggestions] = useState<Content[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [generatedDescriptions, setGeneratedDescriptions] = useState<{ [key: string]: string }>({});

  const getRecommendations = useCallback(async (userPreferences: {
    likedGenres: Genre[];
    watchedContent: string[];
    preferredTypes: ContentType[];
  }) => {
    setLoadingRecommendations(true);
    try {
      // Get all content from localStorage or context
      const storedContent = localStorage.getItem('c-drama-jewel-content');
      const allContent: Content[] = storedContent ? JSON.parse(storedContent) : [];
      
      const aiRecommendations = await aiService.getRecommendations(userPreferences, allContent);
      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  }, []);

  const analyzeContent = useCallback(async (content: Content): Promise<AIContentAnalysis> => {
    if (contentAnalysis[content.id]) {
      return contentAnalysis[content.id];
    }

    setLoadingAnalysis(true);
    try {
      const analysis = await aiService.analyzeContent(content);
      setContentAnalysis(prev => ({
        ...prev,
        [content.id]: analysis,
      }));
      return analysis;
    } catch (error) {
      console.error('Failed to analyze content:', error);
      return {
        mood: 'Unknown',
        themes: [],
        targetAudience: 'General',
        emotionalTone: 'Neutral',
        complexity: 'Moderate',
        bingeability: 5,
        similarContent: [],
      };
    } finally {
      setLoadingAnalysis(false);
    }
  }, [contentAnalysis]);

  const searchContent = useCallback(async (query: string) => {
    setLoadingSearch(true);
    try {
      const storedContent = localStorage.getItem('c-drama-jewel-content');
      const allContent: Content[] = storedContent ? JSON.parse(storedContent) : [];
      
      const results = await aiService.searchContent(query, allContent);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search content:', error);
    } finally {
      setLoadingSearch(false);
    }
  }, []);

  const getWatchlistSuggestions = useCallback(async () => {
    setLoadingWatchlist(true);
    try {
      const storedContent = localStorage.getItem('c-drama-jewel-content');
      const allContent: Content[] = storedContent ? JSON.parse(storedContent) : [];
      
      const storedProgress = localStorage.getItem('c-drama-jewel-progress');
      const watchHistory: string[] = storedProgress ? Object.keys(JSON.parse(storedProgress)) : [];
      
      const suggestions = await aiService.getWatchlistSuggestions(watchHistory, allContent);
      setWatchlistSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to get watchlist suggestions:', error);
    } finally {
      setLoadingWatchlist(false);
    }
  }, []);

  const generateDescription = useCallback(async (
    title: string,
    type: ContentType,
    genres: Genre[]
  ): Promise<string> => {
    const key = `${title}-${type}-${genres.join(',')}`;
    
    if (generatedDescriptions[key]) {
      return generatedDescriptions[key];
    }

    try {
      const description = await aiService.generateContentDescription(title, type, genres);
      setGeneratedDescriptions(prev => ({
        ...prev,
        [key]: description,
      }));
      return description;
    } catch (error) {
      console.error('Failed to generate description:', error);
      return `An engaging ${type.toLowerCase()} featuring ${genres.join(' and ')} themes.`;
    }
  }, [generatedDescriptions]);

  // Load initial data
  useEffect(() => {
    getWatchlistSuggestions();
  }, [getWatchlistSuggestions]);

  return (
    <AIContext.Provider value={{
      recommendations,
      loadingRecommendations,
      getRecommendations,
      contentAnalysis,
      loadingAnalysis,
      analyzeContent,
      searchResults,
      loadingSearch,
      searchContent,
      watchlistSuggestions,
      loadingWatchlist,
      getWatchlistSuggestions,
      generatedDescriptions,
      generateDescription,
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};


