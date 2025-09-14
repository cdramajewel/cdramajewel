import React, { useState, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import ContentCard from './ContentCard';
import Spinner from './Spinner';

const AISearch: React.FC = () => {
  const { searchResults, loadingSearch, searchContent } = useAI();
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load search history from localStorage
    const stored = localStorage.getItem('c-drama-jewel-search-history');
    if (stored) {
      setSearchHistory(JSON.parse(stored));
    }
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    await searchContent(searchQuery);
    
    // Update search history
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('c-drama-jewel-search-history', JSON.stringify(newHistory));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  return (
    <div className="bg-logo-white rounded-logo p-6 shadow-logo">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-logo-text mb-4 flex items-center">
          <span className="mr-2">🔍</span>
          AI-Powered Search
        </h3>
        
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for dramas, genres, or describe what you're looking for..."
            className="w-full px-4 py-3 pr-12 border border-logo-blue rounded-logo text-logo-text placeholder-logo-gray focus:outline-none focus:ring-2 focus:ring-logo-blue focus:border-logo-blue"
          />
          <button
            onClick={() => handleSearch(query)}
            disabled={loadingSearch || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-4 py-2 text-sm"
          >
            {loadingSearch ? '🔍' : 'Search'}
          </button>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-logo-text mb-2">Recent Searches:</h4>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(term)}
                  className="text-xs bg-logo-peach-light text-logo-text px-3 py-1 rounded-full hover:bg-logo-peach transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loadingSearch && (
        <div className="flex items-center justify-center h-32">
          <Spinner />
          <span className="ml-3 text-logo-text">AI is searching...</span>
        </div>
      )}

      {searchResults && !loadingSearch && (
        <div>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-logo-text">
              Results for "{searchResults.query}"
            </h4>
            <p className="text-sm text-logo-gray">
              Found {searchResults.results.length} content items
            </p>
          </div>

          {/* Search Suggestions */}
          {searchResults.suggestions.length > 0 && (
            <div className="mb-6 p-4 bg-logo-yellow/20 rounded-logo">
              <h5 className="font-semibold text-logo-text mb-2">💡 AI Suggestions:</h5>
              <div className="flex flex-wrap gap-2">
                {searchResults.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="text-sm bg-logo-blue text-logo-white px-3 py-1 rounded-full hover:bg-logo-blue-dark transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {searchResults.results.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🤖</div>
              <h4 className="text-lg font-semibold text-logo-text mb-2">No results found</h4>
              <p className="text-logo-gray mb-4">
                Try different keywords or check our AI suggestions above.
              </p>
              <button
                onClick={() => handleSearch('popular dramas')}
                className="btn-primary"
              >
                Show Popular Content
              </button>
            </div>
          )}

          {/* AI Filters */}
          {(searchResults.filters.genres.length > 0 || 
            searchResults.filters.types.length > 0 || 
            searchResults.filters.years.length > 0) && (
            <div className="mt-6 p-4 bg-logo-peach-light rounded-logo">
              <h5 className="font-semibold text-logo-text mb-2">🎯 AI Detected Filters:</h5>
              <div className="space-y-2">
                {searchResults.filters.genres.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-logo-text">Genres: </span>
                    <span className="text-sm text-logo-gray">
                      {searchResults.filters.genres.join(', ')}
                    </span>
                  </div>
                )}
                {searchResults.filters.types.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-logo-text">Types: </span>
                    <span className="text-sm text-logo-gray">
                      {searchResults.filters.types.join(', ')}
                    </span>
                  </div>
                )}
                {searchResults.filters.years.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-logo-text">Years: </span>
                    <span className="text-sm text-logo-gray">
                      {searchResults.filters.years.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISearch;


