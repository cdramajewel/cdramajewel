import React, { useState } from 'react';
import { useSubtitle } from '../context/SubtitleContext';
import type { SubtitleLanguage } from '../services/subtitleService';

interface SubtitleControlsProps {
  className?: string;
}

const SubtitleControls: React.FC<SubtitleControlsProps> = ({ className = '' }) => {
  const {
    subtitleTracks,
    currentTrack,
    isSubtitleEnabled,
    subtitleSize,
    subtitlePosition,
    showOriginalText,
    loadingTracks,
    setCurrentTrack,
    toggleSubtitles,
    setSubtitleSize,
    setSubtitlePosition,
    toggleOriginalText,
    translateTrack,
    getAvailableLanguages,
  } = useSubtitle();

  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTrackChange = async (trackId: string) => {
    const track = subtitleTracks.find(t => t.id === trackId);
    if (track) {
      setCurrentTrack(track);
    }
  };

  const handleTranslateTrack = async (targetLanguage: string) => {
    if (!currentTrack || isTranslating) return;

    setIsTranslating(true);
    try {
      await translateTrack(currentTrack, targetLanguage);
    } catch (error) {
      console.error('Failed to translate track:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const availableLanguages = getAvailableLanguages();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary flex items-center space-x-2"
      >
        <span>📝</span>
        <span>Subtitles</span>
        {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-dark-card rounded-logo shadow-logo-lg p-4 min-w-80 z-50 border border-dark-border">
          <div className="space-y-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-dark-text font-medium">Enable Subtitles</label>
              <button
                onClick={toggleSubtitles}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isSubtitleEnabled ? 'bg-dark-accent' : 'bg-dark-text-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-dark-text transition-transform ${
                    isSubtitleEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Subtitle Track Selection */}
            {isSubtitleEnabled && (
              <div>
                <label className="text-dark-text font-medium mb-2 block">Subtitle Track</label>
                {loadingTracks ? (
                  <div className="text-dark-text-secondary text-sm">Loading tracks...</div>
                ) : (
                  <select
                    value={currentTrack?.id || ''}
                    onChange={(e) => handleTrackChange(e.target.value)}
                    className="w-full p-2 border border-dark-accent rounded-logo bg-dark-card text-dark-text"
                  >
                    {subtitleTracks.map(track => (
                      <option key={track.id} value={track.id}>
                        {track.language} ({track.languageCode.toUpperCase()})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Translation Options */}
            {isSubtitleEnabled && currentTrack && (
              <div>
                <label className="text-dark-text font-medium mb-2 block">Quick Translate</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableLanguages
                    .filter(lang => lang.code !== currentTrack.languageCode)
                    .slice(0, 4)
                    .map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleTranslateTrack(lang.code)}
                        disabled={isTranslating}
                        className="text-xs bg-dark-surface text-dark-text px-3 py-2 rounded-logo hover:bg-dark-border transition-colors disabled:opacity-50"
                      >
                        {isTranslating ? '...' : lang.nativeName}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Subtitle Size */}
            {isSubtitleEnabled && (
              <div>
                <label className="text-dark-text font-medium mb-2 block">Size</label>
                <div className="flex space-x-2">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setSubtitleSize(size)}
                      className={`px-3 py-2 rounded-logo text-sm capitalize transition-colors ${
                        subtitleSize === size
                          ? 'bg-dark-accent text-dark-text'
                          : 'bg-dark-surface text-dark-text hover:bg-dark-border'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subtitle Position */}
            {isSubtitleEnabled && (
              <div>
                <label className="text-dark-text font-medium mb-2 block">Position</label>
                <div className="flex space-x-2">
                  {(['bottom', 'center'] as const).map(position => (
                    <button
                      key={position}
                      onClick={() => setSubtitlePosition(position)}
                      className={`px-3 py-2 rounded-logo text-sm capitalize transition-colors ${
                        subtitlePosition === position
                          ? 'bg-dark-accent text-dark-text'
                          : 'bg-dark-surface text-dark-text hover:bg-dark-border'
                      }`}
                    >
                      {position}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show Original Text */}
            {isSubtitleEnabled && (
              <div className="flex items-center justify-between">
                <label className="text-dark-text font-medium">Show Original Text</label>
                <button
                  onClick={toggleOriginalText}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showOriginalText ? 'bg-dark-accent' : 'bg-dark-text-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-dark-text transition-transform ${
                      showOriginalText ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Current Subtitle Info */}
            {isSubtitleEnabled && currentTrack && (
              <div className="pt-4 border-t border-dark-border">
                <div className="text-sm text-dark-text-secondary">
                  <div>Track: {currentTrack.language}</div>
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

export default SubtitleControls;
