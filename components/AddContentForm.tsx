import React, { useState, useEffect, useRef } from 'react';
import type { Content, Episode, AdRule, Genre } from '../types';
import { ContentType } from '../types';
import { ALL_GENRES, ALL_CONTENT_TYPES } from '../constants';

interface AddContentFormProps {
  onSave: (content: Content) => void;
  onCancel: () => void;
  initialData?: Content | null;
}

const emptyContent: Omit<Content, 'id'> = {
  title: '',
  description: '',
  posterUrl: '',
  type: ContentType.KDrama,
  genres: [],
  episodes: [],
  adRules: [],
  views: 0,
  releaseYear: new Date().getFullYear(),
  featured: false,
};

const AddContentForm: React.FC<AddContentFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Omit<Content, 'id' | 'views'> & { id?: string, views: number | string }>(initialData || emptyContent);
  const [fileNames, setFileNames] = useState<Record<number, string>>({});
  const objectUrls = useRef<string[]>([]);
  const posterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    // Cleanup function to revoke object URLs on component unmount
    return () => {
      objectUrls.current.forEach(url => URL.revokeObjectURL(url));
      objectUrls.current = [];
    };
  }, [initialData]);
  
  // Auto-manage episode list when content type is changed to/from Movie
  useEffect(() => {
      if (formData.type === ContentType.Movie) {
          if (formData.episodes?.length !== 1 || formData.episodes[0].title !== 'Full Movie') {
              setFormData(prev => ({ ...prev, episodes: [{
                  id: `movie-ep-${Date.now()}`, title: 'Full Movie', episodeNumber: 1, duration: 7200, videoUrl: 'mock_video.mp4'
              }]}));
          }
      } else {
          if (formData.episodes?.length === 1 && formData.episodes[0].title === 'Full Movie') {
              setFormData(prev => ({ ...prev, episodes: [] }));
          }
      }
  }, [formData.type]);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
       if (formData.posterUrl && formData.posterUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.posterUrl);
        objectUrls.current = objectUrls.current.filter(url => url !== formData.posterUrl);
      }
      const newPosterUrl = URL.createObjectURL(file);
      objectUrls.current.push(newPosterUrl);
      setFormData(prev => ({ ...prev, posterUrl: newPosterUrl }));
    }
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const videoUrl = URL.createObjectURL(file);
      objectUrls.current.push(videoUrl); // Store for cleanup
      setFileNames(prev => ({ ...prev, [index]: file.name }));

      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.onloadedmetadata = () => {
        const duration = Math.round(videoElement.duration);
        const newEpisodes = [...(formData.episodes || [])];
        const currentEpisode = newEpisodes[index];
        const isDefaultTitle = currentEpisode.title.startsWith('Episode ');
        const newTitle = isDefaultTitle ? file.name.split('.').slice(0, -1).join('.') : currentEpisode.title;
        
        newEpisodes[index] = { ...currentEpisode, videoUrl, duration, title: newTitle };
        setFormData(prev => ({ ...prev, episodes: newEpisodes }));
        URL.revokeObjectURL(videoElement.src); // Clean up temp video element URL
      };
      videoElement.onerror = () => {
        console.error("Error loading video metadata.");
        const newEpisodes = [...(formData.episodes || [])];
        newEpisodes[index] = { ...newEpisodes[index], videoUrl };
        setFormData(prev => ({ ...prev, episodes: newEpisodes }));
        URL.revokeObjectURL(videoElement.src);
      };
      videoElement.src = videoUrl;
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleGenreChange = (genre: Genre) => {
    setFormData(prev => {
        const currentGenres = prev.genres || [];
        const newGenres = currentGenres.includes(genre) ? currentGenres.filter(g => g !== genre) : [...currentGenres, genre];
        return { ...prev, genres: newGenres };
    });
  };

  const handleEpisodeChange = (index: number, field: keyof Episode, value: string | number) => {
    const newEpisodes = [...(formData.episodes || [])];
    const updatedValue = (field === 'duration' || field === 'episodeNumber') ? Number(value) : value;
    newEpisodes[index] = { ...newEpisodes[index], [field]: updatedValue };
    setFormData(prev => ({ ...prev, episodes: newEpisodes }));
  };

  const addEpisode = () => {
    const newEpisode: Episode = {
      id: `ep-${Date.now()}`,
      title: `Episode ${(formData.episodes?.length || 0) + 1}`,
      episodeNumber: (formData.episodes?.length || 0) + 1,
      duration: 0,
      videoUrl: '',
    };
    setFormData(prev => ({ ...prev, episodes: [...(prev.episodes || []), newEpisode] }));
  };

  const removeEpisode = (index: number) => {
    const newEpisodes = (formData.episodes || []).filter((_, i) => i !== index)
      .map((ep, i) => ({ ...ep, episodeNumber: i + 1 })); // Renumber episodes
    setFormData(prev => ({ ...prev, episodes: newEpisodes }));
    const newFileNames = { ...fileNames };
    delete newFileNames[index];
    setFileNames(newFileNames);
  };
  
  const handleAdRuleChange = (index: number, field: keyof AdRule, value: string | number) => {
    const newAdRules = [...(formData.adRules || [])];
    newAdRules[index] = { ...newAdRules[index], [field]: Number(value) };
    setFormData(prev => ({ ...prev, adRules: newAdRules }));
  };

  const addAdRule = () => {
    const newAdRule: AdRule = { fromEpisode: 1, toEpisode: 1, adCount: 2 };
    setFormData(prev => ({ ...prev, adRules: [...(prev.adRules || []), newAdRule] }));
  };

  const removeAdRule = (index: number) => {
    setFormData(prev => ({ ...prev, adRules: (prev.adRules || []).filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contentToSave: Content = {
      ...formData,
      id: initialData?.id || `content-${Date.now()}`,
      releaseYear: Number(formData.releaseYear),
      views: Number(formData.views),
      episodes: formData.episodes || [],
      adRules: formData.adRules || [],
    };
    onSave(contentToSave);
  };
  
  const isMovie = formData.type === ContentType.Movie;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-300">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">Poster</label>
          <div className="mt-1 flex flex-col items-center">
            <div className="w-40 h-60 bg-gray-700 rounded-md flex items-center justify-center text-gray-500 overflow-hidden">
              {formData.posterUrl ? (
                <img src={formData.posterUrl} alt="Poster preview" className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <input
              type="file"
              name="posterFile"
              id="posterFile"
              accept="image/*"
              onChange={handlePosterChange}
              ref={posterInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => posterInputRef.current?.click()}
              className="mt-3 text-sm bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition w-40"
            >
              {formData.posterUrl ? 'Change Poster' : 'Upload Poster'}
            </button>
          </div>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-brand-purple focus:border-brand-purple" />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
            <select name="type" id="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-brand-purple focus:border-brand-purple">
              {ALL_CONTENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-brand-purple focus:border-brand-purple"></textarea>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-700 pt-6">
        <div>
          <label htmlFor="releaseYear" className="block text-sm font-medium mb-1">Release Year</label>
          <input type="number" name="releaseYear" id="releaseYear" value={formData.releaseYear} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-brand-purple focus:border-brand-purple" />
        </div>
        <div>
          <label htmlFor="views" className="block text-sm font-medium mb-1">Views</label>
          <input type="number" name="views" id="views" value={formData.views} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-brand-purple focus:border-brand-purple" />
        </div>
        <div className="md:col-span-2 flex items-center">
            <input type="checkbox" name="featured" id="featured" checked={!!formData.featured} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
            <label htmlFor="featured" className="ml-2 block text-sm">Featured Content</label>
        </div>
        <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">{ALL_GENRES.map(genre => (<button type="button" key={genre} onClick={() => handleGenreChange(genre)} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${(formData.genres || []).includes(genre) ? 'bg-brand-purple text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}>{genre}</button>))}</div>
        </div>
      </div>

      {/* Episode Management */}
      {!isMovie && (
        <div className="space-y-4 border-t border-gray-700 pt-6">
          <h3 className="text-lg font-semibold">Episodes</h3>
          {(formData.episodes || []).map((ep, index) => (
            <div key={ep.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2 bg-gray-700/50 rounded-md">
              <span className="md:col-span-1 text-center font-bold">E{ep.episodeNumber}</span>
              <input type="text" placeholder="Title" value={ep.title} onChange={(e) => handleEpisodeChange(index, 'title', e.target.value)} className="md:col-span-4 bg-gray-600 rounded px-2 py-1 text-sm" />
              <div className="md:col-span-5 flex items-center">
                <label htmlFor={`video-upload-${index}`} className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white text-xs py-1.5 px-3 rounded-md transition whitespace-nowrap">
                  Choose Video
                </label>
                <input
                  id={`video-upload-${index}`}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(index, e)}
                  className="hidden"
                />
                <span className="ml-2 text-xs text-gray-400 truncate" title={fileNames[index]}>
                  {fileNames[index] || (ep.videoUrl.startsWith('blob:') ? 'Local File Selected' : 'No file chosen')}
                </span>
              </div>
              <input type="number" placeholder="Duration (s)" value={ep.duration} onChange={(e) => handleEpisodeChange(index, 'duration', e.target.value)} className="md:col-span-1 bg-gray-600 rounded px-2 py-1 text-sm" />
              <button type="button" onClick={() => removeEpisode(index)} className="md:col-span-1 text-red-500 hover:text-red-400 text-xs font-bold">REMOVE</button>
            </div>
          ))}
          <button type="button" onClick={addEpisode} className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-md transition">+ Add Episode</button>
        </div>
      )}

      {/* Ad Rule Management */}
      <div className="space-y-4 border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold">Ad Rules</h3>
        {(formData.adRules || []).map((rule, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2 bg-gray-700/50 rounded-md">
            <label className="md:col-span-2 text-sm">From Episode:</label>
            <input type="number" value={rule.fromEpisode} onChange={(e) => handleAdRuleChange(index, 'fromEpisode', e.target.value)} className="md:col-span-2 bg-gray-600 rounded px-2 py-1 text-sm" />
            <label className="md:col-span-2 text-sm md:text-right">To Episode:</label>
            <input type="number" value={rule.toEpisode} onChange={(e) => handleAdRuleChange(index, 'toEpisode', e.target.value)} className="md:col-span-2 bg-gray-600 rounded px-2 py-1 text-sm" />
            <label className="md:col-span-1 text-sm md:text-right">Ads:</label>
            <input type="number" value={rule.adCount} onChange={(e) => handleAdRuleChange(index, 'adCount', e.target.value)} className="md:col-span-1 bg-gray-600 rounded px-2 py-1 text-sm" />
            <button type="button" onClick={() => removeAdRule(index)} className="md:col-span-2 text-red-500 hover:text-red-400 text-xs font-bold">REMOVE</button>
          </div>
        ))}
        <button type="button" onClick={addAdRule} className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-md transition">+ Add Ad Rule</button>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-700 mt-6">
        <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition">Cancel</button>
        <button type="submit" className="bg-brand-purple hover:bg-brand-purple-light text-white font-bold py-2 px-4 rounded-md transition">
          {initialData ? 'Save Changes' : 'Add Content'}
        </button>
      </div>
    </form>
  );
};

export default AddContentForm;