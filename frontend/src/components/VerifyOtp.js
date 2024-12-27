import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from  "./VerifyOtp.module.css";
import RealmLogo from './RealmLogo';

const VerifyOTP = ({ email }) => {
  const [otp, setOTP] = useState(['', '', '', '']);
  const otpInputs = useRef([]);
  const navigate = useNavigate();

   const verifyOTP = (email) => { // Pass email as an argument
    const combinedOTP = otp.join('');
    axios
      .post('http://localhost:8800/verify-otp', { email, otp: combinedOTP })
      .then((response) => {
        if (response.status === 200) {
          if (response.data && response.data.message === 'OTP verified successfully.') {
            navigate('/PasswordReset'); 
          } else {
            toast.error('Failed to verify OTP. Please try again.');
          }
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          toast.error('Enter valid OTP');
        } else {
          toast.error('Failed to verify OTP. Please try again.');
        }
        console.error('Error:', error);
      });
  };

  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    verifyOTP(email); // Pass email to verifyOTP function
  };

  const handleOTPChange = (index, value) => {
    const updatedOTP = [...otp];
    updatedOTP[index] = value;
    setOTP(updatedOTP);

    if (value === '' && index > 0) {
      otpInputs.current[index - 1].focus();
    } else if (index < otp.length - 1 && value !== '') {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      otpInputs.current[index - 1].focus();
    }
  };

  useEffect(() => {
    document.body.classList.add('verify-otp-body');
    return () => {
      document.body.classList.remove('verify-otp-body');
    };
  }, []);

  return (
    <div>
       <div className={styles.logoname}>
      {/* <Link to="/login"><RealmLogo className={styles['realm-logo']} /></Link>  */}
      </div>

    
    <div className={styles.verifyotpcontainer}>
    {/* <label htmlFor="otp">{`*Enter the OTP sent to ${email}`}</label> */}
      <form onSubmit={handleVerificationSubmit} className={styles.verifyotpform}>
        <h3 className={styles.verifyotpheading1}>Verification required</h3>
        <h6 className={styles.verifyotpheading2}> We've sent an OTP to your email . Please enter it below to complete verification.</h6>
        <div className={styles.formgroup}>
         
          <div className={styles.otpinputs}>
            {otp.map((value, index) => (
              <input
                key={index}
                ref={(el) => (otpInputs.current[index] = el)}
                type="text"
                maxLength={1}
                pattern="[0-9]*"
                value={value}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                required
                className={styles.otpinput}
              />
            ))}
          </div>
        </div>
        <button type="submit" className={styles.verifyotpbutton}>
         Continue
        </button>
      </form>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
    </div>
  );
};

export default VerifyOTP;