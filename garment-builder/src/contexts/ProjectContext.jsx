import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getVersions } from '../services/versionService';

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
    const loadProjects = async () => {
      if (user) {
        await loadUserProjects();
      } else {
        setProjects([]);
        setCurrentProject(null);
      }
      setLoading(false);
    };
    
    loadProjects();
  }, [user]);

  const generateUniqueProjectName = (garmentType, existingProjects) => {
    // Capitalize first letter of garment type
    const baseName = garmentType.charAt(0).toUpperCase() + garmentType.slice(1);
    
    // Get all project names that start with this garment type
    const similarNames = existingProjects
      .filter(p => p.userId === user?.id)
      .map(p => p.name)
      .filter(name => name.startsWith(baseName));
    
    // If no projects with this name exist, return the base name
    if (!similarNames.includes(baseName)) {
      return baseName;
    }
    
    // Find the highest number used
    let highestNumber = 0;
    const numberPattern = new RegExp(`^${baseName}\\s*\\((\\d+)\\)$`);
    
    similarNames.forEach(name => {
      if (name === baseName) {
        highestNumber = Math.max(highestNumber, 0);
      } else {
        const match = name.match(numberPattern);
        if (match) {
          highestNumber = Math.max(highestNumber, parseInt(match[1]));
        }
      }
    });
    
    // Return the next available number
    return `${baseName} (${highestNumber + 1})`;
  };

  const loadUserProjects = async () => {
    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const userProjects = allProjects.filter(p => p.userId === user?.id);
    
    // Update thumbnails for existing projects to show latest generated images
    const updatedProjects = await Promise.all(
      userProjects.map(async (project) => {
        try {
          const latestThumbnail = await generateThumbnail(project.id, project.selectedFabrics);
          if (latestThumbnail !== project.thumbnail) {
            // Update the project with the new thumbnail
            const updatedProject = { ...project, thumbnail: latestThumbnail };
            console.log(`Updated thumbnail for project ${project.name}:`, latestThumbnail.substring(0, 50) + '...');
            return updatedProject;
          }
        } catch (error) {
          console.warn(`Failed to update thumbnail for project ${project.name}:`, error);
        }
        return project;
      })
    );

    setProjects(updatedProjects);
    
    // Update localStorage with the refreshed thumbnails
    const allUpdatedProjects = allProjects.map(project => {
      const updated = updatedProjects.find(up => up.id === project.id);
      return updated || project;
    });
    localStorage.setItem('projects', JSON.stringify(allUpdatedProjects));
  };

  const createProject = (name = 'Untitled Design') => {
    console.log('=== createProject context function called ===');
    console.log('Project name:', name);
    console.log('User:', user);
    
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
    console.log('Current projects in localStorage:', allProjects);
    allProjects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(allProjects));
    console.log('Updated projects in localStorage:', allProjects);
    
    setProjects(prev => {
      console.log('Previous projects state:', prev);
      const newState = [...prev, newProject];
      console.log('New projects state:', newState);
      return newState;
    });
    console.log('Returning new project:', newProject);
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

  const saveCurrentProject = async (designOptions, selectedFabrics) => {
    if (currentProject) {
      const thumbnail = await generateThumbnail(currentProject.id, selectedFabrics);
      
      let updates = {
        designOptions,
        selectedFabrics,
        thumbnail
      };
      
      // Auto-rename if still "Untitled Design" and garment type is available
      if (currentProject.name === 'Untitled Design' && designOptions?.garmentType) {
        const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const uniqueName = generateUniqueProjectName(designOptions.garmentType, allProjects);
        updates.name = uniqueName;
        
        // Update the current project state immediately so UI reflects the change
        setCurrentProject(prev => prev ? { ...prev, name: uniqueName } : null);
      }
      
      updateProject(currentProject.id, updates);
    }
  };

  const refreshProjectThumbnail = async (projectId) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const thumbnail = await generateThumbnail(projectId, project.selectedFabrics);
        updateProject(projectId, { thumbnail });
        console.log(`Refreshed thumbnail for project ${project.name}`);
      }
    } catch (error) {
      console.error(`Failed to refresh thumbnail for project ${projectId}:`, error);
    }
  };

  const generateThumbnail = async (projectId, selectedFabrics) => {
    try {
      // Try to get the latest generated image from versions
      const versions = await getVersions(projectId);
      if (versions && versions.length > 0) {
        // Get the most recent version with an image
        const latestVersion = versions
          .filter(version => version.image)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        
        if (latestVersion && latestVersion.image) {
          console.log('Using latest generated image as thumbnail:', latestVersion.image.substring(0, 50) + '...');
          return latestVersion.image;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch latest image for thumbnail, using fallback:', error);
    }

    // Fallback to simple colored thumbnail
    const mainColor = selectedFabrics?.top?.color || 
                      selectedFabrics?.choli?.color || 
                      selectedFabrics?.bodice?.color || 
                      '#2C3E50';
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
    setCurrentProject,
    refreshProjectThumbnail,
    generateUniqueProjectName
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};