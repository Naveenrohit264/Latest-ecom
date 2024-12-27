import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RealmLogo from './RealmLogo';
import styles from './PasswordReset.module.css';

const PasswordReset = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate(); // Access the navigate function

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const notifySuccess = (message) => {
    toast.success(message, {
      position: 'top-center',
      autoClose: 2000, // Close the toast after 2 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyError = (message) => {
    toast.error(message, {
      position: 'top-center',
      autoClose: 2000, // Close the toast after 2 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const resetPassword = () => {
    axios
      .post('http://localhost:8800/reset-password', { newPassword, confirmPassword })
      .then(() => {
        notifySuccess('Password changed successfully.'); // Set success message after password reset
        setTimeout(() => {
          navigate('/'); // Navigate to the sign-in page after 2 seconds
        }, 2000); // 2000 milliseconds = 2 seconds
      })
      .catch((error) => {
        notifyError('Failed to reset password. Please try again.');
        console.error('Error:', error);
      });
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      notifyError('Passwords do not match. Please re-enter.');
      return;
    }

    resetPassword();
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoname}>
        <Link to="/"><RealmLogo className={styles['realm-logo']} /></Link>
      </div>

      <div className={styles.passwordresetcontainer}>
        <ToastContainer />
        <h2 className={styles.HEADING1}>Create a new password</h2>
        <h5 className={styles.HEADING2}>We'll ask for this password whenever you sign in.</h5>

        <form onSubmit={handleResetSubmit} className={styles.passwordresetform}>
          <div className={styles.formgroup}>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={handleNewPasswordChange}
              required
            />
          </div>

          <div className={styles.formgroup}>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
          </div>

          <button type="submit" className={styles.rbtn}>
            Save changes and sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;
