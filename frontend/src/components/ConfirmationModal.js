// ConfirmationModal.js

import React from 'react';
import styles from './ConfirmationModal.module.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p>Are you sure you want to remove this item from your cart?</p>
        <div className={styles.buttonContainer}>
          <button onClick={onClose} style={{backgroundColor:"#65becf"}}>Cancel</button>
          <button onClick={onConfirm} style={{backgroundColor:"#65becf"}}>Remove</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
