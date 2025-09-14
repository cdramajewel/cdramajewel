import React, { useState } from 'react';
import { useAI } from '../context/AIContext';
import { useContent } from '../context/ContentContext';
import AIRecommendations from './AIRecommendations';
import AISearch from './AISearch';
import ContentCard from './ContentCard';
import Spinner from './Spinner';

const AIDashboard: React.FC = () => {
  const { watchlistSuggestions, loadingWatchlist } = useAI();
  const { content } = useContent();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'search' | 'watchlist'>('recommendations');

  const tabs = [
    { id: 'recommendations', label: '🤖 AI Recommendations', icon: '🤖' },
    { id: 'search', label: '🔍 AI Search', icon: '🔍' },
    { id: 'watchlist', label: '📋 Smart Watchlist', icon: '📋' },
  ] as const;

  return (
    <div className="bg-logo-white rounded-logo p-6 shadow-logo">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-logo-text mb-2 flex items-center">
          <span className="mr-2">🧠</span>
          AI Dashboard
        </h2>
        <p className="text-logo-gray">
          Discover content with the power of artificial intelligence
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-logo font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-logo-blue text-logo-white shadow-logo'
                : 'bg-logo-peach-light text-logo-text hover:bg-logo-peach'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'recommendations' && <AIRecommendations />}
        
        {activeTab === 'search' && <AISearch />}
        
        {activeTab === 'watchlist' && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-logo-text mb-2 flex items-center">
                <span className="mr-2">📋</span>
                Smart Watchlist
              </h3>
              <p className="text-logo-gray">
                AI-curated suggestions based on your viewing history
              </p>
            </div>

            {loadingWatchlist ? (
              <div className="flex items-center justify-center h-32">
                <Spinner />
                <span className="ml-3 text-logo-text">AI is curating your watchlist...</span>
              </div>
            ) : watchlistSuggestions.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {watchlistSuggestions.map((item) => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-logo-yellow/20 rounded-logo">
                  <h4 className="font-semibold text-logo-text mb-2">💡 AI Insights</h4>
                  <div className="text-sm text-logo-gray space-y-1">
                    <p>• Based on your viewing patterns, we've selected content you're likely to enjoy</p>
                    <p>• These suggestions consider your preferred genres and content types</p>
                    <p>• The AI learns from your watch history to improve recommendations over time</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📺</div>
                <h4 className="text-lg font-semibold text-logo-text mb-2">Start Watching!</h4>
                <p className="text-logo-gray mb-4">
                  Watch some content to get personalized AI recommendations for your watchlist.
                </p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="btn-primary"
                >
                  Explore Content
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-logo-peach-light rounded-logo text-center">
          <div className="text-2xl font-bold text-logo-blue">{content.length}</div>
          <div className="text-sm text-logo-gray">Total Content</div>
        </div>
        <div className="p-4 bg-logo-blue/10 rounded-logo text-center">
          <div className="text-2xl font-bold text-logo-blue">AI</div>
          <div className="text-sm text-logo-gray">Powered Analysis</div>
        </div>
        <div className="p-4 bg-logo-pink/10 rounded-logo text-center">
          <div className="text-2xl font-bold text-logo-blue">24/7</div>
          <div className="text-sm text-logo-gray">Smart Learning</div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;


