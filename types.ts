export enum ContentType {
  KDrama = "Korean Drama",
  CDrama = "Chinese Drama",
  WebSeries = "Web Series",
  Movie = "Movie",
  Anime = "Anime",
  TVShow = "TV Show",
}

export enum Genre {
  Romance = "Romance",
  Mystery = "Mystery",
  Comedy = "Comedy",
  Action = "Action",
  Adventure = "Adventure",
  Fantasy = "Fantasy",
  Thriller = "Thriller",
  Horror = "Horror",
  SciFi = "Sci-Fi",
  Drama = "Drama",
}

export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  duration: number; // in seconds
  videoUrl: string; // mock URL
}

export interface AdRule {
  fromEpisode: number;
  toEpisode: number;
  adCount: number;
}

export interface Content {
  id: string;
  title:string;
  description: string;
  posterUrl: string;
  type: ContentType;
  genres: Genre[];
  episodes?: Episode[];
  adRules: AdRule[];
  views: number;
  releaseYear: number;
  featured?: boolean;
}

export interface User {
  email: string;
}

export interface WatchProgressItem {
  episodeIndex: number;
  timestamp: number;
  duration: number;
}

export interface WatchProgress {
  [contentId: string]: WatchProgressItem;
}

export interface Subtitle {
  id: string;
  language: string;
  languageCode: string;
  content: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  translatedContent?: string;
  translatedLanguage?: string;
}

export interface SubtitleTrack {
  id: string;
  language: string;
  languageCode: string;
  subtitles: Subtitle[];
  isDefault?: boolean;
}

export interface TranslationRequest {
  text: string;
  fromLanguage: string;
  toLanguage: string;
  context?: string;
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  confidence: number;
}