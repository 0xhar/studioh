import React, { useState, useEffect } from 'react';
import './GarmentMockup2D.css';
import { saveVersion } from '../services/versionService';
import { getProjectId } from '../utils/projectUtils';

const GarmentMockup2D = ({ designOptions, selectedFabrics, onGenerateRef }) => {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Modal and zoom state
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState({ src: null, alt: null });
  const [zoomLevel, setZoomLevel] = useState(1);

  // AI API Configuration
  const AI_CONFIG = {
    openai: {
      url: 'https://api.openai.com/v1/images/generations',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    },
    replicate: {
      url: 'https://api.replicate.com/v1/predictions',
      headers: {
        'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    },
    stability: {
      url: 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_STABILITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  };

  // Option mapping for better AI descriptions
  const OPTION_DESCRIPTIONS = {
    sleeves: {
      'sleeveless': 'sleeveless',
      'half': 'half sleeves',
      'full': 'full sleeves',
      'bell': 'bell sleeves',
      'puff': 'puff sleeves'
    },
    hem: {
      'straight': 'straight hem',
      'flared': 'flared hem',
      'layered': 'layered hem',
      'pleated': 'pleated hem'
    },
    fit: {
      'slim': 'slim fit',
      'regular': 'regular fit',
      'loose': 'loose fit'
    },
    neckline: {
      'round': 'round neckline',
      'v-neck': 'V-neckline',
      'boat': 'boat neckline',
      'square': 'square neckline',
      'collar': 'collar neckline',
      'keyhole': 'keyhole neckline'
    },
    embellishments: {
      'aari': 'intricate Aari embroidery work',
      'zari': 'golden Zari thread work',
      'lace': 'delicate lace detailing',
      'sequins': 'shimmering sequin work',
      'borders': 'decorative border patterns'
    }
  };

  // Dynamic prompt templates with placeholders for combined front and back views
  const PROMPT_TEMPLATES = {
    saree: "Beautiful Indian saree displayed on fashion mannequin showing both front and back views side by side, {FABRIC_DESCRIPTION}, {NECKLINE} blouse with {SLEEVES}, {HEM}, elegant draping style, {FIT} silhouette, {EMBELLISHMENTS}, traditional Indian garment, studio photography, white background, realistic fabric texture, detailed craftsmanship, dual view composition",
    
    lehenga: "Elegant Indian lehenga displayed on fashion mannequin showing both front and back views side by side, {FABRIC_DESCRIPTION}, {NECKLINE} choli with {SLEEVES}, {HEM} A-line skirt, {FIT} silhouette, {EMBELLISHMENTS}, traditional Indian ethnic wear, studio photography, white background, realistic fabric texture, intricate detailing, dual view composition",
    
    kurti: "Stylish Indian kurti displayed on fashion mannequin showing both front and back views side by side, {FABRIC_DESCRIPTION}, {NECKLINE} with {SLEEVES}, {HEM} length, {FIT} silhouette, {EMBELLISHMENTS}, contemporary ethnic wear, studio photography, white background, realistic fabric texture, modern Indian fashion, dual view composition",
    
    blouse: "Indian saree blouse displayed on fashion mannequin showing both front and back views side by side, {FABRIC_DESCRIPTION}, {NECKLINE} design with {SLEEVES}, {HEM}, {FIT} silhouette, {EMBELLISHMENTS}, traditional blouse style, studio photography, white background, realistic fabric texture, detailed tailoring, dual view composition",
    
    dress: "Indian ethnic dress displayed on fashion mannequin showing both front and back views side by side, {FABRIC_DESCRIPTION}, {NECKLINE} with {SLEEVES}, {HEM} style, {FIT} silhouette, {EMBELLISHMENTS}, Indo-western fusion ethnic wear, studio photography, white background, realistic fabric texture, contemporary design, dual view composition",
    
    shirt: "Indian ethnic shirt displayed on fashion mannequin showing both front and back views side by side, {FABRIC_DESCRIPTION}, {NECKLINE} collar with {SLEEVES}, {HEM} style, {FIT} silhouette, {EMBELLISHMENTS}, traditional menswear style, studio photography, white background, realistic fabric texture, classic tailoring, dual view composition",
    
    custom: "Custom {GARMENT_TYPE} garment displayed on fashion mannequin showing both front and back views side by side, {FABRIC_DESCRIPTION}, {NECKLINE} design with {SLEEVES}, {HEM} style, {FIT} silhouette, {EMBELLISHMENTS}, modern ethnic wear design, studio photography, white background, realistic fabric texture, professional tailoring, dual view composition"
  };

  // Generate fabric description from uploaded fabric
  const getFabricDescription = (fabric) => {
    if (!fabric) return 'white cotton';
    
    // For custom uploaded fabrics, use a special description
    if (fabric.type === 'custom' && (fabric.image || fabric.url)) {
      return `custom uploaded fabric with unique pattern and texture from user's image file "${fabric.name || 'uploaded fabric'}" - this is a specific fabric pattern that must be accurately reproduced from the uploaded image`;
    }
    
    const color = fabric.color || fabric.name || 'white';
    const pattern = fabric.pattern || fabric.name || '';
    const type = fabric.type || '';
    
    // Smart pattern detection from fabric name/pattern
    if (pattern && pattern.toLowerCase().includes('floral')) {
      return `${color} floral print`;
    } else if (pattern && pattern.toLowerCase().includes('paisley')) {
      return `${color} paisley design`;
    } else if (pattern && pattern.toLowerCase().includes('geometric')) {
      return `${color} geometric pattern`;
    } else if (pattern && pattern.toLowerCase().includes('stripe')) {
      return `${color} striped pattern`;
    } else if (pattern && pattern.toLowerCase().includes('dot')) {
      return `${color} polka dot`;
    } else if (pattern && pattern.toLowerCase().includes('block')) {
      return `${color} block print`;
    } else if (pattern && pattern.toLowerCase().includes('embroidery')) {
      return `${color} embroidered`;
    } else if (pattern && pattern.toLowerCase().includes('brocade')) {
      return `${color} brocade`;
    } else if (pattern && pattern.toLowerCase().includes('silk')) {
      return `${color} silk`;
    } else if (pattern && pattern.toLowerCase().includes('velvet')) {
      return `${color} velvet`;
    } else if (pattern && pattern.toLowerCase().includes('chiffon')) {
      return `${color} chiffon`;
    } else if (pattern && pattern.toLowerCase().includes('handloom')) {
      return `${color} handloom`;
    } else if (pattern && pattern.toLowerCase().includes('cotton')) {
      return `${color} cotton`;
    } else if (pattern) {
      return `${color} ${pattern}`;
    } else {
      return `${color}`;
    }
  };

  // Filter out empty or default fabrics to get only user-selected ones
  const getActualUserFabrics = (selectedFabrics) => {
    const fabrics = selectedFabrics || {};
    const actualFabrics = {};
    
    Object.entries(fabrics).forEach(([part, fabric]) => {
      // Only include if fabric exists and has meaningful data (not just defaults)
      if (fabric && (fabric.name || fabric.color || fabric.image) && 
          fabric.name !== 'Default' && fabric.color !== 'white') {
        actualFabrics[part] = fabric;
      }
    });
    
    return actualFabrics;
  };

  // Generate comprehensive fabric description for all garment parts
  const getComprehensiveFabricDescription = (selectedFabrics, garmentType) => {
    const actualFabrics = getActualUserFabrics(selectedFabrics);
    const fabricParts = [];
    
    // Process each fabric part the user has actually selected
    Object.entries(actualFabrics).forEach(([part, fabric]) => {
      const fabricDesc = getFabricDescription(fabric);
      fabricParts.push(`${part} in ${fabricDesc}`);
    });
    
    if (fabricParts.length === 0) {
      return 'white cotton fabric';
    } else if (fabricParts.length === 1) {
      return fabricParts[0].replace(`${Object.keys(actualFabrics)[0]} in `, '');
    } else {
      return fabricParts.join(', ');
    }
  };

  // Prepare fabric images and descriptions for AI
  const prepareFabricImagesForAI = (selectedFabrics) => {
    const actualFabrics = getActualUserFabrics(selectedFabrics);
    const fabricImages = [];
    
    console.log('prepareFabricImagesForAI - actualFabrics:', actualFabrics);
    
    Object.entries(actualFabrics).forEach(([part, fabric]) => {
      console.log(`Processing fabric for ${part}:`, fabric);
      if (fabric.image || fabric.url) {
        const fabricImage = {
          part: part,
          url: fabric.image || fabric.url,
          description: `${part} fabric: ${getFabricDescription(fabric)}`,
          name: fabric.name || fabric.color
        };
        fabricImages.push(fabricImage);
        console.log('Added fabric image:', fabricImage);
      }
    });
    
    console.log('Final fabricImages array:', fabricImages);
    return fabricImages;
  };

  // Generate dynamic prompt by filling placeholders for combined front and back view
  const generateEnhancedPrompt = () => {
    // Extract user selections
    const garmentType = designOptions.garmentType || 'kurti';
    const necklineId = designOptions.neckline || 'round';
    const sleevesId = designOptions.sleeves || 'half';
    const hemId = designOptions.hem || 'straight';
    const fitId = designOptions.fit || 'regular';
    const embellishmentIds = designOptions.embellishments || [];
    
    // Convert IDs to descriptive terms for AI
    // Handle custom options by extracting the custom name from the ID
    const getDescriptiveTerm = (category, id) => {
      if (OPTION_DESCRIPTIONS[category] && OPTION_DESCRIPTIONS[category][id]) {
        return OPTION_DESCRIPTIONS[category][id];
      }
      // If it's a custom option, extract the readable name from the ID
      if (id && id.startsWith('custom_')) {
        return id.replace('custom_', '').replace(/_/g, ' ');
      }
      return id;
    };
    
    const necklineDesc = getDescriptiveTerm('neckline', necklineId);
    const sleevesDesc = getDescriptiveTerm('sleeves', sleevesId);
    const hemDesc = getDescriptiveTerm('hem', hemId);
    const fitDesc = getDescriptiveTerm('fit', fitId);
    
    // Generate embellishments description
    const embellishmentsDesc = embellishmentIds.length > 0 
      ? embellishmentIds
          .map(id => getDescriptiveTerm('embellishments', id))
          .join(', ')
      : '';
    
    // Get comprehensive fabric description for all applied fabrics
    const fabricDescription = getComprehensiveFabricDescription(selectedFabrics, garmentType);
    
    // Prepare fabric images for AI processing
    const fabricImages = prepareFabricImagesForAI(selectedFabrics);
    
    // Get template for garment type - use custom template for custom garments
    let template;
    if (garmentType && garmentType.startsWith('custom_')) {
      template = PROMPT_TEMPLATES.custom;
    } else {
      template = PROMPT_TEMPLATES[garmentType] || PROMPT_TEMPLATES.kurti;
    }
    
    // Extract readable garment name for custom types
    const getGarmentDisplayName = (garmentType) => {
      if (garmentType && garmentType.startsWith('custom_')) {
        // Convert "custom_evening_gown" to "evening gown"
        return garmentType.replace('custom_', '').replace(/_/g, ' ');
      }
      return garmentType;
    };

    // Create placeholder replacements based on user selections with descriptive terms
    const replacements = {
      '{FABRIC_DESCRIPTION}': fabricDescription,
      '{NECKLINE}': necklineDesc,
      '{SLEEVES}': sleevesDesc,
      '{HEM}': hemDesc,
      '{FIT}': fitDesc,
      '{EMBELLISHMENTS}': embellishmentsDesc,
      '{GARMENT_TYPE}': getGarmentDisplayName(garmentType)
    };
    
    // Fill template with actual user selections
    let filledPrompt = template;
    Object.entries(replacements).forEach(([placeholder, value]) => {
      filledPrompt = filledPrompt.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // Add custom description if provided
    if (designOptions.customDescription && designOptions.customDescription.trim()) {
      filledPrompt += `. Additional details: ${designOptions.customDescription.trim()}`;
    }
    
    // Enhanced negative prompts for better quality
    const negativePrompts = 'blurry, low resolution, distorted fabric, unrealistic texture, poor lighting, watermarks, text overlays, cartoon style, single view, incomplete garment, cropped image';
    
    console.log('Combined dual-view prompt generated:', {
      garmentType,
      originalSelections: { neckline: necklineId, sleeves: sleevesId, hem: hemId, fit: fitId, embellishments: embellishmentIds },
      descriptiveTerms: { neckline: necklineDesc, sleeves: sleevesDesc, hem: hemDesc, fit: fitDesc, embellishments: embellishmentsDesc },
      selectedFabrics: Object.keys(selectedFabrics || {}),
      fabricDescription,
      customDescription: designOptions.customDescription || 'None',
      fabricImages: fabricImages.map(img => ({ part: img.part, description: img.description })),
      finalPrompt: filledPrompt
    });
    
    return {
      positive: filledPrompt,
      negative: negativePrompts,
      fabricImages: fabricImages, // Pass all fabric images with descriptions
      userSelections: { garmentType, neckline: necklineDesc, sleeves: sleevesDesc, hem: hemDesc, fit: fitDesc },
      fabricDetails: selectedFabrics // Pass all fabric details for reference
    };
  };

  // OpenAI DALL-E 3 Integration with fabric image reference for combined view
  const generateWithOpenAI = async (prompt) => {
    // For DALL-E 3, we'll enhance the text prompt with detailed fabric descriptions
    // since DALL-E 3 doesn't support image input directly
    let enhancedPrompt = prompt.positive;
    
    console.log('OpenAI generateWithOpenAI - received fabricImages:', prompt.fabricImages);
    
    if (prompt.fabricImages && prompt.fabricImages.length > 0) {
      console.log('OpenAI: Using GPT-4 Vision for fabric image analysis');
      
      try {
        // Analyze fabric images using GPT-4 Vision
        const fabricAnalyses = await Promise.all(
          prompt.fabricImages.map(async (fabricImg) => {
            console.log(`Analyzing fabric image for ${fabricImg.part}: ${fabricImg.url}`);
            
            const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: "Analyze this fabric image and describe its pattern, texture, colors, and overall design in detail. Focus on visual characteristics that would help recreate this fabric's appearance on a garment. Be specific about colors, patterns, textures, and any unique design elements."
                      },
                      {
                        type: "image_url",
                        image_url: {
                          url: fabricImg.url
                        }
                      }
                    ]
                  }
                ],
                max_tokens: 300
              })
            });
            
            if (visionResponse.ok) {
              const visionData = await visionResponse.json();
              const analysis = visionData.choices[0].message.content;
              console.log(`OpenAI Vision analysis for ${fabricImg.part}:`, analysis);
              return `${fabricImg.part} using fabric with these characteristics: ${analysis}`;
            } else {
              console.warn('Vision analysis failed, using fallback description');
              return `${fabricImg.part} with custom uploaded fabric pattern (${fabricImg.description})`;
            }
          })
        );
        
        // Enhance the prompt with detailed fabric analysis
        enhancedPrompt += `. CRITICAL FABRIC REQUIREMENTS: `;
        fabricAnalyses.forEach((analysis) => {
          enhancedPrompt += `${analysis}. `;
        });
        enhancedPrompt += `Ensure these exact fabric characteristics are visible and accurately represented on the garment in both front and back views.`;
        
        console.log('OpenAI: Enhanced prompt with detailed fabric analysis');
        
      } catch (visionError) {
        console.warn('Vision analysis failed, using basic fabric descriptions:', visionError);
        
        // Fallback to enhanced basic fabric descriptions
        enhancedPrompt += `. IMPORTANT: The garment should use these exact custom uploaded fabric patterns and textures: `;
        prompt.fabricImages.forEach((fabricImg, index) => {
          console.log(`Adding fabric ${index + 1}: ${fabricImg.description}`);
          enhancedPrompt += `Fabric ${index + 1} for ${fabricImg.part}: ${fabricImg.description}. `;
        });
        enhancedPrompt += `Match these custom uploaded fabric patterns, colors, and textures precisely on the corresponding garment parts in both front and back views. The fabrics are from user-uploaded images and should be clearly visible on the garment.`;
      }
    }
    
    console.log('Final OpenAI prompt:', enhancedPrompt);

    const response = await fetch(AI_CONFIG.openai.url, {
      method: 'POST',
      headers: AI_CONFIG.openai.headers,
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt.slice(0, 4000), // DALL-E 3 has prompt length limits
        n: 1,
        size: import.meta.env.VITE_IMAGE_SIZE || "1792x1024",
        quality: import.meta.env.VITE_IMAGE_QUALITY || "hd",
        style: "natural"
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data[0].url;
  };

  // Replicate Integration with Image-to-Image Support for combined view
  const generateWithReplicate = async (prompt) => {
    // Enhanced prompt with fabric reference
    let enhancedPrompt = prompt.positive;
    
    // Prepare input for Replicate with wider aspect ratio for dual view
    const inputData = {
      prompt: enhancedPrompt,
      negative_prompt: prompt.negative,
      width: 1792,
      height: 1024,
      num_inference_steps: 50,
      guidance_scale: 7.5,
      scheduler: "K_EULER"
    };

    // If fabric images are provided, enhance the prompt and use image-to-image generation
    if (prompt.fabricImages && prompt.fabricImages.length > 0) {
      console.log('Replicate: Using image-to-image generation with multiple fabric images:', prompt.fabricImages);
      
      // Enhance the text prompt with detailed descriptions of all fabric images
      enhancedPrompt += `. CRITICAL FABRIC REQUIREMENTS: `;
      prompt.fabricImages.forEach((fabricImg, index) => {
        enhancedPrompt += `${fabricImg.part} must use the specific fabric pattern from image ${index + 1}: ${fabricImg.description}. `;
      });
      enhancedPrompt += `Each garment part should accurately reflect its corresponding uploaded fabric pattern, texture, and colors in both front and back views.`;
      
      // For image-to-image, we'll use the most prominent fabric image based on garment type
      // Get the garment type to determine priority
      const garmentType = prompt.userSelections?.garmentType || 'kurti';
      
      let priorityParts;
      switch (garmentType) {
        case 'saree':
          priorityParts = ['blouse', 'drape'];
          break;
        case 'lehenga':
          priorityParts = ['choli', 'skirt', 'dupatta'];
          break;
        case 'kurti':
          priorityParts = ['top', 'bottom'];
          break;
        case 'blouse':
          priorityParts = ['front', 'back', 'sleeves'];
          break;
        case 'dress':
          priorityParts = ['bodice', 'skirt'];
          break;
        case 'shirt':
          priorityParts = ['body', 'collar', 'cuffs'];
          break;
        default:
          priorityParts = ['top', 'body', 'front'];
      }
      
      let primaryFabricImage = prompt.fabricImages[0]; // fallback to first
      
      for (const part of priorityParts) {
        const found = prompt.fabricImages.find(img => img.part === part);
        if (found) {
          primaryFabricImage = found;
          break;
        }
      }
      
      console.log(`Replicate: Using fabric image for ${primaryFabricImage.part} as primary reference:`, primaryFabricImage);
      
      inputData.image = primaryFabricImage.url;
      inputData.strength = 0.6; // Slightly reduced to allow more flexibility for multiple fabrics
      inputData.prompt = enhancedPrompt; // Update with enhanced prompt
      
      console.log('Replicate: Enhanced prompt with all fabrics:', enhancedPrompt);
      
      // Update the model version to support image-to-image
      const imgToImgVersion = "be04660a5b93ef2aff61e3668dedb4cbeb14941e62a3fd5998364a32d613e35e";
      
      const response = await fetch(AI_CONFIG.replicate.url, {
        method: 'POST',
        headers: AI_CONFIG.replicate.headers,
        body: JSON.stringify({
          version: imgToImgVersion,
          input: inputData
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Replicate API Error: ${error.detail || 'Unknown error'}`);
      }

      const prediction = await response.json();
      
      // Poll for completion
      let result = prediction;
      while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: AI_CONFIG.replicate.headers
        });
        result = await pollResponse.json();
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }

      if (result.status === 'failed') {
        throw new Error(`Generation failed: ${result.error}`);
      }

      return result.output[0];
    } else {
      // Standard text-to-image generation for dual view
      enhancedPrompt += `, precise fabric pattern matching, detailed textile design, authentic fabric texture, professional dual view composition, both front and back perspectives`;
      
      const response = await fetch(AI_CONFIG.replicate.url, {
        method: 'POST',
        headers: AI_CONFIG.replicate.headers,
        body: JSON.stringify({
          version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
          input: {
            ...inputData,
            prompt: enhancedPrompt
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Replicate API Error: ${error.detail || 'Unknown error'}`);
      }

      const prediction = await response.json();
      
      // Poll for completion
      let result = prediction;
      while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: AI_CONFIG.replicate.headers
        });
        result = await pollResponse.json();
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }

      if (result.status === 'failed') {
        throw new Error(`Generation failed: ${result.error}`);
      }

      return result.output[0];
    }
  };

  // Stability AI Integration (Alternative) for combined view
  const generateWithStability = async (prompt) => {
    let enhancedPrompt = prompt.positive;
    
    // Enhance prompt with fabric image descriptions for Stability AI
    if (prompt.fabricImages && prompt.fabricImages.length > 0) {
      enhancedPrompt += `. FABRIC SPECIFICATIONS: Use these exact fabric patterns and textures: `;
      prompt.fabricImages.forEach((fabricImg, index) => {
        enhancedPrompt += `Fabric ${index + 1} for ${fabricImg.part}: ${fabricImg.description}. `;
      });
      enhancedPrompt += `Apply these fabric patterns and textures precisely to the garment parts in both front and back views with accurate color matching and textile detail.`;
    }
    
    const response = await fetch(AI_CONFIG.stability.url, {
      method: 'POST',
      headers: AI_CONFIG.stability.headers,
      body: JSON.stringify({
        text_prompts: [
          {
            text: enhancedPrompt,
            weight: 1
          },
          {
            text: prompt.negative,
            weight: -1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1792,
        steps: 30,
        samples: 1
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stability API Error: ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return `data:image/png;base64,${data.artifacts[0].base64}`;
  };

  // Generate placeholder image for demo purposes
  const generatePlaceholderImage = async (prompt) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const garmentType = prompt.userSelections?.garmentType || 'kurti';
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
    const patterns = ['stripes', 'dots', 'floral', 'geometric', 'plain'];
    
    // Generate a more sophisticated SVG with garment shape
    const width = 600;
    const height = 800;
    const primaryColor = colors[Math.floor(Math.random() * colors.length)];
    const secondaryColor = colors[Math.floor(Math.random() * colors.length)];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background: #f8f9fa;">
        <defs>
          <pattern id="stripePattern" patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="5" height="10" fill="${primaryColor}"/>
            <rect x="5" width="5" height="10" fill="${secondaryColor}"/>
          </pattern>
          <pattern id="dotPattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="3" fill="${secondaryColor}"/>
            <rect width="20" height="20" fill="${primaryColor}"/>
          </pattern>
          <linearGradient id="garmentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Front View -->
        <g transform="translate(80, 50)">
          <text x="60" y="30" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Front View</text>
          <!-- Garment Body -->
          <path d="M50 50 Q50 45 55 45 L85 45 Q90 45 90 50 L90 200 Q90 210 85 210 L55 210 Q50 210 50 200 Z" 
                fill="${pattern === 'stripes' ? 'url(#stripePattern)' : pattern === 'dots' ? 'url(#dotPattern)' : 'url(#garmentGradient)'}" 
                stroke="#333" stroke-width="1"/>
          <!-- Sleeves -->
          <ellipse cx="40" cy="80" rx="15" ry="30" fill="${primaryColor}" stroke="#333" stroke-width="1"/>
          <ellipse cx="100" cy="80" rx="15" ry="30" fill="${primaryColor}" stroke="#333" stroke-width="1"/>
          <!-- Neckline -->
          <ellipse cx="70" cy="55" rx="10" ry="8" fill="#f8f9fa" stroke="#333" stroke-width="1"/>
        </g>
        
        <!-- Back View -->
        <g transform="translate(300, 50)">
          <text x="60" y="30" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Back View</text>
          <!-- Garment Body -->
          <path d="M50 50 Q50 45 55 45 L85 45 Q90 45 90 50 L90 200 Q90 210 85 210 L55 210 Q50 210 50 200 Z" 
                fill="${pattern === 'stripes' ? 'url(#stripePattern)' : pattern === 'dots' ? 'url(#dotPattern)' : 'url(#garmentGradient)'}" 
                stroke="#333" stroke-width="1"/>
          <!-- Sleeves -->
          <ellipse cx="40" cy="80" rx="15" ry="30" fill="${primaryColor}" stroke="#333" stroke-width="1"/>
          <ellipse cx="100" cy="80" rx="15" ry="30" fill="${primaryColor}" stroke="#333" stroke-width="1"/>
          <!-- Back Neckline -->
          <ellipse cx="70" cy="55" rx="8" ry="6" fill="#f8f9fa" stroke="#333" stroke-width="1"/>
        </g>
        
        <!-- Design Info -->
        <text x="${width/2}" y="${height - 60}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#333">
          ${garmentType.toUpperCase()} Design Preview
        </text>
        <text x="${width/2}" y="${height - 40}" font-family="Arial" font-size="12" text-anchor="middle" fill="#666">
          ${prompt.userSelections?.neckline || 'round'} neckline • ${prompt.userSelections?.sleeves || 'half'} sleeves • ${prompt.userSelections?.fit || 'regular'} fit
        </text>
        <text x="${width/2}" y="${height - 20}" font-family="Arial" font-size="10" text-anchor="middle" fill="#999">
          Demo Mode - AI Generation Unavailable
        </text>
      </svg>
    `;
    
    // Convert SVG to data URL
    const dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
    return dataUrl;
  };

  // Main AI image generation function with fallback
  const generateAIImage = async (prompt) => {
    const provider = import.meta.env.VITE_AI_PROVIDER || 'openai';
    
    try {
      setGenerationProgress(20);
      
      // Check if we have valid API keys (not placeholder keys)
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const replicateToken = import.meta.env.VITE_REPLICATE_API_TOKEN;
      const stabilityKey = import.meta.env.VITE_STABILITY_API_KEY;
      
      // Check if keys are valid (not placeholder keys)
      const hasValidOpenAI = openaiKey && !openaiKey.includes('your_api_key') && openaiKey.startsWith('sk-');
      const hasValidReplicate = replicateToken && !replicateToken.includes('your_api_key') && replicateToken.startsWith('r8_');
      const hasValidStability = stabilityKey && !stabilityKey.includes('your_api_key');
      
      console.log('API Keys Status:', { hasValidOpenAI, hasValidReplicate, hasValidStability });
      
      // If no valid API keys, use placeholder
      if (!hasValidOpenAI && !hasValidReplicate && !hasValidStability) {
        console.log('No valid API keys found, using placeholder image...');
        setGenerationProgress(50);
        return await generatePlaceholderImage(prompt);
      }
      
      switch (provider) {
        case 'openai':
          if (!hasValidOpenAI) {
            throw new Error('OpenAI API key not configured properly');
          }
          return await generateWithOpenAI(prompt);
          
        case 'replicate':
          if (!hasValidReplicate) {
            throw new Error('Replicate API token not configured properly');
          }
          return await generateWithReplicate(prompt);
          
        case 'stability':
          if (!hasValidStability) {
            throw new Error('Stability API key not configured properly');
          }
          return await generateWithStability(prompt);
          
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      
      // Try fallback providers
      if (provider !== 'replicate' && import.meta.env.VITE_REPLICATE_API_TOKEN?.startsWith('r8_')) {
        try {
          console.log('Trying Replicate as fallback...');
          return await generateWithReplicate(prompt);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
      
      // If all API methods fail, use placeholder
      console.log('All API methods failed, using placeholder image...');
      setGenerationProgress(75);
      return await generatePlaceholderImage(prompt);
      
    } finally {
      setGenerationProgress(100);
    }
  };

  // Modal handlers
  const openImageModal = (imageSrc, imageAlt) => {
    setModalImage({ src: imageSrc, alt: imageAlt });
    setZoomLevel(1);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImage({ src: null, alt: null });
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 5)); // Max zoom 5x
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25)); // Min zoom 0.25x
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  // Export functionality - Simple download for data URLs
  const handleExportPNG = () => {
    if (!generatedImage) {
      alert('No image to export. Please generate an image first.');
      return;
    }

    // Generate filename with timestamp and garment type
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
    const garmentType = designOptions.garmentType || 'garment';
    const filename = `${garmentType}_design_${timestamp}.png`;

    // Check if it's a data URL (from Stability AI) or external URL
    if (generatedImage.startsWith('data:')) {
      // Direct download for data URLs
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`Downloaded garment design as: ${filename}`);
    } else {
      // For external URLs, use fetch to download
      fetch(generatedImage)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          console.log(`Downloaded garment design as: ${filename}`);
        })
        .catch(error => {
          console.error('Direct download failed:', error);
          // Try canvas-based approach as fallback
          handleCanvasFallback(generatedImage, filename);
        });
    }
  };

  // Canvas fallback for cross-origin or difficult images
  const handleCanvasFallback = (imageSrc, filename) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            console.log(`Downloaded via canvas as: ${filename}`);
          } else {
            throw new Error('Failed to create blob from canvas');
          }
        }, 'image/png', 1.0);
      };
      
      img.onerror = () => {
        throw new Error('Failed to load image in canvas');
      };
      
      // Set crossOrigin before src for external images
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      
    } catch (canvasError) {
      console.error('Canvas fallback also failed:', canvasError);
      alert('Export failed. The image may be from an external source that prevents direct download. Please try right-clicking the image and selecting "Save image as..."');
    }
  };

  // Advanced export with multiple fallback methods
  const handleAdvancedExport = async () => {
    if (!generatedImage) {
      alert('No image to export. Please generate an image first.');
      return;
    }

    // Generate filename with timestamp and garment type
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
    const garmentType = designOptions.garmentType || 'garment';
    const filename = `${garmentType}_design_${timestamp}.png`;

    console.log('Starting image download:', { generatedImage, filename });

    // Method 1: Direct download for data URLs
    if (generatedImage.startsWith('data:')) {
      console.log('Using direct data URL download');
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Download initiated for data URL');
      showSuccessMessage(filename);
      return;
    }

    // Method 2: Try fetch with no-cors mode for external URLs
    try {
      console.log('Attempting to fetch external image');
      const response = await fetch(generatedImage, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) throw new Error('Fetch failed');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      
      console.log('Downloaded via fetch');
      showSuccessMessage(filename);
      return;
      
    } catch (fetchError) {
      console.warn('Fetch method failed:', fetchError);
    }

    // Method 3: Canvas with CORS-enabled image
    try {
      console.log('Attempting canvas method');
      await downloadViaCanvas(generatedImage, filename);
      showSuccessMessage(filename);
      return;
    } catch (canvasError) {
      console.warn('Canvas method failed:', canvasError);
    }

    // Method 4: Open image in new tab as last resort
    console.log('All download methods failed, opening in new tab');
    const newTab = window.open(generatedImage, '_blank');
    if (newTab) {
      alert(`Image opened in new tab. Please right-click and select "Save image as..." to download as ${filename}`);
    } else {
      alert('Unable to download image. Please right-click on the image and select "Save image as..." to download.');
    }
  };

  // Helper function for canvas download
  const downloadViaCanvas = (imageSrc, filename) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
            console.log('Downloaded via canvas');
            resolve();
          }, 'image/png', 1.0);
        } catch (err) {
          reject(err);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      // Try with proxy if direct loading fails
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageSrc)}`;
      img.src = imageSrc;
      
      // If regular load fails, try with proxy
      setTimeout(() => {
        if (!img.complete || img.naturalHeight === 0) {
          console.log('Trying with CORS proxy');
          img.src = proxyUrl;
        }
      }, 3000);
    });
  };

  // Helper function to show success message
  const showSuccessMessage = (filename) => {
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;
    successMsg.textContent = `✓ Downloaded: ${filename}`;
    document.body.appendChild(successMsg);
    
    setTimeout(() => successMsg.remove(), 3000);
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    
    try {
      const combinedPrompt = generateEnhancedPrompt();
      
      console.log('Generating combined dual-view with prompt:', {
        prompt: combinedPrompt.positive,
        fabricImages: combinedPrompt.fabricImages,
        selectedFabrics: selectedFabrics,
        actualFabrics: getActualUserFabrics(selectedFabrics)
      });
      
      setGenerationProgress(10);
      
      // Generate single image with both front and back views
      const combinedImage = await generateAIImage(combinedPrompt);
      
      setGeneratedImage(combinedImage);
      setGenerationProgress(100);
      
      // Save version to backend
      try {
        const projectId = getProjectId();
        await saveVersion(projectId, combinedImage, designOptions, selectedFabrics);
        console.log('Version saved successfully');
      } catch (saveError) {
        console.error('Failed to save version:', saveError);
        // Don't block the UI if saving fails, just log the error
      }
      
    } catch (err) {
      setError(err.message || 'Failed to generate image. Please check your API configuration and try again.');
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Expose generate function to parent component
  useEffect(() => {
    if (onGenerateRef) {
      onGenerateRef(handleGenerateImage);
    }
  }, [onGenerateRef]);

  // Remove auto-generation to prevent multiple API calls
  // Users should explicitly click "Generate Design" button instead
  // useEffect(() => {
  //   // Auto-generate when design options or fabrics change
  //   if (Object.keys(designOptions).length > 0) {
  //     handleGenerateImage();
  //   }
  // }, [designOptions, selectedFabrics]);

  // Listen for export events from parent component
  useEffect(() => {
    const handleExportEvent = (event) => {
      if (event.detail && event.detail.format) {
        console.log(`Export triggered from parent: ${event.detail.format}`);
        handleAdvancedExport();
      }
    };

    document.addEventListener('exportImage', handleExportEvent);
    
    return () => {
      document.removeEventListener('exportImage', handleExportEvent);
    };
  }, [generatedImage]);


  return (
    <div className="garment-mockup-2d">
      <div className="mockup-main-layout">
        {/* Main Content Area */}
        <div className="mockup-content">
          {/* Action Bar - Generate button removed, now only in modal footer */}
          <div className="mockup-actions">
            
            {generatedImage && !isGenerating && (
              <button 
                onClick={handleAdvancedExport} 
                className="btn-professional secondary"
                title="Download generated image to your computer"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Download Image
              </button>
            )}
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="error-message">
              <div className="error-content">
                <span>⚠️ {error}</span>
                <div className="error-actions">
                  <button onClick={handleGenerateImage} className="retry-btn">
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Image Display Area */}
          <div className="mockup-display">
            {isGenerating ? (
              <div className="generating-placeholder">
                <div className="loading-spinner"></div>
                <p>Generating design...</p>
                <small>Creating professional visualization</small>
                {generationProgress > 0 && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ) : generatedImage ? (
              <img 
                src={generatedImage} 
                alt="Generated garment design" 
                className="generated-image clickable-image"
                onClick={() => openImageModal(generatedImage, 'Generated garment design')}
                style={{ cursor: 'pointer' }}
                title="Click to view full size"
                onError={(e) => {
                  console.error('Image load error:', e);
                  setError('Failed to load generated image');
                }}
              />
            ) : (
              <div className="placeholder">
                <div className="placeholder-icon">
                  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m15 9-3-3L6 12"/>
                  </svg>
                </div>
                <p>Generate your design to see the preview</p>
                <small>Click "Generate Design" to create your garment visualization</small>
              </div>
            )}
          </div>
        </div>
      </div>
      

      {/* Image Modal with Zoom */}
      {showImageModal && modalImage.src && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-overlay" />
          <div className="modal-content-image" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-image">
              <h4>{modalImage.alt}</h4>
              <div className="modal-controls">
                <button 
                  className="btn-professional ghost zoom-control"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.25}
                  title="Zoom Out"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </button>
                <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  className="btn-professional ghost zoom-control"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 5}
                  title="Zoom In"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                    <line x1="11" y1="8" x2="11" y2="14"/>
                  </svg>
                </button>
                <button 
                  className="btn-professional ghost zoom-control"
                  onClick={handleZoomReset}
                  title="Reset Zoom"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6M23 20v-6h-6"/>
                    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
                  </svg>
                </button>
                <button 
                  className="btn-professional ghost close-control"
                  onClick={closeImageModal}
                  title="Close"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="modal-image-container">
              <img 
                src={modalImage.src}
                alt={modalImage.alt}
                className="modal-image"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.2s ease-in-out',
                  maxWidth: 'none',
                  maxHeight: 'none'
                }}
              />
            </div>
            <div className="modal-footer-image">
              <p className="image-info">
                Click and drag to pan • Use zoom controls to resize • Click outside to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GarmentMockup2D;