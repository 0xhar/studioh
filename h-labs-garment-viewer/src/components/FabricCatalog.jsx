import React, { useState } from 'react';
import './FabricCatalog.css';

const FabricCatalog = ({ onFabricSelect }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: '',
    pattern: '',
    color: ''
  });

  // Predefined fabric catalog
  const fabricCatalog = [
    { id: 1, name: 'Royal Blue Silk', type: 'silk', pattern: 'plain', color: 'blue', price: 1200, image: null, colorHex: '#1e3a8a' },
    { id: 2, name: 'Rose Gold Brocade', type: 'brocade', pattern: 'floral', color: 'gold', price: 2500, image: null, colorHex: '#fbbf24' },
    { id: 3, name: 'Emerald Green Georgette', type: 'georgette', pattern: 'plain', color: 'green', price: 800, image: null, colorHex: '#059669' },
    { id: 4, name: 'Maroon Velvet', type: 'velvet', pattern: 'plain', color: 'red', price: 1500, image: null, colorHex: '#7c2d12' },
    { id: 5, name: 'Ivory Chiffon Floral', type: 'chiffon', pattern: 'floral', color: 'white', price: 900, image: null, colorHex: '#fef3c7' },
    { id: 6, name: 'Black Net with Gold', type: 'net', pattern: 'geometric', color: 'black', price: 1100, image: null, colorHex: '#000000' },
    { id: 7, name: 'Pink Cotton Printed', type: 'cotton', pattern: 'printed', color: 'pink', price: 600, image: null, colorHex: '#ec4899' },
    { id: 8, name: 'Orange Kanjivaram', type: 'silk', pattern: 'traditional', color: 'orange', price: 3000, image: null, colorHex: '#ea580c' },
    { id: 9, name: 'Purple Banarasi', type: 'silk', pattern: 'zari', color: 'purple', price: 2800, image: null, colorHex: '#7c3aed' },
    { id: 10, name: 'Cream Tussar', type: 'silk', pattern: 'plain', color: 'cream', price: 1400, image: null, colorHex: '#fef3c7' },
    { id: 11, name: 'Peacock Blue Handloom', type: 'cotton', pattern: 'stripes', color: 'blue', price: 750, image: null, colorHex: '#0369a1' },
    { id: 12, name: 'Wine Red Satin', type: 'satin', pattern: 'plain', color: 'red', price: 1000, image: null, colorHex: '#991b1b' },
  ];

  const fabricTypes = ['silk', 'cotton', 'chiffon', 'georgette', 'velvet', 'brocade', 'net', 'satin'];
  const patterns = ['plain', 'floral', 'geometric', 'stripes', 'printed', 'traditional', 'zari'];
  const colors = ['blue', 'red', 'green', 'gold', 'white', 'black', 'pink', 'orange', 'purple', 'cream'];

  const filteredFabrics = fabricCatalog.filter(fabric => {
    const matchesSearch = fabric.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedFilters.type || fabric.type === selectedFilters.type;
    const matchesPattern = !selectedFilters.pattern || fabric.pattern === selectedFilters.pattern;
    const matchesColor = !selectedFilters.color || fabric.color === selectedFilters.color;
    return matchesSearch && matchesType && matchesPattern && matchesColor;
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const customFabric = {
          id: `custom_${Date.now()}`,
          name: file.name,
          type: 'custom',
          pattern: 'custom',
          color: 'custom',
          price: 0,
          image: e.target.result,
          url: e.target.result
        };
        onFabricSelect(customFabric);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFabricDragStart = (e, fabric) => {
    const fabricData = {
      id: fabric.id,
      name: fabric.name,
      color: fabric.colorHex,
      url: fabric.image,
      type: fabric.type
    };
    e.dataTransfer.setData('fabric', JSON.stringify(fabricData));
  };

  const resetFilters = () => {
    setSelectedFilters({ type: '', pattern: '', color: '' });
    setSearchTerm('');
  };

  return (
    <div className="fabric-catalog">
      <div className="catalog-header">
        <h2>Fabric Selection</h2>
        <div className="catalog-tabs">
          <button 
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload
          </button>
          <button 
            className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            Catalog
          </button>
        </div>
      </div>

      <div className="catalog-content">
        {activeTab === 'upload' && (
          <div className="upload-section">
            <div className="upload-area">
              <input
                type="file"
                id="fabric-upload"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="fabric-upload" className="upload-label">
                <div className="upload-icon">📁</div>
                <h3>Upload Custom Fabric</h3>
                <p>Click to browse or drag & drop</p>
                <small>JPG, PNG up to 5MB • Recommended: 1024×1024px</small>
              </label>
            </div>
            
            <div className="upload-tips">
              <h4>Upload Tips:</h4>
              <ul>
                <li>Use high-resolution images for better texture quality</li>
                <li>Ensure seamless patterns for repetitive designs</li>
                <li>Avoid images with harsh shadows or distortions</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="catalog-section">
            <div className="search-filters">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search fabrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>

              <div className="filters">
                <select
                  value={selectedFilters.type}
                  onChange={(e) => setSelectedFilters({...selectedFilters, type: e.target.value})}
                  className="filter-select"
                >
                  <option value="">All Types</option>
                  {fabricTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>

                <select
                  value={selectedFilters.pattern}
                  onChange={(e) => setSelectedFilters({...selectedFilters, pattern: e.target.value})}
                  className="filter-select"
                >
                  <option value="">All Patterns</option>
                  {patterns.map(pattern => (
                    <option key={pattern} value={pattern}>{pattern.charAt(0).toUpperCase() + pattern.slice(1)}</option>
                  ))}
                </select>

                <select
                  value={selectedFilters.color}
                  onChange={(e) => setSelectedFilters({...selectedFilters, color: e.target.value})}
                  className="filter-select"
                >
                  <option value="">All Colors</option>
                  {colors.map(color => (
                    <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                  ))}
                </select>

                <button className="reset-filters" onClick={resetFilters}>
                  Clear All
                </button>
              </div>
            </div>

            <div className="fabric-grid">
              {filteredFabrics.map(fabric => (
                <div
                  key={fabric.id}
                  className="fabric-card"
                  draggable
                  onDragStart={(e) => handleFabricDragStart(e, fabric)}
                  onClick={() => onFabricSelect(fabric)}
                  title={`${fabric.name} - ₹${fabric.price}`}
                >
                  <div 
                    className="fabric-preview"
                    style={{ 
                      backgroundColor: fabric.colorHex,
                      backgroundImage: fabric.image ? `url(${fabric.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="fabric-overlay">
                      <span className="fabric-type">{fabric.type}</span>
                      <span className="fabric-price">₹{fabric.price}</span>
                    </div>
                  </div>
                  
                  <div className="fabric-info">
                    <h4 className="fabric-name">{fabric.name}</h4>
                    <div className="fabric-tags">
                      <span className="tag pattern-tag">{fabric.pattern}</span>
                      <span className="tag color-tag">{fabric.color}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFabrics.length === 0 && (
              <div className="no-results">
                <div className="no-results-icon">🧵</div>
                <h3>No fabrics found</h3>
                <p>Try adjusting your search or filters</p>
                <button onClick={resetFilters} className="reset-btn">
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="catalog-footer">
        <div className="fabric-count">
          {activeTab === 'catalog' && (
            <span>Showing {filteredFabrics.length} of {fabricCatalog.length} fabrics</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FabricCatalog;