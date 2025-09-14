import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { useSubtitle } from '../context/SubtitleContext';
import Spinner from '../components/Spinner';
import SubtitleDisplay from '../components/SubtitleDisplay';
import SubtitleControls from '../components/SubtitleControls';
import LanguageSwitch from '../components/LanguageSwitch';
import type { Content, Episode } from '../types';

const PlayerPage: React.FC = () => {
  const { contentId, episodeIndex: episodeIndexStr } = useParams<{ contentId: string; episodeIndex: string }>();
  const episodeIndex = episodeIndexStr ? parseInt(episodeIndexStr, 10) : 0;

  const { getContentById, updateWatchProgress, loading, getContinueWatchingContent } = useContent();
  const { loadSubtitleTracks } = useSubtitle();
  const navigate = useNavigate();

  const [content, setContent] = useState<Content | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [adCount, setAdCount] = useState<number>(0);
  const [isShowingAd, setIsShowingAd] = useState(true);
  const [adCountdown, setAdCountdown] = useState(5);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  
  useEffect(() => {
    if (loading) return;
    if (contentId) {
      const foundContent = getContentById(contentId);
      if (foundContent) {
        setContent(foundContent);
        if (foundContent.episodes && foundContent.episodes[episodeIndex]) {
          const episode = foundContent.episodes[episodeIndex];
          setCurrentEpisode(episode);
          
          // Load subtitle tracks for this content
          loadSubtitleTracks(contentId);
          
          const rule = foundContent.adRules.find(r => 
            episode.episodeNumber >= r.fromEpisode && episode.episodeNumber <= r.toEpisode
          );
          
          const adCountToShow = rule ? rule.adCount : 0;
          setAdCount(adCountToShow);
          
          if (adCountToShow > 0) {
            setIsShowingAd(true);
            setAdCountdown(5);
          } else {
            setIsShowingAd(false);
          }
        }
      }
    }
  }, [contentId, episodeIndex, getContentById, loading, loadSubtitleTracks]);

  useEffect(() => {
    let adTimer: NodeJS.Timeout;
    if (isShowingAd && adCount > 0) {
      adTimer = setInterval(() => {
        setAdCountdown(prev => {
          if (prev <= 1) {
            clearInterval(adTimer);
            setIsShowingAd(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(adTimer);
  }, [isShowingAd, adCount]);
  
  useEffect(() => {
      if (!isShowingAd && videoRef.current) {
        const continueWatchingList = getContinueWatchingContent();
        const progress = continueWatchingList.find(c => c.id === contentId)?.progress;
        
        if (progress && progress.episodeIndex === episodeIndex && progress.timestamp > 1) {
            videoRef.current.currentTime = progress.timestamp;
        }

        videoRef.current.play().catch(error => console.error("Autoplay failed:", error));
      }
  }, [isShowingAd, contentId, episodeIndex, getContinueWatchingContent]);

  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (videoRef.current && contentId) {
            const { currentTime: currentT, duration: dur } = videoRef.current;
            if (!isNaN(dur) && dur > 0) {
                updateWatchProgress(contentId, {
                    episodeIndex,
                    timestamp: currentT,
                    duration: dur,
                });
            }
        }
      }, 5000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, contentId, episodeIndex, updateWatchProgress]);


  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
            setShowControls(false);
        }
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) setShowControls(false);
  }

  const handleEpisodeEnd = useCallback(() => {
    if (content?.episodes && episodeIndex < content.episodes.length - 1) {
      navigate(`/play/${contentId}/${episodeIndex + 1}`);
    }
  }, [content, episodeIndex, contentId, navigate]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.currentTime > 5 && videoRef.current.currentTime < 20) {
        setShowSkipIntro(true);
      } else if (showSkipIntro) {
        setShowSkipIntro(false);
      }
    }
  };
  
  const handleLoadedMetadata = () => {
      if (videoRef.current) {
          setDuration(videoRef.current.duration);
      }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Number(e.target.value);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const skipIntro = () => {
    if(videoRef.current) {
      videoRef.current.currentTime = 20;
      setShowSkipIntro(false);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds === 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (loading) {
    return <div className="h-screen bg-black flex items-center justify-center"><Spinner /></div>;
  }

  if (!content || !currentEpisode) {
    return <div className="text-center text-xl mt-10">Content or episode not found.</div>;
  }
  
  const hasNextEpisode = content.episodes && episodeIndex < content.episodes.length - 1;

  return (
    <div className="bg-black text-white min-h-screen">
       <style>{`
          .custom-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            background-color: #a78bfa;
            border-radius: 50%;
            cursor: pointer;
            margin-top: -6px; /* Adjust to center */
            transition: transform 0.2s;
          }
          .custom-range:hover::-webkit-slider-thumb {
            transform: scale(1.1);
          }
          .custom-range::-webkit-slider-runnable-track {
            height: 4px;
            border-radius: 2px;
          }
        `}</style>
        <div 
          ref={playerContainerRef}
          className="aspect-video relative bg-black"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
        {isShowingAd && adCount > 0 ? (
            <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center">
                <p className="text-2xl mb-4">Your program will start after {adCount} ad(s).</p>
                <p className="text-lg">Ad playing... resuming in {adCountdown}s</p>
            </div>
        ) : (
          <>
            <video 
              ref={videoRef}
              src={currentEpisode.videoUrl} 
              className="w-full h-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEpisodeEnd}
              onClick={togglePlayPause}
            />
            
            {/* Subtitle Display */}
            <SubtitleDisplay currentTime={currentTime} />
            {showSkipIntro && (
                <button
                    onClick={skipIntro}
                    className="absolute bottom-24 right-4 bg-black/70 text-white px-4 py-2 rounded-md hover:bg-black transition-all z-20"
                >
                    Skip Intro
                </button>
            )}
            <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 space-y-3">
                    <div className="relative w-full group">
                      <input
                        type="range"
                        min="0"
                        max={duration || 1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 appearance-none bg-transparent cursor-pointer custom-range z-20 relative"
                        style={{ 
                          background: `linear-gradient(to right, #8b5cf6 ${progressPercentage}%, #4b5563 ${progressPercentage}%)` 
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button onClick={togglePlayPause}>
                                {isPlaying ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 001 1h1a1 1 0 001-1V9a1 1 0 00-1-1H7zm5 0a1 1 0 00-1 1v2a1 1 0 001 1h1a1 1 0 001-1V9a1 1 0 00-1-1h-1z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                )}
                            </button>
                            <div className="flex items-center space-x-2">
                                <button onClick={toggleMute}>
                                    {isMuted || volume === 0 ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 4a1 1 0 00-1.447-.894L4.447 6H2a1 1 0 00-1 1v6a1 1 0 001 1h2.447l4.106 2.894A1 1 0 0010 16V4zm2 5a2 2 0 114 0v.01a2 2 0 01-4 0V9zm4.293 2.293a1 1 0 010 1.414l-1 1a1 1 0 01-1.414-1.414l1-1a1 1 0 011.414 0z" /></svg>
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                            <LanguageSwitch />
                            <SubtitleControls />
                            <button onClick={toggleFullScreen}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v2.5a.5.5 0 001 0V4a.5.5 0 01.5-.5h2a.5.5 0 000-1h-2.5zM15.5 2a.5.5 0 00-.5.5v2a.5.5 0 001 0V3.5A1.5 1.5 0 0014.5 2h-2.5a.5.5 0 000 1h2zM4.5 18a.5.5 0 00.5-.5v-2a.5.5 0 00-1 0v2.5A1.5 1.5 0 004.5 18h2.5a.5.5 0 000-1h-2zm11 0a1.5 1.5 0 001.5-1.5v-2.5a.5.5 0 00-1 0V16a.5.5 0 01-.5.5h-2a.5.5 0 000 1h2.5z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </>
        )}
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold">{content.title}</h1>
        <h2 className="text-xl text-gray-400 mt-1">{currentEpisode.title}</h2>
        <p className="mt-4 text-gray-300 max-w-3xl">{content.description}</p>
        
        <div className="mt-6">
          {hasNextEpisode && (
            <button
              onClick={handleEpisodeEnd}
              className="bg-brand-purple hover:bg-brand-purple-light text-white font-bold py-2 px-6 rounded-md transition"
            >
              Next Episode
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
