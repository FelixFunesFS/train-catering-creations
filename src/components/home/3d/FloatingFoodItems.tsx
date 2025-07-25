import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';

interface FoodItemProps {
  position: [number, number, number];
  type: 'mac-cheese' | 'dessert' | 'grazing-board' | 'buffet';
  index: number;
}

const FoodItem: React.FC<FoodItemProps> = ({ position, type, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.3;
      // Gentle rotation
      meshRef.current.rotation.y += 0.01;
      
      // Scale on hover
      const targetScale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const getFoodModel = () => {
    switch (type) {
      case 'mac-cheese':
        return (
          <group>
            {/* Bowl */}
            <Cylinder args={[0.4, 0.3, 0.3]} position={[0, 0, 0]}>
              <meshPhongMaterial color="#FFFFFF" />
            </Cylinder>
            {/* Mac and cheese */}
            <Sphere args={[0.35]} position={[0, 0.2, 0]}>
              <meshPhongMaterial color="#FFD700" />
            </Sphere>
            {/* Cheese sauce highlights */}
            {Array.from({ length: 6 }, (_, i) => (
              <Sphere 
                key={i} 
                args={[0.05]} 
                position={[
                  Math.cos(i * Math.PI / 3) * 0.2,
                  0.25,
                  Math.sin(i * Math.PI / 3) * 0.2
                ]}
              >
                <meshPhongMaterial color="#FFA500" emissive="#FF8C00" emissiveIntensity={0.2} />
              </Sphere>
            ))}
          </group>
        );
        
      case 'dessert':
        return (
          <group>
            {/* Tiered stand base */}
            <Cylinder args={[0.3, 0.3, 0.1]} position={[0, 0, 0]}>
              <meshPhongMaterial color="#SILVER" />
            </Cylinder>
            {/* Tier levels */}
            {[0, 0.3, 0.6].map((y, tierIndex) => (
              <group key={tierIndex} position={[0, y, 0]}>
                <Cylinder args={[0.25 - tierIndex * 0.05, 0.25 - tierIndex * 0.05, 0.05]}>
                  <meshPhongMaterial color="#SILVER" />
                </Cylinder>
                {/* Desserts on each tier */}
                {Array.from({ length: 4 - tierIndex }, (_, i) => (
                  <Sphere 
                    key={i} 
                    args={[0.06]} 
                    position={[
                      Math.cos(i * Math.PI / 2) * (0.15 - tierIndex * 0.03),
                      0.08,
                      Math.sin(i * Math.PI / 2) * (0.15 - tierIndex * 0.03)
                    ]}
                  >
                    <meshPhongMaterial color={['#8B4513', '#FF69B4', '#DDA0DD'][i % 3]} />
                  </Sphere>
                ))}
              </group>
            ))}
          </group>
        );
        
      case 'grazing-board':
        return (
          <group>
            {/* Board base */}
            <Box args={[0.8, 0.1, 0.5]} position={[0, 0, 0]}>
              <meshPhongMaterial color="#8B4513" />
            </Box>
            {/* Food items on board */}
            {Array.from({ length: 8 }, (_, i) => (
              <Sphere 
                key={i} 
                args={[0.04]} 
                position={[
                  (Math.random() - 0.5) * 0.6,
                  0.08,
                  (Math.random() - 0.5) * 0.3
                ]}
              >
                <meshPhongMaterial color={['#FF6347', '#32CD32', '#FFD700', '#8A2BE2'][i % 4]} />
              </Sphere>
            ))}
          </group>
        );
        
      case 'buffet':
        return (
          <group>
            {/* Chafing dish base */}
            <Box args={[0.6, 0.2, 0.4]} position={[0, 0, 0]}>
              <meshPhongMaterial color="#SILVER" />
            </Box>
            {/* Food container */}
            <Box args={[0.5, 0.15, 0.3]} position={[0, 0.15, 0]}>
              <meshPhongMaterial color="#FFFFFF" />
            </Box>
            {/* Steam effect */}
            {Array.from({ length: 3 }, (_, i) => (
              <Sphere 
                key={i} 
                args={[0.03]} 
                position={[0, 0.4 + i * 0.1, 0]}
              >
                <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
              </Sphere>
            ))}
          </group>
        );
        
      default:
        return <Sphere args={[0.2]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
    >
      {getFoodModel()}
      
      {/* Glow effect when hovered */}
      {hovered && (
        <pointLight
          position={[0, 0, 0]}
          intensity={0.5}
          color="#FFD700"
          distance={2}
        />
      )}
    </mesh>
  );
};

export const FloatingFoodItems: React.FC = () => {
  const foodItems: Array<{ position: [number, number, number]; type: FoodItemProps['type'] }> = [
    { position: [-4, 2, -2], type: 'mac-cheese' },
    { position: [5, 3, -1], type: 'dessert' },
    { position: [-3, 4, 2], type: 'grazing-board' },
    { position: [6, 2.5, 1], type: 'buffet' },
    { position: [-6, 3.5, 0], type: 'mac-cheese' },
    { position: [4, 4.5, -3], type: 'dessert' },
  ];

  return (
    <>
      {foodItems.map((item, index) => (
        <FoodItem
          key={index}
          position={item.position}
          type={item.type}
          index={index}
        />
      ))}
    </>
  );
};