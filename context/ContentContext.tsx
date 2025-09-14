import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Content, WatchProgress, WatchProgressItem } from '../types';
import { mockContent } from '../data/mockData';

// Define the shape of the context
interface ContentContextType {
  content: Content[];
  loading: boolean;
  error: string | null;
  getContentById: (id: string) => Content | undefined;
  getContinueWatchingContent: () => (Content & { progress: WatchProgressItem })[];
  updateWatchProgress: (contentId: string, progress: WatchProgressItem) => void;
  clearWatchProgress: (contentId: string) => void;
  addContent: (newContent: Content) => void;
  updateContent: (updatedContent: Content) => void;
  deleteContent: (id: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<Content[]>([]);
  const [watchProgress, setWatchProgress] = useState<WatchProgress>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial content and watch progress
  useEffect(() => {
    try {
      // Simulate API call
      setTimeout(() => {
        const storedContent = localStorage.getItem('c-drama-jewel-content');
        if (storedContent) {
          setContent(JSON.parse(storedContent));
        } else {
          setContent(mockContent);
          localStorage.setItem('c-drama-jewel-content', JSON.stringify(mockContent));
        }

        const storedProgress = localStorage.getItem('c-drama-jewel-progress');
        if (storedProgress) {
          setWatchProgress(JSON.parse(storedProgress));
        }

        setLoading(false);
      }, 1000);
    } catch (e) {
      setError('Failed to load content.');
      setLoading(false);
    }
  }, []);

  // Persist content changes to localStorage
  const persistContent = (newContent: Content[]) => {
    setContent(newContent);
    localStorage.setItem('c-drama-jewel-content', JSON.stringify(newContent));
  };
  
  // Persist progress changes to localStorage
  const persistProgress = (newProgress: WatchProgress) => {
    setWatchProgress(newProgress);
    localStorage.setItem('c-drama-jewel-progress', JSON.stringify(newProgress));
  };
  
  const getContentById = useCallback((id: string) => {
    return content.find(item => item.id === id);
  }, [content]);
  
  const addContent = useCallback((newContentItem: Content) => {
    persistContent([newContentItem, ...content]);
  }, [content]);

  const updateContent = useCallback((updatedContentItem: Content) => {
    const newContent = content.map(item =>
      item.id === updatedContentItem.id ? updatedContentItem : item
    );
    persistContent(newContent);
  }, [content]);

  const deleteContent = useCallback((id: string) => {
    const newContent = content.filter(item => item.id !== id);
    persistContent(newContent);
  }, [content]);

  const updateWatchProgress = useCallback((contentId: string, progress: WatchProgressItem) => {
    persistProgress({
      ...watchProgress,
      [contentId]: progress,
    });
  }, [watchProgress]);

  const clearWatchProgress = useCallback((contentId: string) => {
    const newProgress = { ...watchProgress };
    delete newProgress[contentId];
    persistProgress(newProgress);
  }, [watchProgress]);

  const getContinueWatchingContent = useCallback(() => {
    return Object.keys(watchProgress)
      .map(contentId => {
        const item = getContentById(contentId);
        if (item) {
          return { ...item, progress: watchProgress[contentId] };
        }
        return null;
      })
      .filter((item): item is Content & { progress: WatchProgressItem } => item !== null)
      .sort((a, b) => (b.progress?.timestamp || 0) - (a.progress?.timestamp || 0));
  }, [watchProgress, getContentById]);

  return (
    <ContentContext.Provider value={{
      content,
      loading,
      error,
      getContentById,
      getContinueWatchingContent,
      updateWatchProgress,
      clearWatchProgress,
      addContent,
      updateContent,
      deleteContent,
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
