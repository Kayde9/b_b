import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './AnimatedMap3D.css';

// 3D Sleek Sporty Car Component
const Car3D = ({ position, rotation, scale = 1 }) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main sporty car body - lower and wider */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.1, 0.25, 2.2]} />
        <meshStandardMaterial 
          color="#FF4500" 
          metalness={0.9} 
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Sporty front nose */}
      <mesh position={[0, 0.08, 1.0]}>
        <coneGeometry args={[0.55, 0.4, 8]} />
        <meshStandardMaterial 
          color="#FF4500" 
          metalness={0.9} 
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
      
      {/* Sleek cabin - more aerodynamic */}
      <mesh position={[0, 0.38, -0.3]}>
        <capsuleGeometry args={[0.4, 0.8, 4, 8]} />
        <meshStandardMaterial 
          color="#FF4500" 
          metalness={0.8} 
          roughness={0.2}
          clearcoat={0.8}
        />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[0, 0.42, 0.1]} rotation={[-0.2, 0, 0]}>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial 
          color="#001122" 
          metalness={1} 
          roughness={0} 
          transparent 
          opacity={0.2}
        />
      </mesh>
      
      {/* Side windows */}
      <mesh position={[0.45, 0.38, -0.3]} rotation={[0, 0, -0.1]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshStandardMaterial 
          color="#001122" 
          transparent 
          opacity={0.15}
        />
      </mesh>
      <mesh position={[-0.45, 0.38, -0.3]} rotation={[0, 0, 0.1]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshStandardMaterial 
          color="#001122" 
          transparent 
          opacity={0.15}
        />
      </mesh>
      
      {/* Sport wheels with rims */}
      <group position={[-0.45, -0.05, 0.6]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.07]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} />
        </mesh>
      </group>
      
      <group position={[0.45, -0.05, 0.6]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.07]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} />
        </mesh>
      </group>
      
      <group position={[-0.45, -0.05, -0.6]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.07]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} />
        </mesh>
      </group>
      
      <group position={[0.45, -0.05, -0.6]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.07]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} />
        </mesh>
      </group>
      
      {/* LED headlights */}
      <mesh position={[-0.25, 0.15, 1.15]}>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial 
          color="#E6F3FF" 
          emissive="#E6F3FF" 
          emissiveIntensity={3}
        />
      </mesh>
      <mesh position={[0.25, 0.15, 1.15]}>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial 
          color="#E6F3FF" 
          emissive="#E6F3FF" 
          emissiveIntensity={3}
        />
      </mesh>
      
      {/* Tail lights */}
      <mesh position={[-0.3, 0.15, -1.1]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial 
          color="#FF0000" 
          emissive="#FF0000" 
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[0.3, 0.15, -1.1]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial 
          color="#FF0000" 
          emissive="#FF0000" 
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* Spoiler */}
      <mesh position={[0, 0.45, -1.0]}>
        <boxGeometry args={[0.8, 0.05, 0.15]} />
        <meshStandardMaterial 
          color="#FF4500" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

