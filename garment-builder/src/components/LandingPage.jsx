import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onStartBuilder, onLogin, onRegister, onGuestMode }) => {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <div className="brand-logo">
            <h1 className="brand-title">h labs</h1>
            <p className="brand-subtitle">Garment Builder</p>
          </div>
          
          <div className="hero-text">
            <h2>Design Your Perfect Garment</h2>
            <p>Create custom sarees, lehengas, kurtis, and more with our intelligent design platform. Upload fabrics, choose embellishments, and preview in 2D/3D.</p>
          </div>

          <div className="feature-highlights">
            <div className="feature">
              <div className="feature-icon">🎨</div>
              <h3>Custom Design</h3>
              <p>Drag-and-drop interface with necklines, sleeves, and hem options</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🧵</div>
              <h3>Rich Embellishments</h3>
              <p>Add aari work, zari, lace, and sequins to your designs</p>
            </div>
            <div className="feature">
              <div className="feature-icon">👗</div>
              <h3>3D Preview</h3>
              <p>See your garment on a realistic mannequin with fabric mapping</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📤</div>
              <h3>Export & Share</h3>
              <p>Save designs and export as PNG/PDF for production</p>
            </div>
          </div>

          <div className="cta-buttons">
            <button className="btn-primary" onClick={onStartBuilder}>
              Start Garment Builder
            </button>
            <button className="btn-guest" onClick={onGuestMode}>
              Continue as Guest
            </button>
          </div>

          <div className="auth-links">
            <span>Already have an account? </span>
            <button className="link-btn" onClick={onLogin}>Login</button>
            <span> | </span>
            <button className="link-btn" onClick={onRegister}>Register</button>
          </div>
        </div>
      </div>

      <div className="garment-showcase">
        <h3>Popular Garment Types</h3>
        <div className="garment-grid">
          <div className="garment-type">
            <div className="garment-icon">👘</div>
            <h4>Saree</h4>
            <p>Traditional drape with custom blouse designs</p>
          </div>
          <div className="garment-type">
            <div className="garment-icon">👗</div>
            <h4>Lehenga</h4>
            <p>Elegant skirt with matching choli and dupatta</p>
          </div>
          <div className="garment-type">
            <div className="garment-icon">👚</div>
            <h4>Kurti</h4>
            <p>Versatile tunic with various necklines and sleeves</p>
          </div>
          <div className="garment-type">
            <div className="garment-icon">👔</div>
            <h4>Blouse</h4>
            <p>Custom fitted blouse with intricate detailing</p>
          </div>
          <div className="garment-type">
            <div className="garment-icon">👗</div>
            <h4>Dress</h4>
            <p>Modern dresses with traditional elements</p>
          </div>
          <div className="garment-type">
            <div className="garment-icon">👕</div>
            <h4>Shirt</h4>
            <p>Contemporary shirts with ethnic touches</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;