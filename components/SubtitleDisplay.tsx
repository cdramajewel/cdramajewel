import React, { useState, useEffect } from 'react';
import { useSubtitle } from '../context/SubtitleContext';
import Spinner from './Spinner';

interface SubtitleDisplayProps {
  currentTime: number;
  className?: string;
}

const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({ currentTime, className = '' }) => {
  const {
    currentSubtitle,
    isSubtitleEnabled,
    subtitleSize,
    subtitlePosition,
    showOriginalText,
    updateCurrentSubtitle,
    translateSubtitle,
    loadingTranslation,
  } = useSubtitle();

  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Update current subtitle when time changes
  useEffect(() => {
    updateCurrentSubtitle(currentTime);
  }, [currentTime, updateCurrentSubtitle]);

  // Handle translation when subtitle changes
  useEffect(() => {
    if (currentSubtitle && currentSubtitle.translatedContent) {
      setTranslatedText(currentSubtitle.translatedContent);
    } else if (currentSubtitle && !currentSubtitle.translatedContent) {
      // Auto-translate if no translation exists
      handleAutoTranslate();
    } else {
      setTranslatedText('');
    }
  }, [currentSubtitle]);

  const handleAutoTranslate = async () => {
    if (!currentSubtitle || isTranslating) return;

    setIsTranslating(true);
    try {
      // Determine target language based on user preference or default to English
      const targetLanguage = 'en'; // You can make this configurable
      
      const translation = await translateSubtitle({
        text: currentSubtitle.content,
        fromLanguage: currentSubtitle.languageCode,
        toLanguage: targetLanguage,
        context: 'C-Drama subtitle',
      });

      setTranslatedText(translation.translatedText);
    } catch (error) {
      console.error('Auto-translation failed:', error);
      setTranslatedText(currentSubtitle.content);
    } finally {
      setIsTranslating(false);
    }
  };

  if (!isSubtitleEnabled || !currentSubtitle) {
    return null;
  }

  const getSizeClasses = () => {
    switch (subtitleSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-xl';
      default: return 'text-base';
    }
  };

  const getPositionClasses = () => {
    switch (subtitlePosition) {
      case 'center': return 'items-center justify-center';
      default: return 'items-end justify-center';
    }
  };

  return (
    <div className={`absolute inset-0 flex ${getPositionClasses()} pointer-events-none z-10 ${className}`}>
      <div className={`${subtitlePosition === 'bottom' ? 'mb-8' : ''} max-w-4xl px-4`}>
        <div className="bg-black/80 backdrop-blur-sm rounded-logo p-4 text-center border border-dark-border">
          {/* Original Text */}
          {showOriginalText && (
            <div className={`${getSizeClasses()} text-dark-text mb-2 font-medium`}>
              {currentSubtitle.content}
            </div>
          )}
          
          {/* Translated Text */}
          <div className={`${getSizeClasses()} text-dark-text font-semibold`}>
            {isTranslating || loadingTranslation ? (
              <div className="flex items-center justify-center space-x-2">
                <Spinner />
                <span className="text-sm">Translating...</span>
              </div>
            ) : (
              translatedText || currentSubtitle.content
            )}
          </div>
          
          {/* Language Indicator */}
          <div className="text-xs text-dark-text-secondary mt-2 opacity-75">
            {currentSubtitle.languageCode.toUpperCase()}
            {translatedText && translatedText !== currentSubtitle.content && ' → EN'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtitleDisplay;
