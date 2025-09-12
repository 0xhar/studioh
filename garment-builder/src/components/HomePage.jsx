import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is logged in, redirect to projects
  React.useEffect(() => {
    if (user) {
      navigate('/projects');
    }
  }, [user, navigate]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <nav className="home-nav">
          <div className="nav-brand">
            <h2>Garment Design Studio</h2>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="nav-btn login-btn">Login</Link>
            <Link to="/signup" className="nav-btn signup-btn">Get Started</Link>
          </div>
        </nav>

        <div className="hero-content">
          <h1 className="hero-title">
            Design Your Dream <span className="gradient-text">Garments</span>
          </h1>
          <p className="hero-subtitle">
            Professional garment design tool with AI-powered visualization, 
            drag-and-drop fabric selection, and 3D preview
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="cta-btn primary">
              Start Designing Free
            </Link>
            <Link to="/login" className="cta-btn secondary">
              Login to Continue
            </Link>
          </div>
          <div className="demo-info">
            <p>Try with demo account: <strong>demo@example.com</strong> / <strong>demo123</strong></p>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-cards">
            <div className="design-card card-1">
              <div className="card-icon">👗</div>
              <span>Kurti</span>
            </div>
            <div className="design-card card-2">
              <div className="card-icon">🥻</div>
              <span>Saree</span>
            </div>
            <div className="design-card card-3">
              <div className="card-icon">👔</div>
              <span>Shirt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Garment Design Studio?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Intuitive Design Tools</h3>
            <p>Easy-to-use interface with professional design capabilities</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧵</div>
            <h3>Rich Fabric Library</h3>
            <p>Choose from a wide selection of fabrics or upload your own</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Real-time 3D Preview</h3>
            <p>See your designs come to life with interactive 3D visualization</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h3>Project Management</h3>
            <p>Save and organize all your designs in one place</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Mockups</h3>
            <p>Generate realistic 2D mockups with advanced AI technology</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📤</div>
            <h3>Export & Share</h3>
            <p>Export your designs and share them with clients or manufacturers</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up for free and access your personal design workspace</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Start a Project</h3>
            <p>Create a new project and choose your garment type</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Design & Customize</h3>
            <p>Select styles, fabrics, and customize every detail</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Preview & Export</h3>
            <p>View in 3D, generate mockups, and export your final design</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Start Designing?</h2>
        <p>Join thousands of designers creating amazing garments</p>
        <Link to="/signup" className="cta-btn primary large">
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2024 Garment Design Studio. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;