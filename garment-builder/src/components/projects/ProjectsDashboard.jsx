import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectContext';
import { FiGrid, FiList, FiPlus, FiLogOut, FiEdit2, FiTrash2, FiClock, FiEdit3, FiTarget, FiColumns, FiPackage, FiLock } from 'react-icons/fi';
import HeaderBar from '../HeaderBar';
import './ProjectsDashboard.css';

const ProjectsDashboard = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [editingProject, setEditingProject] = useState(null);
  const { user, logout } = useAuth();
  const { projects, createProject, deleteProject, updateProject } = useProjects();
  const navigate = useNavigate();

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
          isActive: true
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

  const handleCreateProject = () => {
    console.log('=== handleCreateProject function called ===');
    console.log('createProject function:', createProject);
    console.log('user object:', user);
    
    try {
      const projectName = 'Untitled Design';
      console.log('Creating project with name:', projectName);
      
      if (!createProject) {
        console.error('createProject function is not available!');
        alert('Error: Project creation function not available');
        return;
      }
      
      if (!user) {
        console.error('User is not logged in!');
        alert('Error: You must be logged in to create a project');
        return;
      }
      
      console.log('Calling createProject function...');
      const newProject = createProject(projectName);
      console.log('New project created:', newProject);
      
      if (newProject && newProject.id) {
        navigate(`/design/${newProject.id}`);
      } else {
        console.error('Failed to create project - invalid project object');
        alert('Failed to create project. Please try again.');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('An error occurred while creating the project. Please try again.');
    }
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
      <HeaderBar />
      
      <div className="dashboard-layout-with-sidebar">
        {/* Sidebar */}
        <div className="projects-sidebar">
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
                      className={`tool-item ${tool.isLocked ? 'locked' : ''} ${tool.isActive ? 'active' : ''}`}
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

        {/* Main Content */}
        <div className="projects-main-area">
          <div className="tab-header">
            <div className="tab-header-inner">
              <div className="tab-section">
                <div className="tab-item active">
                  My Design Projects ({projects.length})
                </div>
              </div>
              <div className="tab-actions">
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
                <button 
                  className="new-project-btn"
                  onClick={() => {
                    console.log('New Project button clicked - creating project directly');
                    handleCreateProject();
                  }}
                >
                  <FiPlus /> New Project
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="dashboard-content-inner">
              <div className="projects-section">

          {projects.length === 0 ? (
            <div className="empty-state">
              <h3>No projects yet</h3>
              <p>Create your first garment design project to get started!</p>
              <button 
                className="create-first-btn"
                onClick={handleCreateProject}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsDashboard;