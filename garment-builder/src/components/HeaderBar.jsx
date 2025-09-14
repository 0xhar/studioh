import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HeaderBar.css';

const HeaderBar = ({ showActions = true, className = '', showBackButton = false, onBack }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogoClick = () => {
    if (user) {
      // If user is logged in, redirect to projects page
      navigate('/projects');
    } else {
      // If user is not logged in, redirect to home page
      navigate('/');
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      // Default back behavior
      if (user) {
        navigate('/projects');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <header className={`header-bar ${className}`}>
      <div className="header-content">
        <div className="header-left">
          {showBackButton && (
            <button className="back-btn" onClick={handleBackClick}>
              ← Back
            </button>
          )}
          <div className="brand-section" onClick={handleLogoClick}>
            <img 
              src="/logo.jpeg" 
              alt="Studio H Logo" 
              className="header-logo"
            />
            <div className="brand-info">
              <span className="brand-name">H Labs</span>
              <span className="company-tag">by Studio H</span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="header-right">
            {!user ? (
              <div className="auth-actions">
                <button 
                  className="header-btn secondary"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
                <button 
                  className="header-btn primary"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="user-actions">
                <span className="user-greeting">Hello, {user.name || 'Designer'}!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderBar;