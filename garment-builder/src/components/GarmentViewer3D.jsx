import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import './GarmentViewer3D.css';

const RealisticFemaleModel = ({ garmentType, texture, color = '#ffffff', designOptions }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  // Enhanced female mannequin proportions
  const modelGeometry = useMemo(() => {
    return {
      head: { position: [0, 1.7, 0], args: [0.12, 0.15, 0.12] },
      neck: { position: [0, 1.55, 0], args: [0.05, 0.08, 0.05] },
      torso: { position: [0, 1.2, 0], args: [0.18, 0.35, 0.12] },
      waist: { position: [0, 0.9, 0], args: [0.15, 0.15, 0.1] },
      hips: { position: [0, 0.65, 0], args: [0.2, 0.15, 0.15] },
      leftArm: { position: [-0.25, 1.35, 0], args: [0.06, 0.25, 0.06] },
      rightArm: { position: [0.25, 1.35, 0], args: [0.06, 0.25, 0.06] },
      leftForearm: { position: [-0.25, 1.0, 0], args: [0.05, 0.2, 0.05] },
      rightForearm: { position: [0.25, 1.0, 0], args: [0.05, 0.2, 0.05] },
      leftThigh: { position: [-0.1, 0.35, 0], args: [0.08, 0.25, 0.08] },
      rightThigh: { position: [0.1, 0.35, 0], args: [0.08, 0.25, 0.08] },
      leftCalf: { position: [-0.1, 0.05, 0], args: [0.06, 0.2, 0.06] },
      rightCalf: { position: [0.1, 0.05, 0], args: [0.06, 0.2, 0.06] }
    };
  }, []);

  // Create material based on texture or color
  const material = useMemo(() => {
    if (texture) {
      const textureMap = new THREE.TextureLoader().load(texture);
      textureMap.wrapS = textureMap.wrapT = THREE.RepeatWrapping;
      return new THREE.MeshStandardMaterial({ 
        map: textureMap,
        roughness: 0.7,
        metalness: 0.1
      });
    }
    return new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.8,
      metalness: 0.1
    });
  }, [texture, color]);

  const mannequinMaterial = new THREE.MeshStandardMaterial({
    color: '#f5f5dc',
    roughness: 0.9,
    metalness: 0.0
  });

  const renderGarment = () => {
    switch (garmentType) {
      case 'saree':
        return (
          <group>
            {/* Blouse */}
            <mesh position={[0, 1.25, 0]} material={material}>
              <boxGeometry args={[0.36, 0.3, 0.24]} />
            </mesh>
            {/* Saree Drape */}
            <mesh position={[0, 0.8, 0]} material={material}>
              <cylinderGeometry args={[0.25, 0.35, 0.8, 12]} />
            </mesh>
            {/* Saree End Piece */}
            <mesh position={[-0.2, 1.4, 0]} rotation={[0, 0, 0.3]} material={material}>
              <boxGeometry args={[0.15, 0.5, 0.02]} />
            </mesh>
          </group>
        );
      
      case 'lehenga':
        return (
          <group>
            {/* Choli */}
            <mesh position={[0, 1.3, 0]} material={material}>
              <boxGeometry args={[0.32, 0.25, 0.2]} />
            </mesh>
            {/* Lehenga Skirt */}
            <mesh position={[0, 0.7, 0]} material={material}>
              <cylinderGeometry args={[0.15, 0.4, 0.6, 16]} />
            </mesh>
            {/* Dupatta */}
            <mesh position={[0.3, 1.5, -0.1]} rotation={[0.2, 0.5, 0]} material={material}>
              <boxGeometry args={[0.8, 0.05, 0.4]} />
            </mesh>
          </group>
        );
      
      case 'kurti':
        return (
          <group>
            {/* Kurti Top */}
            <mesh position={[0, 1.1, 0]} material={material}>
              <boxGeometry args={[0.36, 0.55, 0.24]} />
            </mesh>
            {/* Bottom (if applicable) */}
            <mesh position={[0, 0.45, 0]} material={material}>
              <cylinderGeometry args={[0.18, 0.22, 0.4, 8]} />
            </mesh>
          </group>
        );
      
      case 'dress':
        return (
          <group>
            {/* Bodice */}
            <mesh position={[0, 1.25, 0]} material={material}>
              <boxGeometry args={[0.32, 0.35, 0.2]} />
            </mesh>
            {/* Skirt */}
            <mesh position={[0, 0.8, 0]} material={material}>
              <cylinderGeometry args={[0.2, 0.35, 0.5, 12]} />
            </mesh>
          </group>
        );
      
      case 'blouse':
        return (
          <group>
            {/* Front Panel */}
            <mesh position={[-0.05, 1.25, 0.1]} material={material}>
              <boxGeometry args={[0.15, 0.3, 0.05]} />
            </mesh>
            {/* Back Panel */}
            <mesh position={[0.05, 1.25, -0.1]} material={material}>
              <boxGeometry args={[0.15, 0.3, 0.05]} />
            </mesh>
            {/* Sleeves */}
            <mesh position={[-0.25, 1.25, 0]} material={material}>
              <cylinderGeometry args={[0.04, 0.06, 0.2, 8]} />
            </mesh>
            <mesh position={[0.25, 1.25, 0]} material={material}>
              <cylinderGeometry args={[0.04, 0.06, 0.2, 8]} />
            </mesh>
          </group>
        );
      
      case 'shirt':
        return (
          <group>
            {/* Shirt Body */}
            <mesh position={[0, 1.1, 0]} material={material}>
              <boxGeometry args={[0.38, 0.5, 0.25]} />
            </mesh>
            {/* Collar */}
            <mesh position={[0, 1.38, 0]} material={material}>
              <boxGeometry args={[0.25, 0.08, 0.15]} />
            </mesh>
            {/* Sleeves */}
            <mesh position={[-0.32, 1.2, 0]} material={material}>
              <cylinderGeometry args={[0.05, 0.07, 0.3, 8]} />
            </mesh>
            <mesh position={[0.32, 1.2, 0]} material={material}>
              <cylinderGeometry args={[0.05, 0.07, 0.3, 8]} />
            </mesh>
          </group>
        );
      
      default:
        return (
          <mesh position={[0, 1.1, 0]} material={material}>
            <boxGeometry args={[0.36, 0.55, 0.24]} />
          </mesh>
        );
    }
  };

  return (
    <group 
      ref={groupRef} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.05 : 1}
    >
      {/* Mannequin Body Parts */}
      {Object.entries(modelGeometry).map(([part, config]) => (
        <mesh key={part} position={config.position} material={mannequinMaterial}>
          <boxGeometry args={config.args} />
        </mesh>
      ))}
      
      {/* Render the selected garment */}
      {renderGarment()}
    </group>
  );
};

const GarmentViewer3D = ({ 
  designOptions = {}, 
  selectedFabrics = {}, 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Get the primary fabric for the main garment piece
  const primaryFabric = useMemo(() => {
    const fabrics = Object.values(selectedFabrics);
    return fabrics.length > 0 ? fabrics[0] : null;
  }, [selectedFabrics]);

  if (isLoading) {
    return (
      <div className={`garment-viewer-3d loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading 3D Preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`garment-viewer-3d ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: false, 
          preserveDrawingBuffer: true,
          clearColor: '#f8f9fa'
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor('#f8f9fa');
          scene.background = new THREE.Color('#f8f9fa');
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <pointLight position={[0, 0, 2]} intensity={0.3} />
        
        <RealisticFemaleModel
          garmentType={designOptions.garmentType || 'kurti'}
          texture={primaryFabric?.url}
          color={primaryFabric?.color || '#e8e8e8'}
          designOptions={designOptions}
        />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
        
        <Environment preset="studio" />
        <ContactShadows 
          position={[0, -0.5, 0]} 
          opacity={0.4} 
          scale={2} 
          blur={2} 
          far={2} 
        />
      </Canvas>
      
      <div className="viewer-controls">
        <div className="control-hint">
          <span>🖱️ Drag to rotate • 🔄 Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
};

export default GarmentViewer3D;