// Realistic Spinning Basketball Component
const Basketball = ({ position }) => {
  const meshRef = useRef();
  const ballGroupRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Realistic basketball rotation
      meshRef.current.rotation.y += delta * 3;
      meshRef.current.rotation.x += delta * 1.5;
      meshRef.current.rotation.z += delta * 0.8;
    }
    
    if (ballGroupRef.current) {
      // Subtle floating animation
      ballGroupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      // Slight bobbing rotation
      ballGroupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  return (
    <group ref={ballGroupRef} position={position}>
      {/* Main basketball sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.28, 64, 64]} />
        <meshStandardMaterial 
          color="#E67E22" 
          metalness={0.1} 
          roughness={0.6}
          clearcoat={0.3}
          clearcoatRoughness={0.8}
          emissive="#FF6B00"
          emissiveIntensity={0.15}
        />
      </mesh>
      
      {/* Basketball seam lines - curved */}
      <group>
        {/* Vertical seams */}
        <mesh>
          <torusGeometry args={[0.28, 0.008, 8, 64]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.008, 8, 64]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.28, 0.008, 8, 64]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
      </group>
      
      {/* Basketball texture bumps - small spheres for realistic surface */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 0.25;
        const z = Math.sin(angle) * 0.25;
        return (
          <mesh key={i} position={[x, 0, z]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial 
              color="#D35400" 
              roughness={1}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}
      
      {/* Glow effect with pulsing */}
      <pointLight 
        position={[0, 0, 0]} 
        color="#FF6B00" 
        intensity={0.8 + Math.sin(Date.now() * 0.003) * 0.3} 
        distance={4} 
      />
      
      {/* Rim light for extra shine */}
      <mesh>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial 
          color="#FF6B00" 
          transparent 
          opacity={0.1}
          emissive="#FF6B00"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
};

// Enhanced Basketball Court Marker at NMIMS Destination
const BasketballCourtMarker = ({ position, progress }) => {
  const glowRef = useRef();
  const hoopRef = useRef();
  const courtRef = useRef();
  const bouncingBallRef = useRef();
  
  useFrame((state) => {
    if (glowRef.current) {
      // Pulsing glow effect
      glowRef.current.material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.4;
      glowRef.current.material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
    
    // Hoop animation
    if (hoopRef.current) {
      hoopRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    
    // Basketball bounce animation when arrived (progress > 95%)
    if (bouncingBallRef.current && progress > 0.95) {
      const bounceTime = (state.clock.elapsedTime - (progress * 18)) * 4;
      const bounceHeight = Math.max(0, Math.abs(Math.sin(bounceTime)) * 2);
      bouncingBallRef.current.position.y = 0.3 + bounceHeight;
      bouncingBallRef.current.rotation.x += 0.1;
      bouncingBallRef.current.rotation.z += 0.05;
    }
  });
  
  return (
    <group position={position}>
      {/* Enhanced Court base with NMIMS branding */}
      <group ref={courtRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[3, 4]} />
          <meshStandardMaterial 
            color="#1B5E20" 
            metalness={0.1} 
            roughness={0.9}
          />
        </mesh>
        
        {/* Court center circle */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.8, 0.85, 64]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Three-point line */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -0.8]}>
          <ringGeometry args={[1.2, 1.25, 32, 1, 0, Math.PI]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Free throw line */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -1.2]}>
          <planeGeometry args={[0.8, 0.05]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      {/* Enhanced Basketball hoop with net */}
      <group ref={hoopRef} position={[0, 1.8, -1.4]}>
        {/* Hoop rim */}
        <mesh>
          <torusGeometry args={[0.35, 0.06, 16, 32]} />
          <meshStandardMaterial 
            color="#FF6B00" 
            emissive="#FF6B00" 
            emissiveIntensity={0.7}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Net segments */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 0.35;
          const z = Math.sin(angle) * 0.35;
          return (
            <mesh key={i} position={[x, -0.3, z]}>
              <cylinderGeometry args={[0.008, 0.008, 0.6]} />
              <meshStandardMaterial color="#FFFFFF" transparent opacity={0.8} />
            </mesh>
          );
        })}
      </group>
      
      {/* Hoop pole with NMIMS branding */}
      <mesh position={[0, 0.9, -1.6]}>
        <cylinderGeometry args={[0.08, 0.08, 1.8]} />
        <meshStandardMaterial color="#2E7D32" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* NMIMS logo area on pole */}
      <mesh position={[0, 1.2, -1.52]}>
        <cylinderGeometry args={[0.12, 0.12, 0.3]} />
        <meshStandardMaterial 
          color="#FF6B00" 
          emissive="#FF6B00" 
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Bouncing basketball (appears when car arrives) */}
      {progress > 0.95 && (
        <mesh ref={bouncingBallRef} position={[0.5, 0.3, 0]}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial 
            color="#E67E22" 
            metalness={0.1} 
            roughness={0.6}
            emissive="#FF6B00"
            emissiveIntensity={0.2}
          />
        </mesh>
      )}
      
      {/* Enhanced glowing marker */}
      <mesh ref={glowRef} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[2, 2, 0.15, 32]} />
        <meshStandardMaterial 
          color="#FF6B00" 
          transparent 
          opacity={0.6}
          emissive="#FF6B00"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Welcome sign */}
      <mesh position={[0, 2.5, -2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[2.5, 0.8]} />
        <meshStandardMaterial 
          color="#1B5E20" 
          emissive="#FF6B00" 
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Multiple point lights for stadium effect */}
      <pointLight position={[-2, 3, 0]} color="#FFFFFF" intensity={1.5} distance={8} />
      <pointLight position={[2, 3, 0]} color="#FFFFFF" intensity={1.5} distance={8} />
      <pointLight position={[0, 4, -2]} color="#FF6B00" intensity={2} distance={10} />
    </group>
  );
};

