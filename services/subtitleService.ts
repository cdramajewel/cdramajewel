import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { Subtitle, SubtitleTrack, TranslationRequest, TranslationResponse } from '../types';

export interface SubtitleLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: SubtitleLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

class SubtitleService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  /**
   * Translate subtitle text using AI
   */
  async translateSubtitle(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const languageMap = {
        'en': 'English',
        'hi': 'Hindi',
        'zh': 'Chinese (Simplified)',
        'ko': 'Korean',
        'ja': 'Japanese',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
      };

      const fromLang = languageMap[request.fromLanguage as keyof typeof languageMap] || request.fromLanguage;
      const toLang = languageMap[request.toLanguage as keyof typeof languageMap] || request.toLanguage;

      const prompt = `
        Translate the following text from ${fromLang} to ${toLang}.
        This is subtitle text for a C-Drama/K-Drama, so maintain the emotional tone and context.
        Keep the translation natural and culturally appropriate.
        ${request.context ? `Context: ${request.context}` : ''}
        
        Text to translate: "${request.text}"
        
        Return only the translated text, nothing else.
      `;

      const { text } = await generateText({
        model: openai('gpt-3.5-turbo'),
        prompt,
        temperature: 0.3,
      });

      return {
        originalText: request.text,
        translatedText: text.trim(),
        fromLanguage: request.fromLanguage,
        toLanguage: request.toLanguage,
        confidence: 0.9,
      };
    } catch (error) {
      console.error('Translation Error:', error);
      return this.getFallbackTranslation(request);
    }
  }

  /**
   * Translate entire subtitle track
   */
  async translateSubtitleTrack(
    track: SubtitleTrack,
    targetLanguage: string
  ): Promise<SubtitleTrack> {
    try {
      const translatedSubtitles: Subtitle[] = [];

      for (const subtitle of track.subtitles) {
        const translation = await this.translateSubtitle({
          text: subtitle.content,
          fromLanguage: track.languageCode,
          toLanguage: targetLanguage,
          context: 'C-Drama subtitle',
        });

        translatedSubtitles.push({
          ...subtitle,
          translatedContent: translation.translatedText,
          translatedLanguage: targetLanguage,
        });
      }

      return {
        ...track,
        id: `${track.id}_${targetLanguage}`,
        language: SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage,
        languageCode: targetLanguage,
        subtitles: translatedSubtitles,
      };
    } catch (error) {
      console.error('Subtitle Track Translation Error:', error);
      return track;
    }
  }

  /**
   * Generate subtitles for content (mock implementation)
   */
  generateMockSubtitles(contentId: string, language: string = 'en'): SubtitleTrack {
    const mockSubtitles: Subtitle[] = [
      {
        id: '1',
        language,
        languageCode: language,
        content: language === 'hi' ? 'नमस्ते, आप कैसे हैं?' : 
                 language === 'zh' ? '你好，你好吗？' : 
                 'Hello, how are you?',
        startTime: 0,
        endTime: 3,
      },
      {
        id: '2',
        language,
        languageCode: language,
        content: language === 'hi' ? 'मैं ठीक हूँ, धन्यवाद।' : 
                 language === 'zh' ? '我很好，谢谢。' : 
                 'I am fine, thank you.',
        startTime: 3,
        endTime: 6,
      },
      {
        id: '3',
        language,
        languageCode: language,
        content: language === 'hi' ? 'यह एक बहुत अच्छी कहानी है।' : 
                 language === 'zh' ? '这是一个很好的故事。' : 
                 'This is a very good story.',
        startTime: 6,
        endTime: 9,
      },
      {
        id: '4',
        language,
        languageCode: language,
        content: language === 'hi' ? 'मुझे इसे देखना पसंद है।' : 
                 language === 'zh' ? '我喜欢看这个。' : 
                 'I love watching this.',
        startTime: 9,
        endTime: 12,
      },
      {
        id: '5',
        language,
        languageCode: language,
        content: language === 'hi' ? 'क्या आप भी इसे पसंद करते हैं?' : 
                 language === 'zh' ? '你也喜欢这个吗？' : 
                 'Do you like it too?',
        startTime: 12,
        endTime: 15,
      },
    ];

    return {
      id: `${contentId}_${language}`,
      language: SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || language,
      languageCode: language,
      subtitles: mockSubtitles,
      isDefault: language === 'en',
    };
  }

  /**
   * Get available subtitle tracks for content
   */
  async getSubtitleTracks(contentId: string): Promise<SubtitleTrack[]> {
    try {
      // In a real implementation, this would fetch from a database or API
      // For now, we'll generate mock tracks
      const tracks: SubtitleTrack[] = [
        this.generateMockSubtitles(contentId, 'en'),
        this.generateMockSubtitles(contentId, 'hi'),
        this.generateMockSubtitles(contentId, 'zh'),
      ];

      return tracks;
    } catch (error) {
      console.error('Error fetching subtitle tracks:', error);
      return [this.generateMockSubtitles(contentId, 'en')];
    }
  }

  /**
   * Parse SRT subtitle format
   */
  parseSRT(srtContent: string): Subtitle[] {
    const subtitles: Subtitle[] = [];
    const blocks = srtContent.trim().split(/\n\s*\n/);

    blocks.forEach((block, index) => {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
        if (timeMatch) {
          const startTime = this.parseTimeToSeconds(timeMatch[1]);
          const endTime = this.parseTimeToSeconds(timeMatch[2]);
          const content = lines.slice(2).join('\n');

          subtitles.push({
            id: (index + 1).toString(),
            language: 'Unknown',
            languageCode: 'unknown',
            content,
            startTime,
            endTime,
          });
        }
      }
    });

    return subtitles;
  }

  /**
   * Convert SRT time format to seconds
   */
  private parseTimeToSeconds(timeString: string): number {
    const [time, milliseconds] = timeString.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
  }

  /**
   * Convert seconds to SRT time format
   */
  secondsToSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  /**
   * Generate SRT content from subtitles
   */
  generateSRT(subtitles: Subtitle[]): string {
    return subtitles.map((subtitle, index) => {
      const startTime = this.secondsToSRTTime(subtitle.startTime);
      const endTime = this.secondsToSRTTime(subtitle.endTime);
      
      return `${index + 1}\n${startTime} --> ${endTime}\n${subtitle.content}`;
    }).join('\n\n');
  }

  /**
   * Get subtitle at specific time
   */
  getSubtitleAtTime(subtitles: Subtitle[], time: number): Subtitle | null {
    return subtitles.find(subtitle => 
      time >= subtitle.startTime && time <= subtitle.endTime
    ) || null;
  }

  /**
   * Search subtitles by text
   */
  searchSubtitles(subtitles: Subtitle[], query: string): Subtitle[] {
    const lowerQuery = query.toLowerCase();
    return subtitles.filter(subtitle =>
      subtitle.content.toLowerCase().includes(lowerQuery) ||
      (subtitle.translatedContent && subtitle.translatedContent.toLowerCase().includes(lowerQuery))
    );
  }

  // Helper methods
  private getFallbackTranslation(request: TranslationRequest): TranslationResponse {
    // Simple fallback translations
    const fallbackTranslations: { [key: string]: { [key: string]: string } } = {
      'hi': {
        'en': 'Hello, how are you?',
        'zh': '你好，你好吗？',
      },
      'en': {
        'hi': 'नमस्ते, आप कैसे हैं?',
        'zh': '你好，你好吗？',
      },
      'zh': {
        'en': 'Hello, how are you?',
        'hi': 'नमस्ते, आप कैसे हैं?',
      },
    };

    const translatedText = fallbackTranslations[request.fromLanguage]?.[request.toLanguage] || request.text;

    return {
      originalText: request.text,
      translatedText,
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      confidence: 0.5,
    };
  }
}

export const subtitleService = new SubtitleService();


