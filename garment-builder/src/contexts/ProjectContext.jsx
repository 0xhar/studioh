import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProjectContext = createContext({});

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
    setLoading(false);
  }, [user]);

  const loadUserProjects = () => {
    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const userProjects = allProjects.filter(p => p.userId === user?.id);
    setProjects(userProjects);
  };

  const createProject = (name = 'Untitled Design') => {
    const newProject = {
      id: Date.now().toString(),
      userId: user?.id,
      name,
      designOptions: {
        garmentType: 'kurti',
        neckline: 'round',
        sleeves: 'half',
        hem: 'straight',
        fit: 'regular'
      },
      selectedFabrics: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnail: null
    };

    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    allProjects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(allProjects));
    
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const projectIndex = allProjects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      allProjects[projectIndex] = {
        ...allProjects[projectIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('projects', JSON.stringify(allProjects));
      
      setProjects(prev => prev.map(p => 
        p.id === projectId ? allProjects[projectIndex] : p
      ));
      
      if (currentProject?.id === projectId) {
        setCurrentProject(allProjects[projectIndex]);
      }
    }
  };

  const deleteProject = (projectId) => {
    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const filteredProjects = allProjects.filter(p => p.id !== projectId);
    localStorage.setItem('projects', JSON.stringify(filteredProjects));
    
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  const openProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      return project;
    }
    return null;
  };

  const saveCurrentProject = (designOptions, selectedFabrics) => {
    if (currentProject) {
      updateProject(currentProject.id, {
        designOptions,
        selectedFabrics,
        thumbnail: generateThumbnail(selectedFabrics)
      });
    }
  };

  const generateThumbnail = (selectedFabrics) => {
    // Generate a simple thumbnail based on selected fabrics
    const mainColor = selectedFabrics.top?.color || 
                      selectedFabrics.choli?.color || 
                      selectedFabrics.bodice?.color || 
                      '#667eea';
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${encodeURIComponent(mainColor)}"/></svg>`;
  };

  const value = {
    projects,
    currentProject,
    loading,
    createProject,
    updateProject,
    deleteProject,
    openProject,
    saveCurrentProject,
    setCurrentProject
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};