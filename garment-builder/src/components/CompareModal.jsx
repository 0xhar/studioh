import React, { useState, useEffect } from 'react';
import { getVersions } from '../services/versionService';
import GarmentViewer3D from './GarmentViewer3D';
import JSZip from 'jszip';
import './CompareModal.css';

const CompareModal = ({ isOpen, onClose, projectId }) => {
  const [versions, setVersions] = useState([]);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [renderViewer, setRenderViewer] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      console.log('CompareModal: Fetching versions for projectId:', projectId);
      fetchVersions();
    }
  }, [isOpen, projectId]);

  const fetchVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('CompareModal: Calling getVersions API for:', projectId);
      const fetchedVersions = await getVersions(projectId);
      console.log('CompareModal: Fetched versions:', fetchedVersions.length, 'versions');
      setVersions(fetchedVersions);
    } catch (err) {
      setError('Failed to load design versions');
      console.error('Error fetching versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (version) => {
    if (selectedVersions.includes(version.id)) {
      setSelectedVersions(selectedVersions.filter(id => id !== version.id));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, version.id]);
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      setCompareMode(true);
      // Delay rendering of 3D viewer to ensure proper initialization
      setTimeout(() => {
        setRenderViewer(true);
      }, 100);
    }
  };

  const handleBackToList = () => {
    setCompareMode(false);
    setRenderViewer(false);
    setSelectedVersions([]);
  };

  const base64ToBlob = (base64Data) => {
    try {
      console.log('Converting base64 to blob, data starts with:', base64Data.substring(0, 50));
      const arr = base64Data.split(',');
      if (arr.length !== 2) {
        throw new Error('Invalid base64 data format');
      }
      const mime = arr[0].match(/:(.*?);/);
      if (!mime) {
        throw new Error('Could not extract MIME type');
      }
      const mimeType = mime[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      console.log('Successfully created blob with MIME type:', mimeType, 'Size:', u8arr.length);
      return new Blob([u8arr], { type: mimeType });
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      return null;
    }
  };

  const urlToBlob = async (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Successfully converted URL image to blob via canvas');
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => {
        console.error('Failed to load image from URL');
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  };


  const handleExportDesign = async (version, index = null) => {
    console.log('Starting export for version:', version.id);
    const timestamp = new Date(version.timestamp).toISOString().slice(0, 16).replace(/[:-]/g, '');
    const designType = version.designOptions?.garmentType || 'design';
    const suffix = index !== null ? `_comparison_${index + 1}` : '';
    const baseFilename = `${designType}_${timestamp}${suffix}`;
    
    try {
      console.log('Creating ZIP file...');
      const zip = new JSZip();
      
      // Handle image data
      console.log('Processing image data...');
      
      if (!version.image) {
        console.error('No image data found in version');
        return;
      }
      
      const imageFilename = `${baseFilename}.png`;
      let imageBlob = null;
      
      if (version.image.startsWith('data:')) {
        console.log('Image is base64, converting...');
        imageBlob = base64ToBlob(version.image);
      } else if (version.image.startsWith('http')) {
        console.log('Image is URL, converting via canvas...');
        try {
          // Try canvas method first (works around CORS)
          imageBlob = await urlToBlob(version.image);
        } catch {
          console.log('Canvas method failed, trying direct fetch...');
          try {
            const response = await fetch(version.image);
            if (response.ok) {
              imageBlob = await response.blob();
              console.log('Successfully fetched image from URL');
            } else {
              console.error('Failed to fetch image from URL:', response.status);
            }
          } catch (fetchError) {
            console.error('Both methods failed to get image:', fetchError);
          }
        }
      }
      
      if (imageBlob) {
        console.log('Adding image to ZIP:', imageFilename);
        zip.file(imageFilename, imageBlob);
      } else {
        console.error('Could not process image for ZIP');
      }
      
      // Create and add settings to zip
      const settingsData = {
        designInfo: {
          timestamp: version.timestamp,
          garmentType: version.designOptions?.garmentType,
          exportedAt: new Date().toISOString(),
          imageFile: imageFilename
        },
        designOptions: version.designOptions,
        selectedFabrics: version.selectedFabrics || {},
        metadata: {
          versionId: version.id,
          projectId: version.projectId
        }
      };
      
      const settingsFilename = `${baseFilename}_settings.json`;
      const settingsJson = JSON.stringify(settingsData, null, 2);
      console.log('Adding settings to ZIP:', settingsFilename);
      zip.file(settingsFilename, settingsJson);
      
      // Generate and download zip
      console.log('Generating ZIP blob...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      console.log('ZIP generated, size:', zipBlob.size);
      
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `${baseFilename}.zip`;
      document.body.appendChild(link);
      
      console.log('Triggering download for:', `${baseFilename}.zip`);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);
      
      console.log(`Successfully exported zip: ${baseFilename}.zip`);
    } catch (error) {
      console.error('Export failed:', error, error.stack);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDesignOptions = (designOptions) => {
    return Object.entries(designOptions)
      .filter(([key, value]) => value && key !== 'embellishments')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const getSelectedVersionsData = () => {
    return selectedVersions.map(id => versions.find(v => v.id === id));
  };

  if (!isOpen) return null;

  console.log('CompareModal: Rendering with state:', {
    loading,
    error,
    versionsCount: versions.length,
    compareMode,
    projectId
  });

  return (
    <div className="compare-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="compare-modal-content">
        <div className="compare-modal-header">
          <h2>
            {compareMode ? 'Design Comparison' : 'Design Versions'}
          </h2>
          <div className="compare-header-actions">
            {compareMode && (
              <button 
                className="btn-secondary"
                onClick={handleBackToList}
              >
                ← Back to List
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="compare-modal-body">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading design versions...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchVersions} className="retry-btn">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && !compareMode && (
            <div className="versions-grid-view">
              <div className="versions-header">
                <p>Select up to 2 designs to compare 
                  <span 
                    className="tooltip-icon" 
                    title="Only last 10 designs will be stored. Select 2 designs to compare their differences side by side."
                  >
                    ℹ️
                  </span>
                </p>
                {selectedVersions.length === 2 && (
                  <button 
                    className="btn-primary compare-action-btn"
                    onClick={handleCompare}
                  >
                    Compare Selected ({selectedVersions.length})
                  </button>
                )}
              </div>

              {versions.length === 0 ? (
                <div className="empty-state">
                  <p>No design versions found. Generate some designs first!</p>
                </div>
              ) : (
                <div className="versions-grid">
                  {versions.map((version) => (
                    <div 
                      key={version.id}
                      className={`version-card ${selectedVersions.includes(version.id) ? 'selected' : ''}`}
                      onClick={() => handleVersionSelect(version)}
                    >
                      <div className="version-image">
                        <img 
                          src={version.image} 
                          alt={`Design version from ${formatDate(version.timestamp)}`}
                          loading="lazy"
                        />
                      </div>
                      <div className="version-info">
                        <div className="version-timestamp">
                          {formatDate(version.timestamp)}
                        </div>
                        <div className="version-settings">
                          <strong>Settings:</strong>
                          <div className="settings-summary">
                            {formatDesignOptions(version.designOptions)}
                          </div>
                        </div>
                        {version.selectedFabrics && Object.keys(version.selectedFabrics).length > 0 && (
                          <div className="version-fabrics">
                            <strong>Fabrics:</strong> {Object.keys(version.selectedFabrics).length} applied
                          </div>
                        )}
                        <div className="version-actions">
                          <button 
                            className="export-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportDesign(version);
                            }}
                            title="Download ZIP with design image and settings"
                          >
                            📦 Download ZIP
                          </button>
                        </div>
                      </div>
                      {selectedVersions.includes(version.id) && (
                        <div className="selection-indicator">
                          <span className="selection-number">
                            {selectedVersions.indexOf(version.id) + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && !error && compareMode && (
            <div className="compare-view">
              {(() => {
                const selectedVersionsData = getSelectedVersionsData();
                return (
                  <div className="comparison-layout">
                    {selectedVersionsData.map((version, index) => (
                      <div key={version.id} className="comparison-panel">
                        <div className="panel-header">
                          <div className="panel-title">
                            <h3>Design {index + 1}</h3>
                            <span className="panel-timestamp">
                              {formatDate(version.timestamp)}
                            </span>
                          </div>
                          <button 
                            className="export-btn-header"
                            onClick={() => handleExportDesign(version, index)}
                            title="Download ZIP with this design image and settings"
                          >
                            📦 Download ZIP
                          </button>
                        </div>
                        
                        <div className="panel-image">
                          {renderViewer ? (
                            version.image ? (
                              <img 
                                src={version.image} 
                                alt={`Design ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  background: 'white'
                                }}
                              />
                            ) : (
                              <GarmentViewer3D 
                                designOptions={version.designOptions}
                                selectedFabrics={version.selectedFabrics || {}}
                                className="comparison-3d-viewer"
                              />
                            )
                          ) : (
                            <div className="loading-3d-viewer">
                              <div className="loading-spinner"></div>
                              <p>Loading design...</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="panel-details">
                          <div className="details-section">
                            <h4>Design Options</h4>
                            <div className="details-grid">
                              {Object.entries(version.designOptions).map(([key, value]) => (
                                <div key={key} className="detail-item">
                                  <span className="detail-label">{key}:</span>
                                  <span className="detail-value">{Array.isArray(value) ? value.join(', ') : value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {version.selectedFabrics && Object.keys(version.selectedFabrics).length > 0 && (
                            <div className="details-section">
                              <h4>Applied Fabrics</h4>
                              <div className="details-grid">
                                {Object.entries(version.selectedFabrics).map(([part, fabric]) => (
                                  <div key={part} className="detail-item">
                                    <span className="detail-label">{part}:</span>
                                    <span className="detail-value">{fabric.name || fabric.color}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;