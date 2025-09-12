import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import HomePage from './components/HomePage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProjectsDashboard from './components/projects/ProjectsDashboard';
import ProjectDesigner from './components/projects/ProjectDesigner';
import PrivateRoute from './components/auth/PrivateRoute';
import './App.css';
import './professional-theme.css';

function App() {
  useEffect(() => {
    // Initialize demo user if not exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      const demoUser = {
        id: 'demo-user',
        email: 'demo@example.com',
        password: 'demo123',
        name: 'Demo User',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('users', JSON.stringify([demoUser]));
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/projects" 
              element={
                <PrivateRoute>
                  <ProjectsDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/design/:projectId" 
              element={
                <PrivateRoute>
                  <ProjectDesigner />
                </PrivateRoute>
              } 
            />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;