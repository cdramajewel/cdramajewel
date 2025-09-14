import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { AIProvider } from './context/AIContext';
import { SubtitleProvider } from './context/SubtitleContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ContentDetailPage from './pages/ContentDetailPage';
import PlayerPage from './pages/PlayerPage';
import AdminDashboard from './pages/AdminDashboard';
import SearchPage from './pages/SearchPage';
import AIPage from './pages/AIPage';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ContentProvider>
        <AIProvider>
          <SubtitleProvider>
            <HashRouter>
          <div className="min-h-screen flex flex-col bg-dark-bg">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/ai" element={<AIPage />} />
                <Route path="/content/:id" element={<ContentDetailPage />} />
                <Route path="/play/:contentId/:episodeIndex" element={<PlayerPage />} />
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
            </HashRouter>
          </SubtitleProvider>
        </AIProvider>
      </ContentProvider>
    </AuthProvider>
  );
};

export default App;