import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { LoadingFallback } from './3d/LoadingFallback';

// Simple 3D Scene Component
const Simple3DScene: React.FC = () => {
  return (
    <group>
      {/* Simple rotating cube */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshPhongMaterial color="#FFD700" />
      </mesh>
      
      {/* Simple lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
    </group>
  );
};

const Canvas3DHeroSection: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          <OrbitControls enablePan={false} enableZoom={true} autoRotate />
          <Environment preset="sunset" />
          <Simple3DScene />
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