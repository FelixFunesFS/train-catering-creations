import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export const TrainCarScene: React.FC = () => {
  const trainRef = useRef<THREE.Group>(null);
  const steamRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Gentle swaying motion for the train
    if (trainRef.current) {
      trainRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.01;
    }
    
    // Animate steam particles
    if (steamRef.current) {
      steamRef.current.children.forEach((child, index) => {
        child.position.y += delta * 0.5;
        child.scale.setScalar(child.scale.x + delta * 0.3);
        if (child.position.y > 4) {
          child.position.y = 1;
          child.scale.setScalar(0.1);
        }
      });
    }
  });

  return (
    <group ref={trainRef} position={[2, -1, 0]}>
      {/* Main Train Car Body */}
      <RoundedBox 
        args={[6, 2.5, 2]} 
        position={[0, 0, 0]}
        radius={0.1}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshPhongMaterial color="#8B4513" />
      </RoundedBox>
      
      {/* Train Car Roof */}
      <RoundedBox 
        args={[6.2, 0.3, 2.2]} 
        position={[0, 1.4, 0]}
        radius={0.05}
        castShadow
      >
        <meshPhongMaterial color="#654321" />
      </RoundedBox>
      
      {/* Windows */}
      {[-2, -0.5, 1, 2.5].map((x, index) => (
        <Box 
          key={index}
          args={[0.8, 1.2, 0.1]} 
          position={[x, 0.3, 1.05]}
          castShadow
        >
          <meshPhongMaterial color="#87CEEB" transparent opacity={0.7} />
        </Box>
      ))}
      
      {/* Wheels */}
      {[-2, 2].map((x, index) => (
        <group key={index} position={[x, -1.5, 0]}>
          <Cylinder args={[0.6, 0.6, 0.3]} rotation={[0, 0, Math.PI / 2]}>
            <meshPhongMaterial color="#2C2C2C" />
          </Cylinder>
          {/* Wheel spokes */}
          <Cylinder args={[0.3, 0.3, 0.35]} rotation={[0, 0, Math.PI / 2]}>
            <meshPhongMaterial color="#FFD700" />
          </Cylinder>
        </group>
      ))}
      
      {/* Smokestack */}
      <Cylinder 
        args={[0.3, 0.4, 1.5]} 
        position={[-2.5, 2, 0]}
        castShadow
      >
        <meshPhongMaterial color="#2C2C2C" />
      </Cylinder>
      
      {/* Steam particles */}
      <group ref={steamRef} position={[-2.5, 3, 0]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[Math.random() * 0.5 - 0.25, i * 0.3, Math.random() * 0.5 - 0.25]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>
      
      {/* Train Car Details */}
      {/* Door */}
      <Box args={[0.1, 1.8, 1.2]} position={[3, 0, 0]}>
        <meshPhongMaterial color="#654321" />
      </Box>
      
      {/* Door Handle */}
      <Cylinder args={[0.05, 0.05, 0.2]} position={[3.05, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhongMaterial color="#FFD700" />
      </Cylinder>
      
      {/* Lanterns */}
      {[-3, 3].map((x, index) => (
        <group key={index} position={[x, 1, 1.2]}>
          <Cylinder args={[0.15, 0.15, 0.3]}>
            <meshPhongMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.2} />
          </Cylinder>
        </group>
      ))}
    </group>
  );
};