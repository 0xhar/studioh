import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import GarmentBuilder from './components/GarmentBuilder';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [userSession, setUserSession] = useState(null);

  const handleStartBuilder = () => {
    setCurrentView('builder');
  };

  const handleLogin = () => {
    // In a real app, this would show login modal/form
    console.log('Login clicked');
    // Simulate login
    setUserSession({ name: 'Demo User', role: 'consumer' });
    alert('Login functionality would be implemented here');
  };

  const handleRegister = () => {
    // In a real app, this would show register modal/form
    console.log('Register clicked');
    alert('Registration functionality would be implemented here');
  };

  const handleGuestMode = () => {
    setUserSession({ name: 'Guest User', role: 'guest' });
    setCurrentView('builder');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleSaveDesign = (design) => {
    console.log('Design saved:', design);
    // In a real app, this would save to backend
  };

  const handlePreview = (mode) => {
    console.log('Preview mode:', mode);
    // In a real app, this might trigger AI generation for 2D mode
  };

  const handleExport = (format) => {
    console.log('Export format:', format);
    // In a real app, this would generate and download the file
  };

  const handleShare = (shareUrl) => {
    console.log('Share URL:', shareUrl);
    // In a real app, this might integrate with social media APIs
  };

  if (currentView === 'landing') {
    return (
      <LandingPage
        onStartBuilder={handleStartBuilder}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGuestMode={handleGuestMode}
      />
    );
  }

  if (currentView === 'builder') {
    return (
      <GarmentBuilder
        onBack={handleBackToLanding}
        onSave={handleSaveDesign}
        onPreview={handlePreview}
        onExport={handleExport}
        onShare={handleShare}
        userSession={userSession}
      />
    );
  }

  return null;
}

export default App;