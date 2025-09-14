import React from 'react';
import { Link } from 'react-router-dom';
import type { Content, WatchProgressItem } from '../types';

interface ContentCardProps {
  item: Content & { progress?: WatchProgressItem };
}

const ContentCard: React.FC<ContentCardProps> = ({ item }) => {
  const linkTo = item.progress 
    ? `/play/${item.id}/${item.progress.episodeIndex}` 
    : `/content/${item.id}`;

  const progressPercentage = item.progress 
    ? (item.progress.timestamp / item.progress.duration) * 100 
    : 0;
    
  return (
    <Link to={linkTo} className="block group flex-shrink-0 w-40 sm:w-48 md:w-56 m-2 text-dark-text no-underline">
      <div className="flex flex-col h-full">
        <div className="relative rounded-logo overflow-hidden shadow-logo content-card">
          <div className="transition-transform duration-300 ease-in-out group-hover:scale-105">
            <img src={item.posterUrl} alt={item.title} className="w-full h-auto aspect-[2/3] object-cover" />
          </div>
          
          {item.progress && (
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-dark-text-muted/70">
                  <div 
                      className="h-full bg-dark-accent" 
                      style={{ width: `${progressPercentage}%` }}
                  ></div>
              </div>
          )}
          
          {/* Overlay with play icon */}
          <div className="absolute inset-0 bg-dark-accent/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-dark-text/90 transform scale-75 group-hover:scale-100 transition-transform logo-glow" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="pt-3 px-1">
            <h3 className="font-bold text-sm sm:text-base truncate group-hover:text-dark-accent transition-colors">{item.title}</h3>
            <p className="text-xs text-dark-text-secondary truncate">{item.genres.join(' • ')}</p>
        </div>
      </div>
    </Link>
  );
};

export default ContentCard;
