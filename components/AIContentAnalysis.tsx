import React, { useState, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import Spinner from './Spinner';
import type { Content } from '../types';

interface AIContentAnalysisProps {
  content: Content;
}

const AIContentAnalysis: React.FC<AIContentAnalysisProps> = ({ content }) => {
  const { contentAnalysis, loadingAnalysis, analyzeContent } = useAI();
  const [analysis, setAnalysis] = useState(contentAnalysis[content.id] || null);

  useEffect(() => {
    if (!analysis) {
      analyzeContent(content).then(setAnalysis);
    }
  }, [content, analysis, analyzeContent]);

  if (loadingAnalysis && !analysis) {
    return (
      <div className="bg-logo-white rounded-logo p-6 shadow-logo">
        <div className="flex items-center justify-center h-32">
          <Spinner />
          <span className="ml-3 text-logo-text">AI is analyzing this content...</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'text-green-600 bg-green-100';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100';
      case 'Complex': return 'text-red-600 bg-red-100';
      default: return 'text-logo-gray bg-logo-peach-light';
    }
  };

  const getBingeabilityColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBingeabilityText = (score: number) => {
    if (score >= 8) return 'Highly Bingeable';
    if (score >= 6) return 'Moderately Bingeable';
    return 'Take Your Time';
  };

  return (
    <div className="bg-logo-white rounded-logo p-6 shadow-logo">
      <h3 className="text-xl font-bold text-logo-text mb-6 flex items-center">
        <span className="mr-2">🤖</span>
        AI Content Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood & Emotional Tone */}
        <div className="space-y-4">
          <div className="p-4 bg-logo-peach-light rounded-logo">
            <h4 className="font-semibold text-logo-text mb-2 flex items-center">
              <span className="mr-2">😊</span>
              Mood & Tone
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-logo-text">Overall Mood: </span>
                <span className="text-sm text-logo-gray">{analysis.mood}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-logo-text">Emotional Tone: </span>
                <span className="text-sm text-logo-gray">{analysis.emotionalTone}</span>
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="p-4 bg-logo-yellow/20 rounded-logo">
            <h4 className="font-semibold text-logo-text mb-2 flex items-center">
              <span className="mr-2">👥</span>
              Target Audience
            </h4>
            <p className="text-sm text-logo-gray">{analysis.targetAudience}</p>
          </div>
        </div>

        {/* Complexity & Bingeability */}
        <div className="space-y-4">
          <div className="p-4 bg-logo-blue/10 rounded-logo">
            <h4 className="font-semibold text-logo-text mb-2 flex items-center">
              <span className="mr-2">🧠</span>
              Complexity
            </h4>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(analysis.complexity)}`}>
              {analysis.complexity}
            </span>
          </div>

          <div className="p-4 bg-logo-pink/10 rounded-logo">
            <h4 className="font-semibold text-logo-text mb-2 flex items-center">
              <span className="mr-2">📺</span>
              Bingeability Score
            </h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-logo-gray/20 rounded-full h-2">
                <div 
                  className="bg-logo-blue h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(analysis.bingeability / 10) * 100}%` }}
                ></div>
              </div>
              <span className={`text-sm font-bold ${getBingeabilityColor(analysis.bingeability)}`}>
                {analysis.bingeability}/10
              </span>
            </div>
            <p className="text-xs text-logo-gray mt-1">
              {getBingeabilityText(analysis.bingeability)}
            </p>
          </div>
        </div>
      </div>

      {/* Themes */}
      {analysis.themes.length > 0 && (
        <div className="mt-6 p-4 bg-logo-white border border-logo-peach rounded-logo">
          <h4 className="font-semibold text-logo-text mb-3 flex items-center">
            <span className="mr-2">🎭</span>
            Key Themes
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.themes.map((theme, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-logo-blue text-logo-white rounded-full text-sm"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Similar Content */}
      {analysis.similarContent.length > 0 && (
        <div className="mt-6 p-4 bg-logo-white border border-logo-peach rounded-logo">
          <h4 className="font-semibold text-logo-text mb-3 flex items-center">
            <span className="mr-2">🔗</span>
            Similar Content
          </h4>
          <div className="space-y-1">
            {analysis.similarContent.map((similar, index) => (
              <div key={index} className="text-sm text-logo-gray">
                • {similar}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-logo-peach-light to-logo-yellow/20 rounded-logo">
        <h4 className="font-semibold text-logo-text mb-2 flex items-center">
          <span className="mr-2">💡</span>
          AI Insights
        </h4>
        <div className="text-sm text-logo-gray space-y-1">
          <p>• This content has a {analysis.complexity.toLowerCase()} narrative structure</p>
          <p>• Perfect for {analysis.targetAudience.toLowerCase()}</p>
          <p>• {analysis.bingeability >= 7 ? 'Great for binge-watching' : 'Best enjoyed at a relaxed pace'}</p>
          {analysis.themes.length > 0 && (
            <p>• Explores themes of {analysis.themes.slice(0, 2).join(' and ')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIContentAnalysis;


