import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiSettings, FiLock, FiPlay, FiTarget, FiColumns, FiPackage, FiEdit3, FiArrowRight, FiCheck, FiUsers, FiTrendingUp, FiStar, FiZap } from 'react-icons/fi';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('design');

  const categories = {
    design: {
      title: 'DESIGN',
      tools: [
        {
          id: 'garment-studio',
          title: 'Garment Design Studio',
          description: 'Create structured designs with professional garment builder',
          icon: FiEdit3,
          isLocked: false,
          onClick: () => {
            if (user) {
              navigate('/projects');
            } else {
              navigate('/login');
            }
          }
        },
        {
          id: 'fabric-calculator',
          title: 'Fabric Quantity Calculator',
          description: 'Calculate exact fabric requirements for your designs',
          icon: FiTarget,
          isLocked: true,
          comingSoon: true
        },
        {
          id: 'comparison-tool',
          title: 'Design Comparison Tool',
          description: 'Compare multiple designs side by side',
          icon: FiColumns,
          isLocked: true,
          comingSoon: true
        },
        {
          id: 'pattern-store',
          title: 'Pattern Store',
          description: 'Browse and purchase professional patterns',
          icon: FiPackage,
          isLocked: true,
          comingSoon: true
        }
      ]
    }
  };

  return (
    <div className="home-page-dashboard">
      <div className="dashboard-layout">
        {/* Sidebar - only show for logged in users */}
        {user && (
          <div className="sidebar">
            <div className="sidebar-content">
              {Object.entries(categories).map(([categoryKey, category]) => (
                <div key={categoryKey} className="category-section">
                  <div className="category-header">
                    <h3 className="category-title">{category.title}</h3>
                  </div>
                  <div className="tools-list">
                    {category.tools.map((tool) => (
                      <div
                        key={tool.id}
                        className={`tool-item ${tool.isLocked ? 'locked' : ''}`}
                        onClick={!tool.isLocked ? tool.onClick : undefined}
                      >
                        <div className="tool-icon">
                          <tool.icon />
                        </div>
                        <div className="tool-content">
                          <div className="tool-header">
                            <h4 className="tool-title">{tool.title}</h4>
                            {tool.isLocked && <FiLock className="lock-icon" />}
                          </div>
                          <p className="tool-description">{tool.description}</p>
                          {tool.comingSoon && (
                            <span className="coming-soon-badge">Coming Soon</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="main-content">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <div className="hero-badge">
                <FiZap className="badge-icon" />
                <span>Trusted by 1000+ designers worldwide</span>
              </div>
              <h1 className="hero-title">
                Design Professional Garments with
                <span className="gradient-text"> AI-Powered Precision</span>
              </h1>
              <p className="hero-subtitle">
                Transform your creative vision into reality with our comprehensive garment design studio. 
                Create, visualize, and perfect your designs with industry-leading tools.
              </p>
              <div className="hero-actions">
                <button 
                  className="cta-primary"
                  onClick={() => {
                    if (user) {
                      navigate('/projects');
                    } else {
                      navigate('/signup');
                    }
                  }}
                >
                  {user ? 'Go to Projects' : 'Start Designing Free'}
                  <FiArrowRight />
                </button>
                <button 
                  className="cta-secondary"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See How It Works
                </button>
              </div>
              <div className="social-proof">
                <div className="proof-item">
                  <FiUsers className="proof-icon" />
                  <span>1000+ Active Designers</span>
                </div>
                <div className="proof-item">
                  <FiStar className="proof-icon" />
                  <span>4.8/5 Average Rating</span>
                </div>
                <div className="proof-item">
                  <FiTrendingUp className="proof-icon" />
                  <span>50K+ Designs Created</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="design-preview">
                <div className="preview-card featured">
                  <div className="preview-header">
                    <div className="preview-dot"></div>
                    <div className="preview-dot"></div>
                    <div className="preview-dot"></div>
                  </div>
                  <div className="preview-content">
                    <div className="garment-mockup">
                      <div className="mockup-placeholder">Design Preview</div>
                    </div>
                  </div>
                </div>
                <div className="floating-elements">
                  <div className="floating-card tool-tip">
                    <FiEdit3 />
                    <span>Drag & Drop Design</span>
                  </div>
                  <div className="floating-card ai-tip">
                    <FiZap />
                    <span>AI-Powered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="features-section">
            <div className="section-header">
              <h2>Everything you need to design professional garments</h2>
              <p>Powerful tools that scale with your creativity</p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card primary">
                <div className="feature-icon-wrapper">
                  <FiEdit3 className="feature-icon" />
                </div>
                <h3>Garment Design Studio</h3>
                <p>Create professional garment designs with our intuitive drag-and-drop interface. Design kurtis, sarees, shirts, and more.</p>
                <div className="feature-benefits">
                  <div className="benefit">
                    <FiCheck className="check-icon" />
                    <span>AI-Powered 3D Mockups</span>
                  </div>
                  <div className="benefit">
                    <FiCheck className="check-icon" />
                    <span>Rich Fabric & Pattern Library</span>
                  </div>
                  <div className="benefit">
                    <FiCheck className="check-icon" />
                    <span>Real-time Design Preview</span>
                  </div>
                  <div className="benefit">
                    <FiCheck className="check-icon" />
                    <span>Export & Collaboration Tools</span>
                  </div>
                </div>
                <button 
                  className="feature-cta"
                  onClick={() => {
                    if (user) {
                      navigate('/projects');
                    } else {
                      navigate('/login');
                    }
                  }}
                >
                  {user ? 'Open Studio' : 'Try for Free'}
                  <FiArrowRight />
                </button>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper secondary">
                  <FiTarget className="feature-icon" />
                </div>
                <h3>Smart Fabric Calculator</h3>
                <p>Calculate precise fabric quantities with AI-powered analysis and minimize waste.</p>
                <div className="coming-soon-tag">
                  <span>Coming Soon</span>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper secondary">
                  <FiColumns className="feature-icon" />
                </div>
                <h3>Design Comparison Tool</h3>
                <p>Compare multiple design variations side by side with detailed analytics.</p>
                <div className="coming-soon-tag">
                  <span>Coming Soon</span>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper secondary">
                  <FiPackage className="feature-icon" />
                </div>
                <h3>Professional Pattern Store</h3>
                <p>Access thousands of professional patterns from top designers worldwide.</p>
                <div className="coming-soon-tag">
                  <span>Coming Soon</span>
                </div>
              </div>
            </div>

            {/* Process Section */}
            <div className="process-section">
              <div className="section-header">
                <h2>How it works</h2>
                <p>Get from idea to finished design in three simple steps</p>
              </div>
              <div className="process-grid">
                <div className="process-step">
                  <div className="step-number">1</div>
                  <h3>Choose Your Style</h3>
                  <p>Select from our library of garment templates or start from scratch with our design tools.</p>
                </div>
                <div className="process-arrow">
                  <FiArrowRight />
                </div>
                <div className="process-step">
                  <div className="step-number">2</div>
                  <h3>Customize & Design</h3>
                  <p>Use our drag-and-drop interface to add patterns, adjust fit, and preview in real-time.</p>
                </div>
                <div className="process-arrow">
                  <FiArrowRight />
                </div>
                <div className="process-step">
                  <div className="step-number">3</div>
                  <h3>Export & Produce</h3>
                  <p>Generate technical specifications and share with manufacturers or export for production.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          {!user && (
            <div className="cta-section">
              <div className="cta-content">
                <h2>Ready to transform your design process?</h2>
                <p>Join thousands of designers who are already creating amazing garments with H Labs</p>
                <div className="cta-buttons">
                  <button 
                    className="cta-btn primary"
                    onClick={() => navigate('/signup')}
                  >
                    Start Designing Free
                    <FiArrowRight />
                  </button>
                  <button 
                    className="cta-btn secondary"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </button>
                </div>
                <div className="demo-access">
                  <p>No credit card required • <strong>Free forever plan available</strong></p>
                  <div className="demo-credentials">
                    <span>Try demo: <strong>demo@example.com</strong> • <strong>demo123</strong></span>
                  </div>
                </div>
              </div>
              <div className="cta-visual">
                <div className="success-metrics">
                  <div className="metric">
                    <div className="metric-number">50K+</div>
                    <div className="metric-label">Designs Created</div>
                  </div>
                  <div className="metric">
                    <div className="metric-number">1000+</div>
                    <div className="metric-label">Active Users</div>
                  </div>
                  <div className="metric">
                    <div className="metric-number">4.8⭐</div>
                    <div className="metric-label">User Rating</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="page-footer">
            <div className="footer-content">
              <div className="footer-brand">
                <div className="footer-logo">
                  <img src="/logo.jpeg" alt="Studio H" className="logo" />
                  <span>H Labs</span>
                </div>
                <p>Professional garment design tools for the modern creator</p>
              </div>
              <div className="footer-links">
                <div className="link-group">
                  <h4>Product</h4>
                  <a href="#features">Features</a>
                  <a href="#pricing">Pricing</a>
                  <a href="#templates">Templates</a>
                </div>
                <div className="link-group">
                  <h4>Support</h4>
                  <a href="#help">Help Center</a>
                  <a href="/documentation.html" target="_blank">Documentation</a>
                  <a href="/contact.html" target="_blank">Contact</a>
                </div>
                <div className="link-group">
                  <h4>Company</h4>
                  <a href="#about">About</a>
                  <a href="#blog">Blog</a>
                  <a href="#careers">Careers</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 H Labs by Studio H. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;