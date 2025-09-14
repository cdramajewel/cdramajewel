import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import ContentCard from '../components/ContentCard';
import Spinner from '../components/Spinner';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { content, loading } = useContent();

  const searchResults = useMemo(() => {
    if (!query || !content) return [];
    const lowercasedQuery = query.toLowerCase().trim();
    if (!lowercasedQuery) return [];
    
    return content.filter(item => 
      item.title.toLowerCase().includes(lowercasedQuery) ||
      item.description.toLowerCase().includes(lowercasedQuery) ||
      item.genres.some(genre => genre.toLowerCase().includes(lowercasedQuery))
    );
  }, [content, query]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-12rem)]">
      <h1 className="text-3xl font-bold mb-6">
        {query ? (
          <>
            Search results for: <span className="text-brand-purple-light">"{query}"</span>
          </>
        ) : (
          'Please enter a search term.'
        )}
      </h1>

      {query && (
        <>
          {searchResults.length > 0 ? (
            <div className="flex flex-wrap justify-center sm:justify-start -mx-2">
              {searchResults.map(item => (
                  <ContentCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-lg mt-4">
              No results found for "{query}". Try searching for something else.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;