import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import GarmentBuilder from '../GarmentBuilder';

const ProjectDesigner = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, currentProject, openProject, saveCurrentProject, updateProject, refreshProjectThumbnail } = useProjects();
  const [loading, setLoading] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  useEffect(() => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      openProject(projectId);
      setLoading(false);
    } else {
      navigate('/projects');
    }
  }, [projectId, projects]);

  const handleBack = () => {
    navigate('/projects');
  };

  const handleSave = async (designOptions, selectedFabrics) => {
    if (currentProject) {
      await saveCurrentProject(designOptions, selectedFabrics);
      setLastSavedTime(new Date());
      // Show save confirmation
      const saveNotice = document.createElement('div');
      saveNotice.className = 'save-notice';
      saveNotice.textContent = 'Project saved!';
      document.body.appendChild(saveNotice);
      setTimeout(() => {
        saveNotice.remove();
      }, 3000);
    }
  };

  const handleAutoSave = async (designOptions, selectedFabrics) => {
    // Auto-save every change
    if (currentProject) {
      await saveCurrentProject(designOptions, selectedFabrics);
      setLastSavedTime(new Date());
    }
  };

  const handleRenameProject = (newName) => {
    if (currentProject && newName.trim()) {
      updateProject(currentProject.id, { name: newName.trim() });
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #2C3E50 0%, #E67E22 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading project...
      </div>
    );
  }

  return (
    <>
      <style>{`
        .save-notice {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4caf50;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
          font-weight: 500;
          z-index: 10000;
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .project-name-editor {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        
        .project-name-input {
          background: transparent;
          border: none;
          color: inherit;
          font-size: inherit;
          font-weight: inherit;
          padding: 4px 8px;
          border-radius: 4px;
          min-width: 200px;
        }
        
        .project-name-input:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .project-name-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
      
      <GarmentBuilder 
        onBack={handleBack}
        onSave={handleSave}
        projectName={currentProject?.name}
        onRenameProject={handleRenameProject}
        initialDesignOptions={currentProject?.designOptions}
        initialSelectedFabrics={currentProject?.selectedFabrics}
        onDesignChange={handleAutoSave}
        lastSavedTime={lastSavedTime}
        refreshProjectThumbnail={refreshProjectThumbnail}
        projectId={currentProject?.id}
      />
    </>
  );
};

export default ProjectDesigner;