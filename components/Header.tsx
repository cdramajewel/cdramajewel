import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoDataUrl } from '../assets/logo';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const activeLinkStyle = {
    color: '#3b82f6', // diamond-blue
  };

  return (
    <header className="logo-header backdrop-blur-sm sticky top-0 z-50 shadow-lg">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center logo-bounce">
              <img className="h-12 w-auto logo-glow" src={logoDataUrl} alt="C-Drama Jewel Logo" />
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <NavLink 
                  to="/" 
                  className="text-dark-text hover:text-dark-accent px-3 py-2 rounded-logo text-sm font-medium transition"
                  style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                  end
                >
                  Home
                </NavLink>
                <NavLink 
                  to="/ai" 
                  className="text-dark-text hover:text-dark-accent px-3 py-2 rounded-logo text-sm font-medium transition"
                  style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                >
                  🤖 AI
                </NavLink>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
              </div>
              <input
                  id="search"
                  name="search"
                  className="block w-32 sm:w-40 md:w-56 pl-10 pr-3 py-2 border border-dark-accent rounded-logo leading-5 bg-dark-card text-dark-text placeholder-dark-text-muted focus:outline-none focus:ring-1 focus:ring-dark-accent focus:border-dark-accent sm:text-sm transition-all duration-300"
                  placeholder="Search..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {user ? (
              <>
                <NavLink
                  to="/admin"
                  className="hidden sm:block text-logo-text hover:text-logo-blue px-3 py-2 rounded-logo text-sm font-medium transition whitespace-nowrap"
                  style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                >
                  Admin Panel
                </NavLink>
                <button
                  onClick={logout}
                  className="btn-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="flex-shrink-0">
                <button className="btn-primary whitespace-nowrap">
                  Admin Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
