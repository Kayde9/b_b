import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

const BasketballMesh = () => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]}>
      <meshStandardMaterial
        color="#F97316"
        roughness={0.5}
        metalness={0.2}
      />
    </Sphere>
  );
};

const Basketball3D = () => {
  return (
    <Canvas 
      camera={{ position: [0, 0, 4], fov: 50 }}
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
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#F97316" />
      <BasketballMesh />
    </Canvas>
  );
};

export default Basketball3D;
