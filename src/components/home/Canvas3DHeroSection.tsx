import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text, PerspectiveCamera } from '@react-three/drei';
import { TrainCarScene } from './3d/TrainCarScene';
import { FloatingFoodItems } from './3d/FloatingFoodItems';
import { BrandElements } from './3d/BrandElements';
import { LoadingFallback } from './3d/LoadingFallback';
import * as THREE from 'three';

const Canvas3DHeroSection: React.FC = () => {
  const orbitRef = useRef<any>();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 2, 8], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          {/* Camera Controls */}
          <PerspectiveCamera makeDefault position={[0, 2, 8]} />
          <OrbitControls
            ref={orbitRef}
            enablePan={false}
            enableZoom={true}
            minDistance={5}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.3}
            enableDamping
            dampingFactor={0.1}
          />

          {/* Lighting Setup */}
          <ambientLight intensity={0.4} color="#ffeaa7" />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            color="#fff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.3} color="#fd79a8" />
          
          {/* Environment */}
          <Environment preset="sunset" />
          
          {/* 3D Scene Components */}
          <TrainCarScene />
          <FloatingFoodItems />
          <BrandElements />
        </Suspense>
      </Canvas>

      {/* 2D Overlay Content */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="container mx-auto h-full flex items-center justify-start">
          <div className="max-w-lg ml-8 pointer-events-auto">
            {/* Brand Title */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-6">
              <span className="block text-primary font-['Dancing_Script']">Soul Train's</span>
              <span className="block text-foreground">Eatery</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-md">
              All aboard Charleston's premier catering experience. Elegant cuisine meets Southern hospitality.
            </p>
            
            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform">
                Request Quote
              </button>
              <button className="px-8 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">
                View Gallery
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Fallback */}
      <Suspense fallback={<LoadingFallback />}>
        <div />
      </Suspense>
    </div>
  );
};

export default Canvas3DHeroSection;