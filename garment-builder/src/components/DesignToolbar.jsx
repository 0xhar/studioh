import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './DesignToolbar.css';

const DesignToolbar = ({ onDesignChange, initialDesignOptions }) => {
  const [selectedOptions, setSelectedOptions] = useState(
    initialDesignOptions || {
      garmentType: 'kurti',
      neckline: 'round',
      sleeves: 'half',
      hem: 'straight',
      fit: 'regular',
      embellishments: [],
      customDescription: ''
    }
  );

  const [customOptions, setCustomOptions] = useState({
    garmentType: [],
    neckline: [],
    sleeves: [],
    hem: [],
    fit: [],
    embellishments: []
  });

  const [showCustomDescModal, setShowCustomDescModal] = useState(false);
  const [tempCustomDescription, setTempCustomDescription] = useState('');

  // Sync with initialDesignOptions when they change
  useEffect(() => {
    if (initialDesignOptions) {
      setSelectedOptions(initialDesignOptions);
    }
  }, [initialDesignOptions]);

  const garmentTypes = [
    { id: 'saree', name: 'Saree' },
    { id: 'lehenga', name: 'Lehenga' },
    { id: 'kurti', name: 'Kurti' },
    { id: 'blouse', name: 'Blouse' },
    { id: 'dress', name: 'Dress' },
    { id: 'shirt', name: 'Shirt' }
  ];

  const necklineOptions = [
    { id: 'round', name: 'Round' },
    { id: 'v-neck', name: 'V-Neck' },
    { id: 'boat', name: 'Boat' },
    { id: 'square', name: 'Square' },
    { id: 'collar', name: 'Collar' },
    { id: 'keyhole', name: 'Keyhole' }
  ];

  const sleeveOptions = [
    { id: 'sleeveless', name: 'Sleeveless' },
    { id: 'half', name: 'Half Sleeve' },
    { id: 'full', name: 'Full Sleeve' },
    { id: 'bell', name: 'Bell Sleeve' },
    { id: 'puff', name: 'Puff Sleeve' }
  ];

  const hemOptions = [
    { id: 'straight', name: 'Straight' },
    { id: 'flared', name: 'Flared' },
    { id: 'layered', name: 'Layered' },
    { id: 'pleated', name: 'Pleated' }
  ];

  const fitOptions = [
    { id: 'slim', name: 'Slim Fit' },
    { id: 'regular', name: 'Regular Fit' },
    { id: 'loose', name: 'Loose Fit' }
  ];

  const embellishments = [
    { id: 'aari', name: 'Aari Work', color: '#8B7355' },
    { id: 'zari', name: 'Zari', color: '#B8860B' },
    { id: 'lace', name: 'Lace', color: '#E6E6FA' },
    { id: 'sequins', name: 'Sequins', color: '#708090' },
    { id: 'borders', name: 'Borders', color: '#8B4789' }
  ];

  const handleOptionChange = (category, value) => {
    const newOptions = { ...selectedOptions, [category]: value };
    setSelectedOptions(newOptions);
    onDesignChange(newOptions);
  };

  const handleEmbellishmentToggle = (embellishmentId) => {
    const currentEmbellishments = selectedOptions.embellishments || [];
    let newEmbellishments;
    
    if (currentEmbellishments.includes(embellishmentId)) {
      // Remove embellishment if already selected
      newEmbellishments = currentEmbellishments.filter(id => id !== embellishmentId);
    } else {
      // Add embellishment if not selected
      newEmbellishments = [...currentEmbellishments, embellishmentId];
    }
    
    const newOptions = { ...selectedOptions, embellishments: newEmbellishments };
    setSelectedOptions(newOptions);
    onDesignChange(newOptions);
  };

  const addCustomOption = (category, customValue) => {
    if (!customValue.trim()) return;
    
    const customId = `custom_${customValue.toLowerCase().replace(/\s+/g, '_')}`;
    const customOption = { id: customId, name: customValue };
    
    // Add to custom options
    setCustomOptions(prev => ({
      ...prev,
      [category]: [...prev[category], customOption]
    }));
    
    // Automatically select the new custom option
    const newOptions = { ...selectedOptions, [category]: customId };
    setSelectedOptions(newOptions);
    onDesignChange(newOptions);
  };

  const handleCustomDescriptionOpen = () => {
    setTempCustomDescription(selectedOptions.customDescription || '');
    setShowCustomDescModal(true);
  };

  const handleCustomDescriptionSave = () => {
    const newOptions = { ...selectedOptions, customDescription: tempCustomDescription };
    setSelectedOptions(newOptions);
    onDesignChange(newOptions);
    setShowCustomDescModal(false);
  };

  const handleCustomDescriptionCancel = () => {
    setTempCustomDescription('');
    setShowCustomDescModal(false);
  };

  const CustomDropdownSection = ({ title, options, selectedValue, category }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    
    // Combine default options with custom options
    const allOptions = [...options, ...customOptions[category]];
    const selectedOption = allOptions.find(opt => opt.id === selectedValue) || options[0];
    
    const handleSelect = (optionId) => {
      handleOptionChange(category, optionId);
      setIsOpen(false);
    };
    
    const handleAddCustom = () => {
      if (customInput.trim()) {
        addCustomOption(category, customInput.trim());
        setCustomInput('');
        setShowCustomInput(false);
        setIsOpen(false);
      }
    };
    
    return (
      <div className="option-section">
        <h3 className="section-title">{title}</h3>
        <div className="custom-dropdown">
          <div 
            className="dropdown-header"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="selected-value">{selectedOption.name}</span>
            <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
          </div>
          
          {isOpen && (
            <div className="dropdown-content">
              {allOptions.map(option => (
                <div
                  key={option.id}
                  className={`dropdown-item ${selectedValue === option.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.id)}
                >
                  {option.name}
                </div>
              ))}
              
              <div className="dropdown-divider"></div>
              
              {!showCustomInput ? (
                <div 
                  className="dropdown-item add-custom"
                  onClick={() => setShowCustomInput(true)}
                >
                  + Add Custom {title}
                </div>
              ) : (
                <div className="custom-input-container">
                  <input
                    type="text"
                    className="custom-input"
                    placeholder={`Enter custom ${title.toLowerCase()}`}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustom();
                      } else if (e.key === 'Escape') {
                        setShowCustomInput(false);
                        setCustomInput('');
                      }
                    }}
                    autoFocus
                  />
                  <div className="custom-input-buttons">
                    <button 
                      className="custom-btn add-btn"
                      onClick={handleAddCustom}
                    >
                      Add
                    </button>
                    <button 
                      className="custom-btn cancel-btn"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomInput('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="design-toolbar">
      <div className="toolbar-header">
        <h2>Design Options</h2>
        <button className="reset-btn" onClick={() => {
          const defaultOptions = {
            garmentType: 'kurti',
            neckline: 'round',
            sleeves: 'half',
            hem: 'straight',
            fit: 'regular',
            embellishments: [],
            customDescription: ''
          };
          setSelectedOptions(defaultOptions);
          setCustomOptions({
            garmentType: [],
            neckline: [],
            sleeves: [],
            hem: [],
            fit: [],
            embellishments: []
          });
          onDesignChange(defaultOptions);
        }}>
          Reset All
        </button>
      </div>

      <div className="toolbar-content">
        <CustomDropdownSection 
          title="Garment Type"
          options={garmentTypes}
          selectedValue={selectedOptions.garmentType}
          category="garmentType"
        />

        <CustomDropdownSection 
          title="Neckline"
          options={necklineOptions}
          selectedValue={selectedOptions.neckline}
          category="neckline"
        />

        <CustomDropdownSection 
          title="Sleeves"
          options={sleeveOptions}
          selectedValue={selectedOptions.sleeves}
          category="sleeves"
        />

        <CustomDropdownSection 
          title="Hem Style"
          options={hemOptions}
          selectedValue={selectedOptions.hem}
          category="hem"
        />

        <CustomDropdownSection 
          title="Fit"
          options={fitOptions}
          selectedValue={selectedOptions.fit}
          category="fit"
        />

        <div className="option-section">
          <h3 className="section-title">Embellishments</h3>
          <div className="embellishment-grid">
            {[...embellishments, ...customOptions.embellishments].map(embellishment => (
              <button
                key={embellishment.id}
                className={`embellishment-button ${selectedOptions.embellishments?.includes(embellishment.id) ? 'selected' : ''}`}
                style={{ '--accent-color': embellishment.color || '#667eea' }}
                onClick={() => handleEmbellishmentToggle(embellishment.id)}
                title={embellishment.name}
              >
                <div className="embellishment-color" style={{ backgroundColor: embellishment.color || '#667eea' }}></div>
                <span className="embellishment-name">{embellishment.name}</span>
              </button>
            ))}
            <button
              className="embellishment-button add-embellishment-btn"
              onClick={() => {
                const customName = prompt('Enter custom embellishment name:');
                if (customName && customName.trim()) {
                  const customColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                  const customId = `custom_${customName.toLowerCase().replace(/\s+/g, '_')}`;
                  const customEmbellishment = { 
                    id: customId, 
                    name: customName.trim(),
                    color: customColor
                  };
                  
                  setCustomOptions(prev => ({
                    ...prev,
                    embellishments: [...prev.embellishments, customEmbellishment]
                  }));
                  
                  // Auto-select the new embellishment
                  handleEmbellishmentToggle(customId);
                }
              }}
              title="Add Custom Embellishment"
            >
              <div className="embellishment-color add-icon">+</div>
              <span className="embellishment-name">Add Custom</span>
            </button>
          </div>
        </div>

        <div className="option-section">
          <h3 className="section-title">Custom Description</h3>
          <div className="custom-description-section">
            <button 
              className="custom-description-btn"
              onClick={handleCustomDescriptionOpen}
              title="Add custom details to enhance your design generation. Only provide relevant details that complement your selected options."
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16l4-4 4 4V4a2 2 0 00-2-2z"/>
              </svg>
              {selectedOptions.customDescription ? 'Edit Custom Details' : 'Add Custom Details'}
            </button>
            {selectedOptions.customDescription && (
              <div className="custom-description-preview">
                <strong>Current details:</strong>
                <p>{selectedOptions.customDescription.length > 100 
                    ? selectedOptions.customDescription.substring(0, 100) + '...' 
                    : selectedOptions.customDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Description Modal - Using Portal to render at document level */}
      {showCustomDescModal && createPortal(
        <div className="custom-description-modal">
          <div className="modal-overlay" onClick={handleCustomDescriptionCancel} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Custom Description</h3>
              <button className="modal-close" onClick={handleCustomDescriptionCancel}>×</button>
            </div>
            
            <div className="textarea-section-main">
              <textarea
                className="custom-description-textarea"
                placeholder="Example: 'Elegant and sophisticated design suitable for formal occasions with subtle shimmer and flowing silhouette. Inspired by contemporary minimalism with traditional touches.'"
                value={tempCustomDescription}
                onChange={(e) => setTempCustomDescription(e.target.value)}
                rows={3}
                maxLength={500}
                autoFocus
              />
              <div className={`character-count ${tempCustomDescription.length >= 450 ? 'near-limit' : ''} ${tempCustomDescription.length >= 500 ? 'at-limit' : ''}`}>
                {tempCustomDescription.length}/500 characters
              </div>
            </div>
            
            <div className="modal-body">
              <div className="info-section">
                <div className="info-item">
                  <span className="info-icon">ℹ️</span>
                  <div className="info-text">
                    <strong>Tips for effective descriptions:</strong>
                    <ul>
                      <li>Add specific details about style, mood, or theme</li>
                      <li>Mention preferred colors, patterns, or textures</li>
                      <li>Describe the occasion or setting for the garment</li>
                      <li>Keep it relevant to complement your selected options</li>
                    </ul>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">⚠️</span>
                  <div className="info-text">
                    <strong>Note:</strong> Your selected options (garment type, neckline, sleeves, etc.) will not be overridden. This description adds additional details to enhance the generation.
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={handleCustomDescriptionCancel}>
                Cancel
              </button>
              <button className="modal-btn save" onClick={handleCustomDescriptionSave}>
                Save Description
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DesignToolbar;