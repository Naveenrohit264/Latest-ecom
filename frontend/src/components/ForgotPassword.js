import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VerifyOTP from "./VerifyOtp";
import RealmLogo from './RealmLogo';
import styles from "./ForgotPassword.module.css";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showVerifyOTP, setShowVerifyOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const generateAndSendOTP = () => {
    setIsLoading(true); // Set loading state to true before sending OTP
    axios
      .post("http://localhost:8800/send-otp", { email })

      .then((response) => {
        setMessage(`OTP sent successfully to ${email}`);
        setShowVerifyOTP(true);
        setIsLoading(false); // Set loading state to false after OTP is sent
      })
      .catch((error) => {
        setIsLoading(false); // Set loading state to false if there's an error
        if (error.response && error.response.status === 404) {
          toast.error("Email does not exist. Please enter a valid email.");
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
        console.error("Error:", error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateAndSendOTP();
  };

  return (
    <div>
      
   
    <div>
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
      <div className={styles.logoname}>
      <Link to="/login"><RealmLogo className={styles['realm-logo']} /></Link> 
      </div>

      <div className={styles.forgotpasswordcontainer}>
        {!showVerifyOTP ? (
          <form onSubmit={handleSubmit} className={styles.forgotpasswordform}>
            <div className={styles.formgroup}>
              <label htmlFor="email">
                <h1>Password assistance</h1>
                <h5 className={styles.formgroupheading}>Enter the email address associated with your <strong>FLYBUY account</strong>.</h5>
 
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                required
                placeholder="Enter your mail"
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.RESET}>
              {isLoading ? (
                <>
                  <span>Sending Otp..</span>
                  <div className={styles.loader}/>
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>
        ) : (
          <VerifyOTP email={email} />
        )}
      </div>
    </div>
    </div>
  );
};

export default ForgotPassword;