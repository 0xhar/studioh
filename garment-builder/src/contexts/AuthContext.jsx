import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Initialize preview count if not exists
      if (userData.previewsUsed === undefined) {
        userData.previewsUsed = 0;
      }
      // Default to free user if not specified
      if (userData.isPaid === undefined) {
        userData.isPaid = false;
      }
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call - in production, this would call your backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check stored users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          const userData = { 
            id: user.id, 
            email: user.email, 
            name: user.name,
            previewsUsed: user.previewsUsed || 0,
            isPaid: user.isPaid || false
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
  };

  const signup = async (email, password, name) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
          reject(new Error('User already exists'));
          return;
        }
        
        // Create new user
        const newUser = {
          id: Date.now().toString(),
          email,
          password, // In production, this should be hashed
          name,
          createdAt: new Date().toISOString(),
          previewsUsed: 0,
          isPaid: false
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        const userData = { 
          id: newUser.id, 
          email: newUser.email, 
          name: newUser.name,
          previewsUsed: 0,
          isPaid: false
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        resolve(userData);
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const incrementPreviewCount = () => {
    if (!user || user.isPaid) return true; // Paid users have unlimited previews
    
    const newCount = (user.previewsUsed || 0) + 1;
    const updatedUser = { ...user, previewsUsed: newCount };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Also update the stored users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].previewsUsed = newCount;
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    return newCount <= 2; // Return true if still within limit
  };

  const canUsePreview = () => {
    if (!user) return false;
    if (user.isPaid) return true; // Paid users have unlimited previews
    return (user.previewsUsed || 0) < 2; // Free users get 2 previews
  };

  const getRemainingPreviews = () => {
    if (!user || user.isPaid) return null; // Paid users have unlimited
    return Math.max(0, 2 - (user.previewsUsed || 0));
  };

  const upgradeToPaid = () => {
    if (!user) return;
    
    const updatedUser = { ...user, isPaid: true };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Also update the stored users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].isPaid = true;
      localStorage.setItem('users', JSON.stringify(users));
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    incrementPreviewCount,
    canUsePreview,
    getRemainingPreviews,
    upgradeToPaid
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};