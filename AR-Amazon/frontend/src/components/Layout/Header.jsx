import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">3D</span>
              </div>
              <span className="text-white font-semibold text-xl">AR Amazon</span>
            </Link>
          </div>

          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <Link to="/upload" className="btn-primary">
                Upload Image
              </Link>
              <div className="flex items-center space-x-3">
                <span className="text-gray-300">{user?.email}</span>
                <button onClick={handleLogout} className="btn-secondary">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
