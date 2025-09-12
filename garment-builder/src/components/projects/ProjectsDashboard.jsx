import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectContext';
import { FiGrid, FiList, FiPlus, FiLogOut, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import './ProjectsDashboard.css';

const ProjectsDashboard = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const { user, logout } = useAuth();
  const { projects, createProject, deleteProject, updateProject } = useProjects();
  const navigate = useNavigate();

  const handleCreateProject = () => {
    const projectName = newProjectName.trim() || 'Untitled Design';
    const newProject = createProject(projectName);
    setShowNewProjectModal(false);
    setNewProjectName('');
    navigate(`/design/${newProject.id}`);
  };

  const handleOpenProject = (projectId) => {
    navigate(`/design/${projectId}`);
  };

  const handleDeleteProject = (projectId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
    }
  };

  const handleRenameProject = (project, e) => {
    e.stopPropagation();
    setEditingProject(project.id);
  };

  const handleSaveRename = (projectId, newName) => {
    if (newName.trim()) {
      updateProject(projectId, { name: newName.trim() });
    }
    setEditingProject(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="projects-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>My Design Projects</h1>
          <p>Welcome back, {user?.name || 'Designer'}!</p>
        </div>
        <div className="header-right">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FiList />
            </button>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="projects-section">
          <div className="section-header">
            <h2>Your Projects ({projects.length})</h2>
            <button 
              className="new-project-btn"
              onClick={() => setShowNewProjectModal(true)}
            >
              <FiPlus /> New Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <h3>No projects yet</h3>
              <p>Create your first garment design project to get started!</p>
              <button 
                className="create-first-btn"
                onClick={() => setShowNewProjectModal(true)}
              >
                <FiPlus /> Create Your First Project
              </button>
            </div>
          ) : (
            <div className={`projects-${viewMode}`}>
              {projects.map(project => (
                <div 
                  key={project.id} 
                  className="project-card"
                  onClick={() => handleOpenProject(project.id)}
                >
                  <div className="project-thumbnail">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.name} />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <span>{project.designOptions?.garmentType || 'Design'}</span>
                      </div>
                    )}
                  </div>
                  <div className="project-info">
                    {editingProject === project.id ? (
                      <input
                        type="text"
                        defaultValue={project.name}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) => handleSaveRename(project.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveRename(project.id, e.target.value);
                          }
                        }}
                        autoFocus
                        className="rename-input"
                      />
                    ) : (
                      <h3>{project.name}</h3>
                    )}
                    <div className="project-meta">
                      <span className="garment-type">{project.designOptions?.garmentType}</span>
                      <span className="project-date">
                        <FiClock /> {formatDate(project.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="project-actions">
                    <button 
                      className="action-btn"
                      onClick={(e) => handleRenameProject(project, e)}
                      title="Rename"
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showNewProjectModal && (
        <div className="modal-overlay" onClick={() => setShowNewProjectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <input
              type="text"
              placeholder="Enter project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowNewProjectModal(false)}>
                Cancel
              </button>
              <button className="create-btn" onClick={handleCreateProject}>
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsDashboard;