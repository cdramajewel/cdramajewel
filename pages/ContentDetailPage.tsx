
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import AIContentAnalysis from '../components/AIContentAnalysis';
import Spinner from '../components/Spinner';

const ContentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getContentById, loading } = useContent();
  const content = id ? getContentById(id) : undefined;

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  }

  if (!content) {
    return <div className="text-center text-xl mt-10">Content not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 flex-shrink-0">
          <img src={content.posterUrl} alt={content.title} className="rounded-lg shadow-2xl w-full" />
        </div>
        <div className="md:w-2/3 text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{content.title}</h1>
          <div className="flex items-center space-x-4 mb-4 text-gray-400">
            <span>{content.releaseYear}</span>
            <span>&bull;</span>
            <span>{content.type}</span>
            <span>&bull;</span>
            <span>{content.views.toLocaleString()} views</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {content.genres.map(genre => (
              <span key={genre} className="bg-gray-700 text-gray-200 text-xs font-semibold px-3 py-1 rounded-full">{genre}</span>
            ))}
          </div>
          <p className="text-gray-300 leading-relaxed">{content.description}</p>
        </div>
      </div>

      {content.episodes && content.episodes.length > 0 && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-white">{content.type === "Movie" ? "Play" : "Episodes"}</h2>
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <ul className="divide-y divide-gray-700">
              {content.episodes.map((episode, index) => (
                <li key={episode.id} className="p-4 hover:bg-gray-700/50 transition-colors duration-200">
                  <Link to={`/play/${content.id}/${index}`} className="flex items-center justify-between">
                    <div className="flex items-center">
                       <span className="text-brand-purple-light font-bold w-12 text-lg">{content.type === "Movie" ? "" : `E${episode.episodeNumber}`}</span>
                       <span className="font-medium text-gray-200">{episode.title}</span>
                    </div>
                    <button className="bg-brand-purple text-white px-4 py-2 rounded-md hover:bg-brand-purple-light transition-colors">
                      Play
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* AI Content Analysis */}
      <div className="mt-12">
        <AIContentAnalysis content={content} />
      </div>
    </div>
  );
};

export default ContentDetailPage;
