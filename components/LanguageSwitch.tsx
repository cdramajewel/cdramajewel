import React, { useState } from 'react';
import { useSubtitle } from '../context/SubtitleContext';
import type { SubtitleLanguage } from '../services/subtitleService';

interface LanguageSwitchProps {
  className?: string;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ className = '' }) => {
  const {
    subtitleTracks,
    currentTrack,
    setCurrentTrack,
    translateTrack,
    loadingTracks,
  } = useSubtitle();

  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const availableLanguages: SubtitleLanguage[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
  ];

  const handleLanguageChange = async (languageCode: string) => {
    // Check if track already exists
    const existingTrack = subtitleTracks.find(track => track.languageCode === languageCode);
    
    if (existingTrack) {
      setCurrentTrack(existingTrack);
    } else if (currentTrack) {
      // Translate current track to new language
      setIsTranslating(true);
      try {
        const translatedTrack = await translateTrack(currentTrack, languageCode);
        setCurrentTrack(translatedTrack);
      } catch (error) {
        console.error('Failed to translate track:', error);
      } finally {
        setIsTranslating(false);
      }
    }
    
    setIsOpen(false);
  };

  const getCurrentLanguage = () => {
    if (!currentTrack) return { code: 'en', name: 'English', nativeName: 'English' };
    return availableLanguages.find(lang => lang.code === currentTrack.languageCode) || 
           { code: currentTrack.languageCode, name: currentTrack.language, nativeName: currentTrack.language };
  };

  const currentLanguage = getCurrentLanguage();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary flex items-center space-x-2"
        disabled={loadingTracks}
      >
        <span>🌐</span>
        <span>{currentLanguage.nativeName}</span>
        {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-dark-card rounded-logo shadow-logo-lg p-4 min-w-64 z-50 border border-dark-border">
          <div className="space-y-2">
            <h4 className="text-dark-text font-semibold mb-3 text-center">Select Language</h4>
            
            {/* Available Tracks */}
            {subtitleTracks.length > 0 && (
              <div className="mb-4">
                <h5 className="text-dark-text-secondary text-sm font-medium mb-2">Available Tracks</h5>
                <div className="space-y-1">
                  {subtitleTracks.map(track => (
                    <button
                      key={track.id}
                      onClick={() => {
                        setCurrentTrack(track);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-logo text-sm transition-colors ${
                        currentTrack?.id === track.id
                          ? 'bg-dark-accent text-white'
                          : 'bg-dark-surface text-dark-text hover:bg-dark-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{track.language}</span>
                        <span className="text-xs opacity-75">({track.languageCode.toUpperCase()})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Translate */}
            <div>
              <h5 className="text-dark-text-secondary text-sm font-medium mb-2">Quick Translate</h5>
              <div className="grid grid-cols-2 gap-2">
                {availableLanguages
                  .filter(lang => lang.code !== currentTrack?.languageCode)
                  .slice(0, 6)
                  .map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      disabled={isTranslating}
                      className="text-xs bg-dark-surface text-dark-text px-3 py-2 rounded-logo hover:bg-dark-border transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                    >
                      {isTranslating ? (
                        <span>...</span>
                      ) : (
                        <>
                          <span>{lang.nativeName}</span>
                          <span className="text-xs opacity-75">({lang.code.toUpperCase()})</span>
                        </>
                      )}
                    </button>
                  ))}
              </div>
            </div>

            {/* Popular Combinations */}
            <div className="pt-3 border-t border-dark-border">
              <h5 className="text-dark-text-secondary text-sm font-medium mb-2">Popular</h5>
              <div className="space-y-1">
                <button
                  onClick={() => handleLanguageChange('hi')}
                  disabled={isTranslating}
                  className="w-full text-left px-3 py-2 rounded-logo text-sm bg-dark-surface text-dark-text hover:bg-dark-border transition-colors disabled:opacity-50"
                >
                  🇮🇳 Hindi (हिन्दी)
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  disabled={isTranslating}
                  className="w-full text-left px-3 py-2 rounded-logo text-sm bg-dark-surface text-dark-text hover:bg-dark-border transition-colors disabled:opacity-50"
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => handleLanguageChange('zh')}
                  disabled={isTranslating}
                  className="w-full text-left px-3 py-2 rounded-logo text-sm bg-dark-surface text-dark-text hover:bg-dark-border transition-colors disabled:opacity-50"
                >
                  🇨🇳 Chinese (中文)
                </button>
              </div>
            </div>

            {/* Current Status */}
            {currentTrack && (
              <div className="pt-3 border-t border-dark-border">
                <div className="text-xs text-dark-text-secondary">
                  <div>Current: {currentTrack.language}</div>
                  <div>Subtitles: {currentTrack.subtitles.length}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitch;