// Enhanced Basketball-themed Motion Trail Effect
const MotionTrail = ({ points }) => {
  const trailRef = useRef();
  const sparkleRef = useRef();
  
  useFrame((state) => {
    if (trailRef.current) {
      // Pulsing trail effect
      trailRef.current.material.opacity = 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      trailRef.current.material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.4;
    }
    
    // Sparkle effects along the trail
    if (sparkleRef.current && points.length > 10) {
      sparkleRef.current.rotation.y += 0.02;
      sparkleRef.current.rotation.x += 0.01;
    }
  });
  
  if (points.length < 2) return null;
  
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.08, 12, false);
  
  return (
    <group>
      {/* Main trail tube */}
      <mesh ref={trailRef} geometry={tubeGeometry}>
        <meshStandardMaterial 
          color="#FF6B00" 
          transparent 
          opacity={0.8}
          emissive="#FF6B00"
          emissiveIntensity={0.6}
        />
      </mesh>
      
      {/* Inner glow trail */}
      <mesh geometry={new THREE.TubeGeometry(curve, 64, 0.04, 8, false)}>
        <meshStandardMaterial 
          color="#FFAA00" 
          transparent 
          opacity={0.4}
          emissive="#FFAA00"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Sparkle particles along trail */}
      <group ref={sparkleRef}>
        {points.length > 5 && Array.from({ length: Math.min(points.length / 3, 15) }).map((_, i) => {
          const pointIndex = Math.floor((i / 15) * (points.length - 1));
          const point = points[pointIndex];
          return (
            <mesh key={i} position={point}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial 
                color="#FFFFFF" 
                emissive="#FFAA00"
                emissiveIntensity={2}
                transparent
                opacity={0.8}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

// Location Labels Component
const LocationLabel = ({ position, text, color = "#FFFFFF", size = 1 }) => {
  const labelRef = useRef();
  
  useFrame((state) => {
    if (labelRef.current) {
      // Make labels always face camera
      labelRef.current.lookAt(state.camera.position);
      // Gentle floating animation
      labelRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });
  
  return (
    <group ref={labelRef} position={position}>
      {/* Background panel */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[text.length * 0.4 * size, 0.8 * size]} />
        <meshStandardMaterial 
          color="#000000" 
          transparent 
          opacity={0.7}
        />
      </mesh>
      
      {/* 3D Text */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.3 * size}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/roboto-bold.woff"
        maxWidth={10}
      >
        {text}
      </Text>
      
      {/* Glow effect */}
      <pointLight 
        position={[0, 0, 0.5]} 
        color={color} 
        intensity={0.5} 
        distance={3} 
      />
    </group>
  );
};

// Animated Scene Component
const AnimatedScene = ({ routeCoordinates, progress, showDestination }) => {
  const cameraRef = useRef();
  const trailPoints = useRef([]);
  
  // Calculate car position along the route
  const carPosition = React.useMemo(() => {
    if (routeCoordinates.length < 2) return [0, 0, 0];
    
    const totalDistance = routeCoordinates.length - 1;
    const currentIndex = Math.floor(progress * totalDistance);
    const nextIndex = Math.min(currentIndex + 1, routeCoordinates.length - 1);
    const localProgress = (progress * totalDistance) - currentIndex;
    
    const current = routeCoordinates[currentIndex];
    const next = routeCoordinates[nextIndex];
    
    const x = current[0] + (next[0] - current[0]) * localProgress;
    const z = current[1] + (next[1] - current[1]) * localProgress;
    
    return [x, 0.2, z];
  }, [progress, routeCoordinates]);
  
  // Calculate car rotation based on direction
  const carRotation = React.useMemo(() => {
    if (routeCoordinates.length < 2) return [0, 0, 0];
    
    const totalDistance = routeCoordinates.length - 1;
    const currentIndex = Math.floor(progress * totalDistance);
    const nextIndex = Math.min(currentIndex + 1, routeCoordinates.length - 1);
    
    if (currentIndex === nextIndex) return [0, 0, 0];
    
    const current = routeCoordinates[currentIndex];
    const next = routeCoordinates[nextIndex];
    
    const angle = Math.atan2(next[0] - current[0], next[1] - current[1]);
    return [0, angle, 0];
  }, [progress, routeCoordinates]);
  
  // Update trail points
  useEffect(() => {
    if (carPosition) {
      trailPoints.current.push(new THREE.Vector3(...carPosition));
      // Keep only the last 50 points
      if (trailPoints.current.length > 50) {
        trailPoints.current.shift();
      }
    }
  }, [carPosition]);
  
  useFrame((state) => {
    // Cinematic drone-like camera behavior
    if (cameraRef.current && carPosition) {
      const animationTime = progress * 18; // 18 second animation
      
      if (animationTime < 3) {
        // Phase 1: Start near airport, slowly zoom out (0-3s)
        const zoomOutProgress = animationTime / 3;
        const startPos = new THREE.Vector3(2, 3, 5);
        const zoomOutPos = new THREE.Vector3(0, 15, -20);
        cameraRef.current.position.lerpVectors(startPos, zoomOutPos, zoomOutProgress);
        cameraRef.current.lookAt(0, 0, 0); // Look at starting area
        
      } else if (animationTime < 6) {
        // Phase 2: Show full route overview (3-6s)
        const routeMidPoint = routeCoordinates[Math.floor(routeCoordinates.length / 2)];
        const overviewPos = new THREE.Vector3(routeMidPoint[0], 25, routeMidPoint[1] - 30);
        cameraRef.current.position.lerp(overviewPos, 0.1);
        
        // Look at the route midpoint
        if (routeMidPoint) {
          cameraRef.current.lookAt(routeMidPoint[0], 0, routeMidPoint[1]);
        }
        
      } else {
        // Phase 3: Follow the car like a drone (6-18s)
        const followIntensity = Math.min((animationTime - 6) / 2, 1); // Smooth transition
        
        // Dynamic offset based on car movement direction
        let offset = new THREE.Vector3(-3, 8, -12);
        
        // Adjust camera height and distance based on progress
        if (progress > 0.8) {
          // Get closer for dramatic arrival
          offset = new THREE.Vector3(-2, 6, -8);
        }
        
        const targetPosition = new THREE.Vector3(...carPosition).add(offset);
        const currentPos = cameraRef.current.position.clone();
        
        // Smooth camera movement with easing
        cameraRef.current.position.lerpVectors(
          currentPos, 
          targetPosition, 
          0.08 * followIntensity
        );
        
        // Look slightly ahead of the car
        const lookAheadFactor = 1.2;
        const lookTarget = new THREE.Vector3(
          carPosition[0] * lookAheadFactor, 
          carPosition[1] + 1, 
          carPosition[2] * lookAheadFactor
        );
        cameraRef.current.lookAt(lookTarget);
        
        // Add subtle camera shake for realism
        if (progress > 0.1) {
          const shake = 0.1;
          cameraRef.current.position.x += (Math.random() - 0.5) * shake;
          cameraRef.current.position.y += (Math.random() - 0.5) * shake * 0.5;
        }
      }
    }
  });
  
  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef}
        makeDefault 
        position={[0, 10, -15]} 
        fov={60}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <hemisphereLight color="#ffffff" groundColor="#444444" intensity={0.6} />
      
      {/* Car with Basketball on top */}
      <group position={carPosition} rotation={carRotation}>
        <Car3D position={[0, 0, 0]} rotation={[0, 0, 0]} scale={0.8} />
        <Basketball position={[0, 1.2, 0]} />
      </group>
      
      {/* Motion Trail */}
      {trailPoints.current.length > 1 && (
        <MotionTrail points={trailPoints.current} />
      )}
      
      {/* Destination Marker */}
      {showDestination && routeCoordinates.length > 0 && (
        <BasketballCourtMarker 
          position={[
            routeCoordinates[routeCoordinates.length - 1][0],
            0,
            routeCoordinates[routeCoordinates.length - 1][1]
          ]}
          progress={progress}
        />
      )}
      
      {/* Location Labels */}
      <LocationLabel 
        position={[0, 4, 0]} 
        text="✈️ RGI AIRPORT"
        color="#4A90E2"
        size={1.2}
      />
      
      <LocationLabel 
        position={[-15, 3, -20]} 
        text="📍 JADCHERLA"
        color="#FFAA00"
        size={1.0}
      />
      
      {showDestination && (
        <LocationLabel 
          position={[
            routeCoordinates[routeCoordinates.length - 1][0],
            5,
            routeCoordinates[routeCoordinates.length - 1][1]
          ]} 
          text="🏀 NMIMS HYDERABAD"
          color="#FF6B00"
          size={1.5}
        />
      )}
      
      {/* Enhanced Ground plane with terrain texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#0d4a0d" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Road representation */}
      {routeCoordinates.length > 1 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[150, 150]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            roughness={0.8}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </>
  );
};

// Actual GPS coordinates for realistic route
const airportCoords = [78.4294, 17.2403]; // Rajiv Gandhi International Airport
const nmimsCoords = [78.14250235351602, 16.825368735895818]; // NMIMS Hyderabad Campus (precise coordinates)

// Realistic route waypoints following actual roads via NH44 and local roads
const realRouteWaypoints = [
  [78.4294, 17.2403], // Airport
  [78.4250, 17.2350], // Exit airport area
  [78.4200, 17.2280], // Join airport road
  [78.4150, 17.2200], // Towards Shamshabad
  [78.4100, 17.2100], // Shamshabad town
  [78.4000, 17.1950], // Continue on main road
  [78.3850, 17.1800], // Road junction
  [78.3700, 17.1650], // Towards Jadcherla route
  [78.3500, 17.1450], // Highway merge
  [78.3300, 17.1250], // NH44 section
  [78.3100, 17.1050], // Continue NH44
  [78.2900, 17.0850], // Approach Jadcherla
  [78.2700, 17.0650], // Jadcherla area
  [78.2500, 17.0450], // Through Jadcherla
  [78.2300, 17.0250], // Exit Jadcherla
  [78.2100, 17.0100], // Towards NMIMS
  [78.1700, 16.9200], // Industrial area approach
  [78.1600, 16.8600], // Green Industrial Park area
  [78.1500, 16.8400], // Polepally SEZ approach
  [78.14250235351602, 16.825368735895818]  // NMIMS Campus (precise coordinates)
];

// Main Component
const AnimatedMap3D = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDestination, setShowDestination] = useState(false);
  const [show3DView, setShow3DView] = useState(true); // Default to 3D view
  const [showRouteMap, setShowRouteMap] = useState(false);
  
  const handleStartAnimation = React.useCallback(() => {
    setProgress(0);
    setShowDestination(false);
    setIsPlaying(true);
    
    // Optionally switch to 3D view and fly to airport
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: airportCoords,
        zoom: 12,
        pitch: 60,
        bearing: -20,
        duration: 2000
      });
    }
  }, []);
  
  // Generate smooth route with interpolated points for animation
  const routeCoordinates = React.useMemo(() => {
    const points = [];
    const segmentsPerWaypoint = 8; // More segments for smoother animation
    
    for (let i = 0; i < realRouteWaypoints.length - 1; i++) {
      const current = realRouteWaypoints[i];
      const next = realRouteWaypoints[i + 1];
      
      for (let j = 0; j < segmentsPerWaypoint; j++) {
        const t = j / segmentsPerWaypoint;
        const lng = current[0] + (next[0] - current[0]) * t;
        const lat = current[1] + (next[1] - current[1]) * t;
        
        // Convert to local 3D coordinates with proper scaling
        const x = (lng - airportCoords[0]) * 150; // Increased scale for better visibility
        const z = (lat - airportCoords[1]) * 150;
        points.push([x, z]);
      }
    }
    
    // Add final destination point
    const finalLng = realRouteWaypoints[realRouteWaypoints.length - 1][0];
    const finalLat = realRouteWaypoints[realRouteWaypoints.length - 1][1];
    const finalX = (finalLng - airportCoords[0]) * 150;
    const finalZ = (finalLat - airportCoords[1]) * 150;
    points.push([finalX, finalZ]);
    
    return points;
  }, []);
  
  // Enhanced Animation loop with precise timing
  useEffect(() => {
    if (!isPlaying) return;
    
    const duration = 17000; // Exactly 17 seconds for optimal viewing
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      
      setProgress(newProgress);
      
      // Show destination marker when 80% complete
      if (newProgress >= 0.75) {
        setShowDestination(true);
      }
      
      if (newProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete - car has arrived
        setIsPlaying(false);
        
        // Optional: Auto-restart after a pause
        setTimeout(() => {
          if (window.confirm('Play the journey animation again?')) {
            handleStartAnimation();
          }
        }, 3000);
      }
    };
    
    animate();
  }, [isPlaying, handleStartAnimation]);
  
  // Initialize Mapbox map
  useEffect(() => {
    const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
    
    if (!mapboxToken || !mapContainerRef.current) return;
    
    mapboxgl.accessToken = mapboxToken;
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [(airportCoords[0] + nmimsCoords[0]) / 2, (airportCoords[1] + nmimsCoords[1]) / 2],
      zoom: 9,
      pitch: 60,
      bearing: 0,
      antialias: true
    });
    
    map.on('load', () => {
      // Add 3D terrain
      map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });
      
      map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
      
      // Add route line
      map.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': [airportCoords, nmimsCoords]
          }
        }
      });
      
      map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#FF6B00',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
      
      // Add markers
      new mapboxgl.Marker({ color: '#4A90E2' })
        .setLngLat(airportCoords)
        .setPopup(new mapboxgl.Popup().setHTML('<h3>✈️ RGI Airport</h3>'))
        .addTo(map);
      
      new mapboxgl.Marker({ color: '#FF6B00' })
        .setLngLat(nmimsCoords)
        .setPopup(new mapboxgl.Popup().setHTML('<h3>🏀 NMIMS Hyderabad</h3>'))
        .addTo(map);
    });
    
    mapRef.current = map;
    
    return () => map.remove();
  }, []);
  

  
  const handle3DToggle = () => {
    setShow3DView(!show3DView);
  };
  
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
  
  // Debug log
  console.log('Mapbox token exists:', !!mapboxToken);
  console.log('Token length:', mapboxToken ? mapboxToken.length : 0);
  
  if (!mapboxToken) {
    return (
      <div className="animated-map-placeholder">
        <div className="placeholder-content">
          <h3>🎥 3D Animated Map</h3>
          <p>
            To enable the 3D animated map, please add your Mapbox token to the <code>.env</code> file:
          </p>
          <code className="env-code">REACT_APP_MAPBOX_TOKEN=your_token_here</code>
          <p className="env-note">
            Get a free token from{' '}
            <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer">
              mapbox.com
            </a>
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="animated-map-3d">
      {/* Text Overlays */}
      <div className="map-overlay top">
        <div className="overlay-content">
          <h2 className="journey-title">
            ✈️ Rajiv Gandhi International Airport → 🏀 NMIMS Hyderabad
          </h2>
          <p className="journey-subtitle">Welcome to Inter-NMIMS Basketball Tournament 2025</p>
        </div>
      </div>
      
      {/* Controls */}
      <div className="map-controls">
        <button 
          className="control-btn play-btn" 
          onClick={handleStartAnimation}
          disabled={isPlaying}
        >
          {isPlaying ? '🎬 Playing...' : '▶️ Start Animation'}
        </button>
        <button 
          className="control-btn view-btn" 
          onClick={handle3DToggle}
        >
          {show3DView ? '🗺️ Map View' : '🎮 3D View'}
        </button>
        <button 
          className="control-btn route-btn" 
          onClick={() => setShowRouteMap(!showRouteMap)}
        >
          {showRouteMap ? '✖️ Close Route' : '🛣️ View Route'}
        </button>
        <a
          href="https://www.google.com/maps?q=16.825368735895818,78.14250235351602&hl=en&t=m&z=15"
          target="_blank"
          rel="noopener noreferrer"
          className="control-btn maps-btn"
        >
          🗺️ Google Maps
        </a>
        <a
          href="https://www.uber.com/global/en/cities/hyderabad/"
          target="_blank"
          rel="noopener noreferrer"
          className="control-btn cab-btn"
        >
          🚗 Book Cab
        </a>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      
      {/* Bottom Info */}
      {progress >= 0.95 && (
        <div className="map-overlay bottom">
          <div className="arrival-message">
            <h3>🏀 Welcome to NMIMS Hyderabad Campus!</h3>
            <p>Plot No. B4, Green Industrial Park, Polepally SEZ, Jadcherla</p>
            <a
              href="https://www.google.com/maps?q=16.825368735895818,78.14250235351602&hl=en&t=m&z=15"
              target="_blank"
              rel="noopener noreferrer"
              className="maps-link"
            >
              📍 Open in Google Maps
            </a>
          </div>
        </div>
      )}
      
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className={`map-container ${show3DView ? 'hidden' : ''}`}
      />
      
      {/* 3D Canvas View */}
      {show3DView && (
        <div className="canvas-container">
          <Canvas 
            shadows
            onCreated={({ gl }) => {
              // Handle WebGL context loss
              gl.domElement.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                console.warn('WebGL context lost. Attempting to restore...');
              });
              
              gl.domElement.addEventListener('webglcontextrestored', () => {
                console.log('WebGL context restored successfully.');
              });
            }}
          >
            <AnimatedScene 
              routeCoordinates={routeCoordinates}
              progress={progress}
              showDestination={showDestination}
            />
          </Canvas>
        </div>
      )}
      
      {/* Google Maps Route Embed */}
      {showRouteMap && (
        <div className="route-map-overlay">
          <div className="route-map-container">
            <div className="route-map-header">
              <h3>🛣️ Route: Airport to NMIMS Hyderabad</h3>
              <button 
                className="close-route-btn" 
                onClick={() => setShowRouteMap(false)}
              >
                ✖️
              </button>
            </div>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d232063.62336106147!2d78.12044395630514!3d17.036198448669424!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x3bcbbb7fb1d91b45%3A0x532029ec33eaa851!2sRajiv%20Gandhi%20International%20Airport%20(HYD)%2C%20Shamshabad%2C%20Hyderabad%2C%20Telangana%20500409!3m2!1d17.240282699999998!2d78.429358!4m5!1s0x3bca3174f92e7b17%3A0x55f32ff33b967591!2sSVKM&#39;s%20NMIMS%20deemed%20to%20be%20university%20Hyderabad%2C%20Green%20Industrial%20Park%2C%20SEZ%2C%20TSIIC%2C%20Polepalle%2C%20Jadcherla%2C%20Telangana!3m2!1d16.8251839!2d78.1424809!5e1!3m2!1sen!2sin!4v1760439132507!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Route from Airport to NMIMS Hyderabad"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedMap3D;
