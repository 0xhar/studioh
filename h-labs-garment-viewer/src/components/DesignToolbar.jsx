import React, { useState } from 'react';
import './DesignToolbar.css';

const DesignToolbar = ({ onDesignChange }) => {
  const [selectedOptions, setSelectedOptions] = useState({
    garmentType: 'kurti',
    neckline: 'round',
    sleeves: 'half',
    hem: 'straight',
    fit: 'regular'
  });

  const garmentTypes = [
    { id: 'saree', name: 'Saree', icon: '👘' },
    { id: 'lehenga', name: 'Lehenga', icon: '👗' },
    { id: 'kurti', name: 'Kurti', icon: '👚' },
    { id: 'blouse', name: 'Blouse', icon: '👔' },
    { id: 'dress', name: 'Dress', icon: '👗' },
    { id: 'shirt', name: 'Shirt', icon: '👕' }
  ];

  const necklineOptions = [
    { id: 'round', name: 'Round', icon: '⭕' },
    { id: 'v-neck', name: 'V-Neck', icon: '🔻' },
    { id: 'boat', name: 'Boat', icon: '🚤' },
    { id: 'square', name: 'Square', icon: '⏹️' },
    { id: 'collar', name: 'Collar', icon: '👔' },
    { id: 'keyhole', name: 'Keyhole', icon: '🗝️' }
  ];

  const sleeveOptions = [
    { id: 'sleeveless', name: 'Sleeveless', icon: '🚫' },
    { id: 'half', name: 'Half Sleeve', icon: '🤏' },
    { id: 'full', name: 'Full Sleeve', icon: '🤚' },
    { id: 'bell', name: 'Bell Sleeve', icon: '🔔' },
    { id: 'puff', name: 'Puff Sleeve', icon: '💨' }
  ];

  const hemOptions = [
    { id: 'straight', name: 'Straight', icon: '➖' },
    { id: 'flared', name: 'Flared', icon: '📐' },
    { id: 'layered', name: 'Layered', icon: '📚' },
    { id: 'pleated', name: 'Pleated', icon: '🪗' }
  ];

  const fitOptions = [
    { id: 'slim', name: 'Slim Fit', icon: '📏' },
    { id: 'regular', name: 'Regular Fit', icon: '👕' },
    { id: 'loose', name: 'Loose Fit', icon: '🛍️' }
  ];

  const embellishments = [
    { id: 'aari', name: 'Aari Work', icon: '🪡', color: '#D4AF37' },
    { id: 'zari', name: 'Zari', icon: '✨', color: '#FFD700' },
    { id: 'lace', name: 'Lace', icon: '🕸️', color: '#F5F5F5' },
    { id: 'sequins', name: 'Sequins', icon: '💎', color: '#C0C0C0' },
    { id: 'borders', name: 'Borders', icon: '🎀', color: '#FF69B4' }
  ];

  const handleOptionChange = (category, value) => {
    const newOptions = { ...selectedOptions, [category]: value };
    setSelectedOptions(newOptions);
    onDesignChange(newOptions);
  };

  const OptionSection = ({ title, options, selectedValue, category }) => (
    <div className="option-section">
      <h3 className="section-title">{title}</h3>
      <div className="option-grid">
        {options.map(option => (
          <button
            key={option.id}
            className={`option-button ${selectedValue === option.id ? 'selected' : ''}`}
            onClick={() => handleOptionChange(category, option.id)}
            title={option.name}
          >
            <span className="option-icon">{option.icon}</span>
            <span className="option-name">{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

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
            fit: 'regular'
          };
          setSelectedOptions(defaultOptions);
          onDesignChange(defaultOptions);
        }}>
          Reset All
        </button>
      </div>

      <div className="toolbar-content">
        <OptionSection 
          title="Garment Type"
          options={garmentTypes}
          selectedValue={selectedOptions.garmentType}
          category="garmentType"
        />

        <OptionSection 
          title="Neckline"
          options={necklineOptions}
          selectedValue={selectedOptions.neckline}
          category="neckline"
        />

        <OptionSection 
          title="Sleeves"
          options={sleeveOptions}
          selectedValue={selectedOptions.sleeves}
          category="sleeves"
        />

        <OptionSection 
          title="Hem Style"
          options={hemOptions}
          selectedValue={selectedOptions.hem}
          category="hem"
        />

        <OptionSection 
          title="Fit"
          options={fitOptions}
          selectedValue={selectedOptions.fit}
          category="fit"
        />

        <div className="option-section">
          <h3 className="section-title">Embellishments</h3>
          <div className="embellishment-grid">
            {embellishments.map(embellishment => (
              <button
                key={embellishment.id}
                className="embellishment-button"
                style={{ '--accent-color': embellishment.color }}
                onClick={() => console.log(`Adding ${embellishment.name}`)}
                title={embellishment.name}
              >
                <span className="embellishment-icon">{embellishment.icon}</span>
                <span className="embellishment-name">{embellishment.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignToolbar;