import React, { useState } from 'react';
import DesignToolbar from './DesignToolbar';
import GarmentCanvas from './GarmentCanvas';
import FabricCatalog from './FabricCatalog';
import GarmentViewer3D from './GarmentViewer3D';
import './GarmentBuilder.css';

const GarmentBuilder = ({ onBack, onSave, onPreview, onExport, onShare }) => {
  const [designOptions, setDesignOptions] = useState({
    garmentType: 'kurti',
    neckline: 'round',
    sleeves: 'half',
    hem: 'straight',
    fit: 'regular'
  });

  const [selectedFabrics, setSelectedFabrics] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState('3D');
  const [savedDesigns, setSavedDesigns] = useState([]);

  const handleDesignChange = (newDesign) => {
    setDesignOptions(newDesign);
  };

  const handleFabricDrop = (partId, fabric) => {
    setSelectedFabrics(prev => {
      const newFabrics = { ...prev };
      if (fabric === null) {
        delete newFabrics[partId];
      } else {
        newFabrics[partId] = fabric;
      }
      return newFabrics;
    });
  };

  const handleSaveDesign = () => {
    const design = {
      id: Date.now(),
      name: `Design ${savedDesigns.length + 1}`,
      designOptions,
      selectedFabrics,
      createdAt: new Date().toISOString(),
      thumbnail: generateThumbnail()
    };
    setSavedDesigns(prev => [...prev, design]);
    if (onSave) onSave(design);
    alert('Design saved successfully!');
  };

  const handlePreview = (mode) => {
    setPreviewMode(mode);
    setShowPreview(true);
    if (onPreview) onPreview(mode);
  };

  const handleExport = (format) => {
    // Export functionality would integrate with backend
    if (onExport) onExport(format);
    alert(`Exporting design as ${format}...`);
  };

  const handleShare = () => {
    const shareUrl = generateShareUrl();
    navigator.clipboard.writeText(shareUrl);
    if (onShare) onShare(shareUrl);
    alert('Share link copied to clipboard!');
  };

  const generateThumbnail = () => {
    // In a real app, this would generate a thumbnail image
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${selectedFabrics.top?.color || '#667eea'}"/></svg>`;
  };

  const generateShareUrl = () => {
    const designData = btoa(JSON.stringify({ designOptions, selectedFabrics }));
    return `${window.location.origin}/shared-design/${designData}`;
  };

  return (
    <div className="garment-builder">
      {/* Top Bar */}
      <div className="builder-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <div className="builder-title">
            <h1>h labs Garment Builder</h1>
            <span className="design-name">Untitled Design</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="action-btn save-btn" onClick={handleSaveDesign}>
            💾 Save
          </button>
          <div className="preview-group">
            <button 
              className="action-btn preview-btn" 
              onClick={() => handlePreview('2D')}
            >
              🖼️ 2D Preview
            </button>
            <button 
              className="action-btn preview-btn" 
              onClick={() => handlePreview('3D')}
            >
              🎭 3D Preview
            </button>
          </div>
          <div className="export-group">
            <button 
              className="action-btn export-btn" 
              onClick={() => handleExport('PNG')}
            >
              📤 Export
            </button>
            <button 
              className="action-btn share-btn" 
              onClick={handleShare}
            >
              🔗 Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="builder-workspace">
        {/* Left Toolbar - Design Options */}
        <div className="left-panel">
          <DesignToolbar onDesignChange={handleDesignChange} />
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
        <div className="right-panel">
          <FabricCatalog onFabricSelect={(fabric) => console.log('Fabric selected:', fabric)} />
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal">
          <div className="modal-overlay" onClick={() => setShowPreview(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {previewMode === '2D' ? '2D Mockup Preview' : '3D Model Preview'}
              </h3>
              <div className="modal-tabs">
                <button 
                  className={`tab-btn ${previewMode === '2D' ? 'active' : ''}`}
                  onClick={() => setPreviewMode('2D')}
                >
                  2D Mockup
                </button>
                <button 
                  className={`tab-btn ${previewMode === '3D' ? 'active' : ''}`}
                  onClick={() => setPreviewMode('3D')}
                >
                  3D Preview
                </button>
              </div>
              <button 
                className="close-btn"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {previewMode === '2D' && (
                <div className="mockup-preview">
                  <div className="mockup-placeholder">
                    <h3>AI-Generated 2D Mockup</h3>
                    <p>This would show AI-generated front and back views of your design</p>
                    <div className="mockup-images">
                      <div className="mockup-front">Front View</div>
                      <div className="mockup-back">Back View</div>
                    </div>
                  </div>
                </div>
              )}
              
              {previewMode === '3D' && (
                <div className="viewer-3d">
                  <GarmentViewer3D
                    texture={selectedFabrics.top?.image}
                    color={selectedFabrics.top?.color || designOptions.primaryColor}
                    garmentType={designOptions.garmentType}
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowPreview(false)}>
                Close
              </button>
              <button className="modal-btn primary" onClick={() => handleExport('PNG')}>
                Export This View
              </button>
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
    </div>
  );
};

export default GarmentBuilder;