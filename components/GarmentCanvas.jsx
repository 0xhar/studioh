import React, { useState, useRef } from 'react';
import './GarmentCanvas.css';

const GarmentCanvas = ({ designOptions, selectedFabrics, onDrop }) => {
  const [dragOverArea, setDragOverArea] = useState(null);
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

  const currentGarment = garmentShapes[designOptions.garmentType] || garmentShapes.kurti;

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
      <div className="canvas-header">
        <h3>Design Canvas - {currentGarment.parts.find(p => p.id)?.name || 'Custom Garment'}</h3>
        <div className="canvas-info">
          <span>Drag fabrics from the right panel to garment parts</span>
        </div>
      </div>
      
      <div className="canvas-area" ref={canvasRef}>
        <svg className="garment-outline" viewBox="0 0 600 700">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
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

      <div className="canvas-controls">
        <button className="control-btn" title="Zoom In">🔍+</button>
        <button className="control-btn" title="Zoom Out">🔍-</button>
        <button className="control-btn" title="Reset View">⚙️</button>
        <button className="control-btn" title="Grid Toggle">▦</button>
      </div>
    </div>
  );
};

export default GarmentCanvas;