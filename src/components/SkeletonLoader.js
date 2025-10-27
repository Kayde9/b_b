import React from 'react';
import './SkeletonLoader.css';

// Generic skeleton loader component
export const SkeletonBox = ({ width = '100%', height = '20px', borderRadius = '4px', className = '' }) => (
  <div 
    className={`skeleton-box ${className}`}
    style={{ width, height, borderRadius }}
  />
);

// Skeleton for match cards
export const SkeletonMatchCard = () => (
  <div className="skeleton-match-card glass-card">
    <div className="skeleton-match-header">
      <SkeletonBox width="120px" height="24px" />
      <SkeletonBox width="80px" height="24px" borderRadius="12px" />
    </div>
    
    <div className="skeleton-match-teams">
      <div className="skeleton-team">
        <SkeletonBox width="60px" height="60px" borderRadius="50%" />
        <SkeletonBox width="150px" height="20px" />
      </div>
      
      <div className="skeleton-vs">
        <SkeletonBox width="40px" height="30px" />
      </div>
      
      <div className="skeleton-team">
        <SkeletonBox width="60px" height="60px" borderRadius="50%" />
        <SkeletonBox width="150px" height="20px" />
      </div>
    </div>
    
    <div className="skeleton-match-details">
      <SkeletonBox width="100px" height="16px" />
      <SkeletonBox width="80px" height="16px" />
      <SkeletonBox width="120px" height="16px" />
    </div>
    
    <SkeletonBox width="100%" height="44px" borderRadius="10px" className="skeleton-button" />
  </div>
);

// Skeleton for scoreboard
export const SkeletonScoreboard = () => (
  <div className="skeleton-scoreboard glass-card">
    <div className="skeleton-scoreboard-header">
      <SkeletonBox width="100px" height="28px" borderRadius="20px" />
      <SkeletonBox width="120px" height="28px" borderRadius="20px" />
    </div>
    
    <div className="skeleton-scoreboard-main">
      <div className="skeleton-team-section">
        <SkeletonBox width="80px" height="80px" borderRadius="50%" />
        <SkeletonBox width="150px" height="32px" />
        <SkeletonBox width="100px" height="60px" />
      </div>
      
      <div className="skeleton-timer-section">
        <SkeletonBox width="120px" height="80px" borderRadius="15px" />
      </div>
      
      <div className="skeleton-team-section">
        <SkeletonBox width="80px" height="80px" borderRadius="50%" />
        <SkeletonBox width="150px" height="32px" />
        <SkeletonBox width="100px" height="60px" />
      </div>
    </div>
    
    <div className="skeleton-players-section">
      <SkeletonBox width="200px" height="24px" />
      <div className="skeleton-players-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-player-card">
            <SkeletonBox width="100%" height="16px" />
            <SkeletonBox width="60%" height="14px" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Skeleton for gallery images
export const SkeletonGalleryImage = () => (
  <div className="skeleton-gallery-image">
    <SkeletonBox width="100%" height="300px" borderRadius="15px" />
    <SkeletonBox width="80%" height="20px" className="skeleton-caption" />
  </div>
);

// Skeleton for team cards
export const SkeletonTeamCard = () => (
  <div className="skeleton-team-card glass-card">
    <SkeletonBox width="100%" height="200px" borderRadius="15px 15px 0 0" />
    <div className="skeleton-team-info">
      <SkeletonBox width="70%" height="28px" />
      <SkeletonBox width="50%" height="20px" />
      <SkeletonBox width="100%" height="16px" />
      <SkeletonBox width="90%" height="16px" />
    </div>
  </div>
);

// Skeleton for player stats
export const SkeletonPlayerStats = () => (
  <div className="skeleton-player-stats glass-card">
    <div className="skeleton-player-header">
      <SkeletonBox width="50px" height="50px" borderRadius="50%" />
      <div className="skeleton-player-name">
        <SkeletonBox width="120px" height="20px" />
        <SkeletonBox width="80px" height="16px" />
      </div>
    </div>
    <div className="skeleton-stats-grid">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-stat-item">
          <SkeletonBox width="40px" height="32px" />
          <SkeletonBox width="60px" height="14px" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton for hero section
export const SkeletonHero = () => (
  <div className="skeleton-hero">
    <SkeletonBox width="60%" height="60px" className="skeleton-hero-title" />
    <SkeletonBox width="80%" height="24px" className="skeleton-hero-subtitle" />
    <div className="skeleton-hero-buttons">
      <SkeletonBox width="150px" height="50px" borderRadius="25px" />
      <SkeletonBox width="150px" height="50px" borderRadius="25px" />
    </div>
  </div>
);

// Skeleton for list items
export const SkeletonListItem = () => (
  <div className="skeleton-list-item">
    <SkeletonBox width="40px" height="40px" borderRadius="50%" />
    <div className="skeleton-list-content">
      <SkeletonBox width="70%" height="20px" />
      <SkeletonBox width="50%" height="16px" />
    </div>
  </div>
);

// Generic skeleton grid
export const SkeletonGrid = ({ count = 6, component: Component = SkeletonMatchCard }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, index) => (
      <Component key={index} />
    ))}
  </div>
);

export default SkeletonBox;
