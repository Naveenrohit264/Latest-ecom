// TruckAnimation.jsx

import React, { useState, useEffect } from 'react';
import styles from './TruckAnimation.module.css'; // Import module CSS

const TruckAnimation = () => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const moveTruck = () => {
      setPosition((prevPosition) => prevPosition + 5);
    };

    const animationInterval = setInterval(moveTruck, 100);

    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div className={styles.truck} style={{ left: `${position}px` }}>
      🚚
    </div>
  );
};

export default TruckAnimation;
