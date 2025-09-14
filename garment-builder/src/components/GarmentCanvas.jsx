import React, { useState, useRef } from 'react';
import './GarmentCanvas.css';

const GarmentCanvas = ({ designOptions, selectedFabrics, onDrop }) => {
  const [dragOverArea, setDragOverArea] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef(null);

  const garmentShapes = {
    saree: {
      parts: [
        { id: 'blouse', name: 'Blouse', x: 200, y: 100, width: 200, height: 150 },
        { id: 'drape', name: 'Saree Drape', x: 100, y: 280, width: 400, height: 300 }
      ]
    },
    lehenga: {
      parts: [
        { id: 'choli', name: 'Choli', x: 200, y: 80, width: 200, height: 120 },
        { id: 'skirt', name: 'Lehenga Skirt', x: 150, y: 220, width: 300, height: 350 },
        { id: 'dupatta', name: 'Dupatta', x: 480, y: 100, width: 120, height: 400 }
      ]
    },
    kurti: {
      parts: [
        { id: 'top', name: 'Kurti Top', x: 200, y: 100, width: 200, height: 280 },
        { id: 'bottom', name: 'Bottom', x: 180, y: 400, width: 240, height: 200 }
      ]
    },
    blouse: {
      parts: [
        { id: 'front', name: 'Front Panel', x: 150, y: 100, width: 150, height: 180 },
        { id: 'back', name: 'Back Panel', x: 320, y: 100, width: 150, height: 180 },
        { id: 'sleeves', name: 'Sleeves', x: 200, y: 300, width: 200, height: 80 }
      ]
    },
    dress: {
      parts: [
        { id: 'bodice', name: 'Bodice', x: 200, y: 100, width: 200, height: 200 },
        { id: 'skirt', name: 'Skirt', x: 180, y: 320, width: 240, height: 250 }
      ]
    },
    shirt: {
      parts: [
        { id: 'body', name: 'Shirt Body', x: 200, y: 120, width: 200, height: 250 },
        { id: 'collar', name: 'Collar', x: 220, y: 80, width: 160, height: 40 },
        { id: 'cuffs', name: 'Cuffs', x: 200, y: 390, width: 200, height: 30 }
      ]
    }
  };

  // Handle custom garment types (those starting with 'custom_') with a simple square
  const getGarmentShape = (garmentType) => {
    if (garmentType && garmentType.startsWith('custom_')) {
      return {
        parts: [
          { id: 'main', name: 'Custom Garment', x: 200, y: 200, width: 200, height: 200 }
        ]
      };
    }
    return garmentShapes[garmentType] || garmentShapes.kurti;
  };

  const currentGarment = getGarmentShape(designOptions.garmentType);

  const handleDragOver = (e, partId) => {
    e.preventDefault();
    setDragOverArea(partId);
  };

  const handleDragLeave = () => {
    setDragOverArea(null);
  };

  const handleDrop = (e, partId) => {
    e.preventDefault();
    setDragOverArea(null);
    const fabricData = e.dataTransfer.getData('fabric');
    if (fabricData && onDrop) {
      onDrop(partId, JSON.parse(fabricData));
    }
  };

  // Grid and zoom controls
  const toggleGrid = () => setShowGrid(!showGrid);
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const resetZoom = () => setZoomLevel(1);

  const getPartStyle = (part) => {
    const fabric = selectedFabrics[part.id];
    let style = {
      left: part.x,
      top: part.y,
      width: part.width,
      height: part.height,
    };

    if (fabric) {
      style.backgroundImage = fabric.url ? `url(${fabric.url})` : 'none';
      style.backgroundColor = fabric.color || '#f0f0f0';
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    }

    return style;
  };

  const renderDesignFeatures = (part) => {
    const features = [];
    
    // Add neckline visualization for appropriate parts
    if ((part.id === 'blouse' || part.id === 'choli' || part.id === 'front' || part.id === 'bodice') && designOptions.neckline) {
      const neckStyles = {
        'round': { borderTopLeftRadius: '50%', borderTopRightRadius: '50%' },
        'v-neck': { clipPath: 'polygon(0 0, 100% 0, 80% 30%, 50% 50%, 20% 30%)' },
        'square': { borderRadius: '0' },
        'boat': { borderTopLeftRadius: '20%', borderTopRightRadius: '20%' }
      };
      
      features.push(
        <div 
          key="neckline"
          className="design-feature neckline"
          style={{
            ...neckStyles[designOptions.neckline],
            top: '5%',
            left: '25%',
            width: '50%',
            height: '20%'
          }}
        />
      );
    }

    // Add sleeve indicators
    if (designOptions.sleeves && (part.id === 'top' || part.id === 'choli' || part.id === 'body')) {
      const sleeveWidth = designOptions.sleeves === 'sleeveless' ? '0%' :
                        designOptions.sleeves === 'half' ? '30%' : '50%';
      
      if (designOptions.sleeves !== 'sleeveless') {
        features.push(
          <div key="sleeve-left" className="sleeve-indicator" style={{
            left: '-15%', top: '20%', width: '20%', height: sleeveWidth
          }} />,
          <div key="sleeve-right" className="sleeve-indicator" style={{
            right: '-15%', top: '20%', width: '20%', height: sleeveWidth
          }} />
        );
      }
    }

    return features;
  };

  return (
    <div className="garment-canvas">
      
      <div className="canvas-area" ref={canvasRef}>
        <div className="canvas-container" style={{ transform: `scale(${zoomLevel})` }}>
          <svg className="garment-outline" viewBox="0 0 600 700">
          <defs>
            <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
              <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#e0e4e7" strokeWidth="1" opacity={showGrid ? "0.6" : "0"}/>
            </pattern>
            <pattern id="majorGrid" width={gridSize * 5} height={gridSize * 5} patternUnits="userSpaceOnUse">
              <path d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`} fill="none" stroke="#c5c9cc" strokeWidth="2" opacity={showGrid ? "0.4" : "0"}/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#majorGrid)" />
          
          {/* Grid origin marker */}
          {showGrid && (
            <>
              <circle cx="0" cy="0" r="4" fill="#2C3E50" opacity="0.6" />
              <text x="10" y="15" fontSize="10" fill="#2C3E50" opacity="0.6">Origin (0,0)</text>
            </>
          )}
          
          {/* Center lines */}
          {showGrid && (
            <>
              <line x1="300" y1="0" x2="300" y2="700" stroke="#E67E22" strokeWidth="1" strokeDasharray="5,5" opacity="0.4" />
              <line x1="0" y1="350" x2="600" y2="350" stroke="#E67E22" strokeWidth="1" strokeDasharray="5,5" opacity="0.4" />
            </>
          )}
        </svg>

        {currentGarment.parts.map(part => (
          <div
            key={part.id}
            className={`garment-part ${dragOverArea === part.id ? 'drag-over' : ''} ${selectedFabrics[part.id] ? 'has-fabric' : ''}`}
            style={getPartStyle(part)}
            onDragOver={(e) => handleDragOver(e, part.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, part.id)}
          >
            <div className="part-label">
              <span>{part.name}</span>
              {selectedFabrics[part.id] && (
                <button 
                  className="remove-fabric"
                  onClick={() => onDrop && onDrop(part.id, null)}
                  title="Remove fabric"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="part-content">
              {!selectedFabrics[part.id] && (
                <div className="drop-hint">
                  Drop fabric here
                </div>
              )}
              {renderDesignFeatures(part)}
            </div>

            {/* Design option indicators */}
            <div className="design-indicators">
              {designOptions.fit && (
                <span className="fit-indicator" title={`${designOptions.fit} fit`}>
                  {designOptions.fit.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        ))}

          {/* Measurement lines */}
          <div className="measurement-lines">
            <div className="measurement-line vertical" style={{ left: '50%' }}>
              <span className="measurement-label">Center Line</span>
            </div>
          </div>
        </div>
      </div>

      <div className="canvas-controls">
        <div className="control-group">
          <label className="control-label">Zoom</label>
          <button 
            className="control-btn" 
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            title="Zoom Out"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <span className="zoom-display">{Math.round(zoomLevel * 100)}%</span>
          <button 
            className="control-btn" 
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            title="Zoom In"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
            </svg>
          </button>
          <button 
            className="control-btn" 
            onClick={resetZoom}
            title="Reset Zoom"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
            </svg>
          </button>
        </div>
        
        <div className="control-group">
          <label className="control-label">Grid</label>
          <button 
            className={`control-btn ${showGrid ? 'active' : ''}`}
            onClick={toggleGrid}
            title="Toggle Grid"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
            </svg>
          </button>
          <select 
            className="grid-size-select"
            value={gridSize} 
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            title="Grid Size"
          >
            <option value={10}>Fine</option>
            <option value={20}>Normal</option>
            <option value={40}>Coarse</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default GarmentCanvas;