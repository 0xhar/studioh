import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DesignToolbar from './DesignToolbar';
import GarmentCanvas from './GarmentCanvas';
import FabricCatalog from './FabricCatalog';
import GarmentMockup2D from './GarmentMockup2D';
import CompareModal from './CompareModal';
import { getProjectId } from '../utils/projectUtils';
import './GarmentBuilder.css';
import './professional-styles.css';

const GarmentBuilder = ({ 
  onBack, 
  onSave, 
  onPreview, 
  onExport, 
  onShare,
  projectName,
  onRenameProject,
  initialDesignOptions,
  initialSelectedFabrics,
  onDesignChange,
  lastSavedTime,
  refreshProjectThumbnail,
  projectId
}) => {
  const navigate = useNavigate();
  const { canUsePreview, incrementPreviewCount, getRemainingPreviews, user } = useAuth();
  
  const [designOptions, setDesignOptions] = useState(
    initialDesignOptions || {
      garmentType: 'kurti',
      neckline: 'round',
      sleeves: 'half',
      hem: 'straight',
      fit: 'regular',
      customDescription: ''
    }
  );

  const [selectedFabrics, setSelectedFabrics] = useState(initialSelectedFabrics || {});
  const [showPreview, setShowPreview] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState([]);
  
  // Modal-specific design options (initially copy of main options)
  const [modalDesignOptions, setModalDesignOptions] = useState(designOptions);
  const [modalSelectedFabrics, setModalSelectedFabrics] = useState(selectedFabrics);
  const [settingsPanelCollapsed, setSettingsPanelCollapsed] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(projectName || '');
  
  // Panel collapse states
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Store reference to generate function from GarmentMockup2D
  const [generateImageFunction, setGenerateImageFunction] = useState(null);
  const [isGeneratingFromButton, setIsGeneratingFromButton] = useState(false);

  // Define valid parts for each garment type
  const garmentParts = {
    saree: ['blouse', 'drape'],
    lehenga: ['choli', 'skirt', 'dupatta'],
    kurti: ['top', 'bottom'],
    blouse: ['front', 'back', 'sleeves'],
    dress: ['bodice', 'skirt'],
    shirt: ['body', 'collar', 'cuffs']
  };

  // Update state when initial props change
  useEffect(() => {
    if (initialDesignOptions) {
      setDesignOptions(initialDesignOptions);
    }
  }, [initialDesignOptions]);

  useEffect(() => {
    if (initialSelectedFabrics) {
      setSelectedFabrics(initialSelectedFabrics);
    }
  }, [initialSelectedFabrics]);

  // Update editing title when projectName changes
  useEffect(() => {
    setEditingTitle(projectName || '');
  }, [projectName]);

  // Track if this is the initial load
  const [hasUserMadeChanges, setHasUserMadeChanges] = useState(false);

  // Auto-save when design or fabrics change (but not on initial load)
  useEffect(() => {
    if (onDesignChange && hasUserMadeChanges) {
      onDesignChange(designOptions, selectedFabrics);
    }
  }, [designOptions, selectedFabrics]);


  // Sync modal options only when modal opens (not on every change)
  useEffect(() => {
    if (showPreview) {
      setModalDesignOptions(designOptions);
      setModalSelectedFabrics(selectedFabrics);
    }
  }, [showPreview]); // Remove designOptions and selectedFabrics from dependencies

  // Clean up fabrics when garment type changes
  useEffect(() => {
    const currentGarmentType = designOptions.garmentType;
    const validParts = garmentParts[currentGarmentType] || [];
    
    // Filter selectedFabrics to keep only valid parts for current garment
    setSelectedFabrics(prevFabrics => {
      const cleanedFabrics = {};
      Object.entries(prevFabrics).forEach(([part, fabric]) => {
        if (validParts.includes(part)) {
          cleanedFabrics[part] = fabric;
        }
      });
      
      // Log the cleanup for debugging
      const removedParts = Object.keys(prevFabrics).filter(part => !validParts.includes(part));
      if (removedParts.length > 0) {
        console.log(`Garment changed to ${currentGarmentType}. Removed invalid fabric parts:`, removedParts);
        console.log(`Valid parts for ${currentGarmentType}:`, validParts);
      }
      
      return cleanedFabrics;
    });
  }, [designOptions.garmentType]);

  const handleDesignChange = (newDesign) => {
    const previousGarmentType = designOptions.garmentType;
    const newGarmentType = newDesign.garmentType;
    
    // Log garment type change for debugging
    if (previousGarmentType !== newGarmentType) {
      console.log(`Garment type changed from ${previousGarmentType} to ${newGarmentType}`);
    }
    
    // Mark that user has made changes
    setHasUserMadeChanges(true);
    setDesignOptions(newDesign);
  };

  // Preview limit handler
  const handlePreviewClick = () => {
    if (!user) {
      alert('Please log in to use the preview feature.');
      return;
    }

    if (!canUsePreview()) {
      // Show contact modal or redirect to contact page
      if (window.confirm('You have reached your free preview limit (2 previews). Would you like to contact us for more previews or upgrade to a paid plan?')) {
        // Open contact page in new tab
        window.open('/contact.html', '_blank');
      }
      return;
    }

    // Use a preview and show the modal
    const success = incrementPreviewCount();
    if (success) {
      setShowPreview(true);
    } else {
      // This shouldn't happen if canUsePreview returned true, but just in case
      alert('Preview limit reached. Please contact us for more previews.');
    }
  };

  const handleFabricDrop = (partId, fabric) => {
    console.log('handleFabricDrop - partId:', partId, 'fabric:', fabric);
    // Mark that user has made changes
    setHasUserMadeChanges(true);
    setSelectedFabrics(prev => {
      const newFabrics = { ...prev };
      if (fabric === null) {
        delete newFabrics[partId];
      } else {
        newFabrics[partId] = fabric;
      }
      console.log('handleFabricDrop - updated selectedFabrics:', newFabrics);
      return newFabrics;
    });
  };

  const handleFabricSelect = (fabric) => {
    console.log('Fabric selected:', fabric);
    // Add uploaded fabric to the main garment part (body/top/choli)
    const mainPart = designOptions.garmentType === 'saree' ? 'blouse' :
                     designOptions.garmentType === 'lehenga' ? 'choli' :
                     designOptions.garmentType === 'kurti' ? 'top' :
                     designOptions.garmentType === 'blouse' ? 'front' :
                     designOptions.garmentType === 'dress' ? 'bodice' :
                     designOptions.garmentType === 'shirt' ? 'body' : 'top';
    
    handleFabricDrop(mainPart, fabric);
    alert(`Fabric "${fabric.name}" applied to ${mainPart}!`);
  };

  // Modal-specific handlers
  const handleModalDesignChange = (newDesign) => {
    setModalDesignOptions(newDesign);
  };

  const applyModalChangesToMain = () => {
    setDesignOptions(modalDesignOptions);
    setSelectedFabrics(modalSelectedFabrics);
    // This will trigger the main design change handler
    if (onDesignChange) {
      onDesignChange(modalDesignOptions, modalSelectedFabrics);
    }
  };

  const handleLogoClick = () => {
    navigate('/projects');
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e) => {
    setEditingTitle(e.target.value);
  };

  const handleTitleSubmit = () => {
    const newName = editingTitle.trim() || 'Untitled Design';
    setEditingTitle(newName);
    setIsEditingTitle(false);
    if (onRenameProject) {
      onRenameProject(newName);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditingTitle(projectName || 'Untitled Design');
      setIsEditingTitle(false);
    }
  };

  const handleTitleBlur = () => {
    handleTitleSubmit();
  };

  const handleSaveDesign = () => {
    if (onSave) {
      onSave(designOptions, selectedFabrics);
    } else {
      // Fallback for standalone mode
      const design = {
        id: Date.now(),
        name: `Design ${savedDesigns.length + 1}`,
        designOptions,
        selectedFabrics,
        createdAt: new Date().toISOString(),
        thumbnail: generateThumbnail()
      };
      setSavedDesigns(prev => [...prev, design]);
      alert('Design saved successfully!');
    }
  };


  const handleExport = async (format) => {
    // Export design document with settings and image
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
    const garmentType = designOptions.garmentType || 'garment';
    
    // Get the generated image if available
    const mockupComponent = document.querySelector('.garment-mockup-2d .ai-generated-image-combined');
    const hasImage = mockupComponent && mockupComponent.src && !mockupComponent.src.startsWith('blob:');
    let imageDataUrl = null;
    
    // Convert image to data URL if it exists
    if (mockupComponent && mockupComponent.src) {
      try {
        // Create a canvas to convert the image to data URL
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = mockupComponent.naturalWidth || 400;
        canvas.height = mockupComponent.naturalHeight || 600;
        ctx.drawImage(mockupComponent, 0, 0);
        imageDataUrl = canvas.toDataURL('image/png');
      } catch (error) {
        console.warn('Could not convert image to data URL:', error);
      }
    }
    
    // Create design document content
    const designDocument = {
      title: `Garment Design - ${garmentType}`,
      timestamp: new Date().toISOString(),
      designSettings: {
        garmentType: designOptions.garmentType,
        neckline: designOptions.neckline,
        sleeves: designOptions.sleeves,
        hem: designOptions.hem,
        fit: designOptions.fit
      },
      fabrics: Object.entries(selectedFabrics).map(([part, fabric]) => ({
        part,
        name: fabric.name || fabric.color,
        type: fabric.type,
        color: fabric.color
      })),
      imageAvailable: hasImage || imageDataUrl
    };
    
    // Create HTML document with embedded styles
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Garment Design Export - ${garmentType}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #2d3561; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; }
    h2 { color: #495057; margin-top: 30px; }
    .section { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6; }
    .detail-label { font-weight: 600; color: #495057; }
    .detail-value { color: #212529; }
    .fabric-item { background: white; padding: 10px; margin: 10px 0; border-radius: 4px; }
    .image-section { text-align: center; margin: 30px 0; }
    .image-section img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .timestamp { color: #6c757d; font-size: 0.9em; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>Garment Design Export</h1>
  <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
  
  <div class="section">
    <h2>Design Specifications</h2>
    <div class="detail-row">
      <span class="detail-label">Garment Type:</span>
      <span class="detail-value">${designOptions.garmentType || 'Not specified'}</span>
    </div>
    ${designOptions.neckline ? `
    <div class="detail-row">
      <span class="detail-label">Neckline:</span>
      <span class="detail-value">${designOptions.neckline}</span>
    </div>` : ''}
    ${designOptions.sleeves ? `
    <div class="detail-row">
      <span class="detail-label">Sleeves:</span>
      <span class="detail-value">${designOptions.sleeves}</span>
    </div>` : ''}
    ${designOptions.hem ? `
    <div class="detail-row">
      <span class="detail-label">Hem Style:</span>
      <span class="detail-value">${designOptions.hem}</span>
    </div>` : ''}
    ${designOptions.fit ? `
    <div class="detail-row">
      <span class="detail-label">Fit:</span>
      <span class="detail-value">${designOptions.fit}</span>
    </div>` : ''}
  </div>
  
  <div class="section">
    <h2>Fabric Selection</h2>
    ${Object.entries(selectedFabrics).length > 0 ? 
      Object.entries(selectedFabrics).map(([part, fabric]) => `
        <div class="fabric-item">
          <div class="detail-row">
            <span class="detail-label">Part:</span>
            <span class="detail-value">${part}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Fabric:</span>
            <span class="detail-value">${fabric.name || fabric.color || 'Custom'}</span>
          </div>
          ${fabric.type ? `
          <div class="detail-row">
            <span class="detail-label">Type:</span>
            <span class="detail-value">${fabric.type}</span>
          </div>` : ''}
        </div>
      `).join('') : '<p>No fabrics selected</p>'}
  </div>
  
  ${(hasImage || imageDataUrl) ? `
  <div class="section">
    <h2>Generated Design</h2>
    <div class="image-section">
      <img src="${imageDataUrl || mockupComponent.src}" alt="Generated garment design" />
    </div>
  </div>` : ''}
  
  <div class="section">
    <p style="text-align: center; color: #6c757d;">
      Designed with Garment Builder Studio<br>
      Export Date: ${new Date().toLocaleDateString()}
    </p>
  </div>
</body>
</html>`;
    
    // Create and download the HTML file
    try {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `garment_design_${garmentType}_${timestamp}.html`;
      link.setAttribute('download', `garment_design_${garmentType}_${timestamp}.html`);
      
      // Ensure link is added to DOM before clicking
      document.body.appendChild(link);
      
      // Force download
      link.style.display = 'none';
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log('Design document exported successfully as HTML file');
      alert('Design exported successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
    
    if (onExport) onExport(format);
  };

  const handleShare = () => {
    const shareUrl = generateShareUrl();
    navigator.clipboard.writeText(shareUrl);
    if (onShare) onShare(shareUrl);
    alert('Share link copied to clipboard!');
  };

  const generateThumbnail = () => {
    // In a real app, this would generate a thumbnail image
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${selectedFabrics.top?.color || '#2C3E50'}"/></svg>`;
  };

  const generateShareUrl = () => {
    const designData = btoa(JSON.stringify({ designOptions, selectedFabrics }));
    return `${window.location.origin}/shared-design/${designData}`;
  };

  return (
    <div className="garment-builder">
      {/* First Bar - Logo and Brand */}
      <div className="logo-bar">
        <div className="logo-bar-content">
          <div className="logo-brand-container" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img src="/logo.jpeg" alt="Studio H" className="logo" />
            <div className="brand-info">
              <span className="brand-name">H Labs</span>
              <span className="company-tag">by Studio H</span>
            </div>
          </div>
          <div className="user-info">
            <span className="user-greeting">Hello, Designer!</span>
          </div>
        </div>
      </div>

      {/* Second Bar - Navigation and Actions */}
      <div className="actions-bar">
        <div className="actions-bar-content">
          <div className="nav-section">
            <button className="back-btn" onClick={onBack}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Projects
            </button>
            <div className="divider"></div>
            {isEditingTitle ? (
              <input
                type="text"
                value={editingTitle}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleBlur}
                className="project-title-input"
                autoFocus
              />
            ) : (
              <span 
                className="project-title editable" 
                onClick={handleTitleClick}
                title="Click to edit project name"
              >
                {projectName || 'Untitled Design'}
              </span>
            )}
          </div>

          <div className="actions-section">
            <button className="action-btn save-btn" onClick={handleSaveDesign}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
              Save
            </button>
            <button 
              className={`action-btn preview-btn ${!canUsePreview() ? 'disabled' : ''}`}
              onClick={handlePreviewClick}
              title={
                user && user.isPaid 
                  ? "View design preview (Unlimited)" 
                  : user 
                    ? `View design preview (${getRemainingPreviews() || 0} free previews remaining)` 
                    : "View design preview (Login required)"
              }
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Preview
              {user && !user.isPaid && (
                <span className="preview-count">
                  ({getRemainingPreviews()}/2)
                </span>
              )}
            </button>
            <button 
              className="action-btn export-btn" 
              onClick={() => handleExport('HTML')}
              title="Export design"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
            <button 
              className="action-btn compare-btn" 
              onClick={() => setShowCompare(true)}
              title="Compare designs"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18m-9-9v18"/>
                <path d="M8 8l4-4 4 4"/>
                <path d="M8 16l4 4 4-4"/>
              </svg>
              Compare
            </button>
            <button 
              className="action-btn share-btn" 
              onClick={handleShare}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8"/>
                <polyline points="16,6 12,2 8,6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>


      {/* Main Workspace */}
      <div className="builder-workspace">
        {/* Left Toolbar - Design Options */}
        <div className={`left-panel ${leftPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-content">
            <DesignToolbar onDesignChange={handleDesignChange} />
          </div>
          
          {/* Left Panel Toggle Button */}
          <button 
            className="panel-toggle-btn left-toggle-btn"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            title={leftPanelCollapsed ? 'Expand Design Options' : 'Collapse Design Options'}
          >
{leftPanelCollapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Center Canvas - Drag & Drop Area */}
        <div className="center-panel">
          <GarmentCanvas
            designOptions={designOptions}
            selectedFabrics={selectedFabrics}
            onDrop={handleFabricDrop}
          />
        </div>

        {/* Right Panel - Fabric Selection */}
        <div className={`right-panel ${rightPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-content">
            <FabricCatalog onFabricSelect={handleFabricSelect} />
          </div>
          
          {/* Right Panel Toggle Button */}
          <button 
            className="panel-toggle-btn right-toggle-btn"
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            title={rightPanelCollapsed ? 'Expand Fabric Catalog' : 'Collapse Fabric Catalog'}
          >
            {rightPanelCollapsed ? '‹' : '›'}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal">
          <div className="modal-overlay" onClick={() => setShowPreview(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>Design Preview</h3>
              <button 
                className="close-btn"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {/* Collapsible Settings Panel */}
              <div className={`modal-settings-panel ${settingsPanelCollapsed ? 'collapsed' : ''}`}>
                <div className="settings-header">
                  <h4>Settings</h4>
                  <div className="settings-actions">
                    <button 
                      className="settings-btn toggle-btn"
                      onClick={() => setSettingsPanelCollapsed(!settingsPanelCollapsed)}
                      title={settingsPanelCollapsed ? 'Show Settings' : 'Hide Settings'}
                    >
                      {settingsPanelCollapsed ? '⚙️ Show Settings' : '✕ Hide'}
                    </button>
                  </div>
                </div>
                {!settingsPanelCollapsed && (
                  <div className="settings-content">
                    <DesignToolbar 
                      onDesignChange={handleModalDesignChange}
                      initialDesignOptions={modalDesignOptions}
                    />
                  </div>
                )}
              </div>
              
              {/* Main 2D Preview - The Highlight */}
              <div className="modal-preview-panel">
                <div className="preview-content">
                  <GarmentMockup2D
                    designOptions={modalDesignOptions}
                    selectedFabrics={modalSelectedFabrics}
                    onGenerateRef={setGenerateImageFunction}
                    refreshProjectThumbnail={refreshProjectThumbnail}
                    projectId={projectId}
                    key="modal-mockup"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="modal-footer-left">
                <button 
                  className="modal-btn generate-btn" 
                  onClick={async () => {
                    if (generateImageFunction && !isGeneratingFromButton) {
                      setIsGeneratingFromButton(true);
                      try {
                        await generateImageFunction();
                      } finally {
                        setIsGeneratingFromButton(false);
                      }
                    }
                  }}
                  disabled={isGeneratingFromButton}
                >
                  {isGeneratingFromButton ? 'Generating...' : 'Generate Design'}
                </button>
                {!settingsPanelCollapsed && (
                  <button 
                    className="modal-btn apply-settings-btn"
                    onClick={applyModalChangesToMain}
                    title="Apply current settings to main design"
                  >
                    ✓ Apply Settings
                  </button>
                )}
              </div>
              <div className="modal-footer-right">
                <button className="modal-btn secondary" onClick={() => setShowPreview(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Design Stats */}
      <div className="design-stats">
        <div className="stat-item">
          <span className="stat-label">Garment:</span>
          <span className="stat-value">{designOptions.garmentType}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Fabrics:</span>
          <span className="stat-value">{Object.keys(selectedFabrics).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Last Saved:</span>
          <span className="stat-value">Never</span>
        </div>
      </div>

      {/* Compare Modal */}
      <CompareModal 
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
        projectId={getProjectId()}
      />
    </div>
  );
};

export default GarmentBuilder;