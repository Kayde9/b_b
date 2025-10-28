import React, { Suspense, lazy } from 'react';

// Lazy load the heavy Three.js component
const Basketball3D = lazy(() => import('./Basketball3D'));

const LazyBasketball3D = () => {
  return (
    <Suspense fallback={
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#F97316',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      </div>
    }>
      <Basketball3D />
    </Suspense>
  );
};

export default LazyBasketball3D;

