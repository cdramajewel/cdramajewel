import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { subtitleService, type SubtitleLanguage } from '../services/subtitleService';
import type { Subtitle, SubtitleTrack, TranslationRequest, TranslationResponse } from '../types';

interface SubtitleContextType {
  // Subtitle tracks
  subtitleTracks: SubtitleTrack[];
  currentTrack: SubtitleTrack | null;
  currentSubtitle: Subtitle | null;
  loadingTracks: boolean;
  
  // Translation
  translations: { [key: string]: TranslationResponse };
  loadingTranslation: boolean;
  
  // Settings
  isSubtitleEnabled: boolean;
  subtitleSize: 'small' | 'medium' | 'large';
  subtitlePosition: 'bottom' | 'center';
  showOriginalText: boolean;
  
  // Actions
  loadSubtitleTracks: (contentId: string) => Promise<void>;
  setCurrentTrack: (track: SubtitleTrack) => void;
  updateCurrentSubtitle: (time: number) => void;
  translateSubtitle: (request: TranslationRequest) => Promise<TranslationResponse>;
  translateTrack: (track: SubtitleTrack, targetLanguage: string) => Promise<SubtitleTrack>;
  
  // Settings actions
  toggleSubtitles: () => void;
  setSubtitleSize: (size: 'small' | 'medium' | 'large') => void;
  setSubtitlePosition: (position: 'bottom' | 'center') => void;
  toggleOriginalText: () => void;
  
  // Utility
  searchSubtitles: (query: string) => Subtitle[];
  getAvailableLanguages: () => SubtitleLanguage[];
}

const SubtitleContext = createContext<SubtitleContextType | undefined>(undefined);

export const SubtitleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<SubtitleTrack | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [translations, setTranslations] = useState<{ [key: string]: TranslationResponse }>({});
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  
  // Settings
  const [isSubtitleEnabled, setIsSubtitleEnabled] = useState(true);
  const [subtitleSize, setSubtitleSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [subtitlePosition, setSubtitlePosition] = useState<'bottom' | 'center'>('bottom');
  const [showOriginalText, setShowOriginalText] = useState(false);

  // Load subtitle tracks for content
  const loadSubtitleTracks = useCallback(async (contentId: string) => {
    setLoadingTracks(true);
    try {
      const tracks = await subtitleService.getSubtitleTracks(contentId);
      setSubtitleTracks(tracks);
      
      // Set default track
      const defaultTrack = tracks.find(track => track.isDefault) || tracks[0];
      if (defaultTrack) {
        setCurrentTrack(defaultTrack);
      }
    } catch (error) {
      console.error('Failed to load subtitle tracks:', error);
    } finally {
      setLoadingTracks(false);
    }
  }, []);

  // Set current subtitle track
  const handleSetCurrentTrack = useCallback((track: SubtitleTrack) => {
    setCurrentTrack(track);
    setCurrentSubtitle(null); // Reset current subtitle
  }, []);

  // Update current subtitle based on time
  const updateCurrentSubtitle = useCallback((time: number) => {
    if (!currentTrack) return;
    
    const subtitle = subtitleService.getSubtitleAtTime(currentTrack.subtitles, time);
    setCurrentSubtitle(subtitle);
  }, [currentTrack]);

  // Translate subtitle text
  const translateSubtitle = useCallback(async (request: TranslationRequest): Promise<TranslationResponse> => {
    const key = `${request.fromLanguage}-${request.toLanguage}-${request.text}`;
    
    if (translations[key]) {
      return translations[key];
    }

    setLoadingTranslation(true);
    try {
      const translation = await subtitleService.translateSubtitle(request);
      setTranslations(prev => ({
        ...prev,
        [key]: translation,
      }));
      return translation;
    } catch (error) {
      console.error('Failed to translate subtitle:', error);
      throw error;
    } finally {
      setLoadingTranslation(false);
    }
  }, [translations]);

  // Translate entire track
  const translateTrack = useCallback(async (
    track: SubtitleTrack,
    targetLanguage: string
  ): Promise<SubtitleTrack> => {
    try {
      const translatedTrack = await subtitleService.translateSubtitleTrack(track, targetLanguage);
      
      // Add to tracks if not already present
      setSubtitleTracks(prev => {
        const exists = prev.some(t => t.id === translatedTrack.id);
        if (!exists) {
          return [...prev, translatedTrack];
        }
        return prev;
      });
      
      return translatedTrack;
    } catch (error) {
      console.error('Failed to translate track:', error);
      throw error;
    }
  }, []);

  // Settings actions
  const toggleSubtitles = useCallback(() => {
    setIsSubtitleEnabled(prev => !prev);
  }, []);

  const handleSetSubtitleSize = useCallback((size: 'small' | 'medium' | 'large') => {
    setSubtitleSize(size);
  }, []);

  const handleSetSubtitlePosition = useCallback((position: 'bottom' | 'center') => {
    setSubtitlePosition(position);
  }, []);

  const toggleOriginalText = useCallback(() => {
    setShowOriginalText(prev => !prev);
  }, []);

  // Utility functions
  const searchSubtitles = useCallback((query: string): Subtitle[] => {
    if (!currentTrack) return [];
    return subtitleService.searchSubtitles(currentTrack.subtitles, query);
  }, [currentTrack]);

  const getAvailableLanguages = useCallback((): SubtitleLanguage[] => {
    return subtitleService.SUPPORTED_LANGUAGES;
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('c-drama-jewel-subtitle-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setIsSubtitleEnabled(settings.isSubtitleEnabled ?? true);
        setSubtitleSize(settings.subtitleSize ?? 'medium');
        setSubtitlePosition(settings.subtitlePosition ?? 'bottom');
        setShowOriginalText(settings.showOriginalText ?? false);
      } catch (error) {
        console.error('Failed to load subtitle settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      isSubtitleEnabled,
      subtitleSize,
      subtitlePosition,
      showOriginalText,
    };
    localStorage.setItem('c-drama-jewel-subtitle-settings', JSON.stringify(settings));
  }, [isSubtitleEnabled, subtitleSize, subtitlePosition, showOriginalText]);

  return (
    <SubtitleContext.Provider value={{
      subtitleTracks,
      currentTrack,
      currentSubtitle,
      loadingTracks,
      translations,
      loadingTranslation,
      isSubtitleEnabled,
      subtitleSize,
      subtitlePosition,
      showOriginalText,
      loadSubtitleTracks,
      setCurrentTrack: handleSetCurrentTrack,
      updateCurrentSubtitle,
      translateSubtitle,
      translateTrack,
      toggleSubtitles,
      setSubtitleSize: handleSetSubtitleSize,
      setSubtitlePosition: handleSetSubtitlePosition,
      toggleOriginalText,
      searchSubtitles,
      getAvailableLanguages,
    }}>
      {children}
    </SubtitleContext.Provider>
  );
};

export const useSubtitle = () => {
  const context = useContext(SubtitleContext);
  if (context === undefined) {
    throw new Error('useSubtitle must be used within a SubtitleProvider');
  }
  return context;
};


