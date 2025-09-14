import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { Content, Genre, ContentType } from '../types';

export interface AIRecommendation {
  contentId: string;
  title: string;
  reason: string;
  confidence: number;
  tags: string[];
}

export interface AIContentAnalysis {
  mood: string;
  themes: string[];
  targetAudience: string;
  emotionalTone: string;
  complexity: 'Simple' | 'Moderate' | 'Complex';
  bingeability: number; // 1-10 scale
  similarContent: string[];
}

export interface AISearchResult {
  query: string;
  results: Content[];
  suggestions: string[];
  filters: {
    genres: Genre[];
    types: ContentType[];
    years: number[];
  };
}

class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  /**
   * Get AI-powered content recommendations based on user preferences
   */
  async getRecommendations(
    userPreferences: {
      likedGenres: Genre[];
      watchedContent: string[];
      preferredTypes: ContentType[];
    },
    allContent: Content[]
  ): Promise<AIRecommendation[]> {
    try {
      const prompt = `
        Based on the user's preferences and viewing history, recommend 5 C-Drama/K-Drama content items.
        
        User Preferences:
        - Liked Genres: ${userPreferences.likedGenres.join(', ')}
        - Watched Content IDs: ${userPreferences.watchedContent.join(', ')}
        - Preferred Types: ${userPreferences.preferredTypes.join(', ')}
        
        Available Content:
        ${allContent.map(c => `${c.id}: ${c.title} (${c.type}, ${c.genres.join(', ')}, ${c.releaseYear})`).join('\n')}
        
        Return recommendations in this format:
        {
          "recommendations": [
            {
              "contentId": "content-id",
              "title": "Content Title",
              "reason": "Why this is recommended",
              "confidence": 0.85,
              "tags": ["tag1", "tag2"]
            }
          ]
        }
      `;

      const { text } = await generateText({
        model: openai('gpt-3.5-turbo'),
        prompt,
        temperature: 0.7,
      });

      const result = JSON.parse(text);
      return result.recommendations || [];
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      return this.getFallbackRecommendations(userPreferences, allContent);
    }
  }

  /**
   * Analyze content using AI to extract themes, mood, and characteristics
   */
  async analyzeContent(content: Content): Promise<AIContentAnalysis> {
    try {
      const prompt = `
        Analyze this C-Drama/K-Drama content and provide detailed insights:
        
        Title: ${content.title}
        Description: ${content.description}
        Type: ${content.type}
        Genres: ${content.genres.join(', ')}
        Release Year: ${content.releaseYear}
        
        Provide analysis in this format:
        {
          "mood": "Overall mood/atmosphere",
          "themes": ["theme1", "theme2", "theme3"],
          "targetAudience": "Primary audience description",
          "emotionalTone": "Emotional tone description",
          "complexity": "Simple|Moderate|Complex",
          "bingeability": 8,
          "similarContent": ["similar title 1", "similar title 2"]
        }
      `;

      const { text } = await generateText({
        model: openai('gpt-3.5-turbo'),
        prompt,
        temperature: 0.5,
      });

      const result = JSON.parse(text);
      return {
        mood: result.mood || 'Unknown',
        themes: result.themes || [],
        targetAudience: result.targetAudience || 'General',
        emotionalTone: result.emotionalTone || 'Neutral',
        complexity: result.complexity || 'Moderate',
        bingeability: result.bingeability || 5,
        similarContent: result.similarContent || [],
      };
    } catch (error) {
      console.error('AI Content Analysis Error:', error);
      return this.getFallbackAnalysis(content);
    }
  }

  /**
   * AI-powered search with intelligent suggestions
   */
  async searchContent(
    query: string,
    allContent: Content[]
  ): Promise<AISearchResult> {
    try {
      const prompt = `
        Search for C-Drama/K-Drama content based on this query: "${query}"
        
        Available Content:
        ${allContent.map(c => `${c.id}: ${c.title} (${c.type}, ${c.genres.join(', ')}, ${c.releaseYear}) - ${c.description}`).join('\n')}
        
        Return search results in this format:
        {
          "query": "${query}",
          "results": ["content-id-1", "content-id-2"],
          "suggestions": ["suggestion1", "suggestion2"],
          "filters": {
            "genres": ["Romance", "Drama"],
            "types": ["Korean Drama", "Chinese Drama"],
            "years": [2023, 2024]
          }
        }
      `;

      const { text } = await generateText({
        model: openai('gpt-3.5-turbo'),
        prompt,
        temperature: 0.6,
      });

      const result = JSON.parse(text);
      const foundContent = allContent.filter(c => 
        result.results.includes(c.id)
      );

      return {
        query: result.query || query,
        results: foundContent,
        suggestions: result.suggestions || [],
        filters: result.filters || { genres: [], types: [], years: [] },
      };
    } catch (error) {
      console.error('AI Search Error:', error);
      return this.getFallbackSearch(query, allContent);
    }
  }

  /**
   * Generate content descriptions using AI
   */
  async generateContentDescription(
    title: string,
    type: ContentType,
    genres: Genre[]
  ): Promise<string> {
    try {
      const prompt = `
        Generate an engaging description for a ${type} titled "${title}" with genres: ${genres.join(', ')}.
        Make it compelling and accurate to the genre conventions.
        Keep it between 100-150 words.
      `;

      const { text } = await generateText({
        model: openai('gpt-3.5-turbo'),
        prompt,
        temperature: 0.8,
      });

      return text;
    } catch (error) {
      console.error('AI Description Generation Error:', error);
      return `An engaging ${type.toLowerCase()} featuring ${genres.join(' and ')} themes.`;
    }
  }

  /**
   * Get personalized watchlist suggestions
   */
  async getWatchlistSuggestions(
    watchHistory: string[],
    allContent: Content[]
  ): Promise<Content[]> {
    try {
      const watchedContent = allContent.filter(c => watchHistory.includes(c.id));
      const unwatchedContent = allContent.filter(c => !watchHistory.includes(c.id));

      // Simple recommendation logic based on genres and types
      const userGenres = new Set<string>();
      const userTypes = new Set<string>();

      watchedContent.forEach(content => {
        content.genres.forEach(genre => userGenres.add(genre));
        userTypes.add(content.type);
      });

      const recommendations = unwatchedContent
        .map(content => ({
          content,
          score: this.calculateRecommendationScore(content, userGenres, userTypes),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(item => item.content);

      return recommendations;
    } catch (error) {
      console.error('AI Watchlist Suggestions Error:', error);
      return allContent.slice(0, 10);
    }
  }

  // Helper methods
  private calculateRecommendationScore(
    content: Content,
    userGenres: Set<string>,
    userTypes: Set<string>
  ): number {
    let score = 0;
    
    // Genre matching
    content.genres.forEach(genre => {
      if (userGenres.has(genre)) score += 2;
    });
    
    // Type matching
    if (userTypes.has(content.type)) score += 1;
    
    // Recency bonus
    const currentYear = new Date().getFullYear();
    if (content.releaseYear >= currentYear - 2) score += 1;
    
    // Featured content bonus
    if (content.featured) score += 1;
    
    return score;
  }

  private getFallbackRecommendations(
    userPreferences: any,
    allContent: Content[]
  ): AIRecommendation[] {
    return allContent
      .filter(content => 
        content.genres.some(genre => userPreferences.likedGenres.includes(genre))
      )
      .slice(0, 5)
      .map(content => ({
        contentId: content.id,
        title: content.title,
        reason: `Recommended based on your interest in ${content.genres.join(' and ')}`,
        confidence: 0.7,
        tags: content.genres,
      }));
  }

  private getFallbackAnalysis(content: Content): AIContentAnalysis {
    return {
      mood: 'Engaging',
      themes: content.genres,
      targetAudience: 'General',
      emotionalTone: 'Varied',
      complexity: 'Moderate',
      bingeability: 7,
      similarContent: [],
    };
  }

  private getFallbackSearch(query: string, allContent: Content[]): AISearchResult {
    const results = allContent.filter(content =>
      content.title.toLowerCase().includes(query.toLowerCase()) ||
      content.description.toLowerCase().includes(query.toLowerCase()) ||
      content.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
    );

    return {
      query,
      results,
      suggestions: ['Try searching for specific genres', 'Search by year'],
      filters: { genres: [], types: [], years: [] },
    };
  }
}

export const aiService = new AIService();


