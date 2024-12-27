// StarRating.js
import React from 'react';
import styles from './StarRating.module.css'

const StarRating = ({ rating }) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={styles.star}>
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
  
    return <div>{stars}</div>;
  };

export default StarRating;
