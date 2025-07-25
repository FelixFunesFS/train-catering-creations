import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box } from '@react-three/drei';
import * as THREE from 'three';

export const BrandElements: React.FC = () => {
  const logoRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Gentle floating animation for logo
    if (logoRef.current) {
      logoRef.current.position.y = 5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      logoRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    
    // Subtle movement for subtitle text
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group>
      {/* Main Logo Text */}
      <Text
        ref={logoRef}
        position={[0, 5, -3]}
        fontSize={1.2}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        castShadow
      >
        Soul Train's Eatery
      </Text>

      {/* Subtitle */}
      <Text
        ref={textRef}
        position={[0, 4, -3]}
        fontSize={0.3}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        maxWidth={10}
      >
        Charleston's Premier Catering Experience
      </Text>

      {/* Decorative Rails */}
      <group position={[0, -2, -5]}>
        {/* Left rail */}
        <Box args={[20, 0.1, 0.2]} position={[-1, 0, 0]}>
          <meshPhongMaterial color="#8B4513" />
        </Box>
        {/* Right rail */}
        <Box args={[20, 0.1, 0.2]} position={[1, 0, 0]}>
          <meshPhongMaterial color="#8B4513" />
        </Box>
        
        {/* Railroad ties */}
        {Array.from({ length: 15 }, (_, i) => (
          <Box 
            key={i}
            args={[2.5, 0.15, 0.3]} 
            position={[0, -0.1, -7 + i * 1]}
          >
            <meshPhongMaterial color="#654321" />
          </Box>
        ))}
      </group>

      {/* Floating sparkles/particles */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            Math.random() * 8 + 2,
            (Math.random() - 0.5) * 10
          ]}
        >
          <sphereGeometry args={[0.02]} />
          <meshBasicMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};