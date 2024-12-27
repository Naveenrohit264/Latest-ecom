import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RealmLogo from "./RealmLogo";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toastify css
import styles from "./Register.module.css"; // Import the styles object

const Register = () => {
  const navigate = useNavigate();
  const val = {
    username: "",
    email: "",
    password: "",
    mobile: "",
  };

  const [inputs, setInputs] = useState(val);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    general: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[0-9a-zA-Z!@#$%^&*]{6,14}$/;
    return passwordRegex.test(password);
  };

  const handleClick = async (e) => {
    e.preventDefault();
    let valid = true;
    const newErrors = { ...errors };

    if (!inputs.username) {
      valid = false;
      newErrors.username = "Name is required";
    }

    if (!inputs.email || !validateEmail(inputs.email)) {
      valid = false;
      newErrors.email = "Please enter a valid email address";
    }

    if (!inputs.password || !validatePassword(inputs.password)) {
      valid = false;
      newErrors.password =
        "Password must be 6 to 14 characters long with at least one uppercase letter, one lowercase letter, and one special character";
    }

    if (valid) {
      try {
        const response = await axios.post("http://localhost:8800/signup", inputs);

        if (response.status === 200) {
          toast.success("Signup Successful! Please login.");
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          newErrors.general = "Registration failed. Please try again.";
          setErrors(newErrors);
        }
      } catch (err) {
        if (err.response && err.response.data) {
          newErrors.general = err.response.data.message || "Registration failed. Please try again.";
        } else {
          newErrors.general = "An unexpected error occurred. Please try again later.";
        }
        setErrors(newErrors);
      }
    }

    setErrors(newErrors);
  };

  return (
    <div className={styles.register}>
      <ToastContainer /> {/* Add ToastContainer */}
      <div className={styles.imagecontainer}>
        <img src="/Login3.gif" className={styles.loginimage} alt="website login" />
      </div>

      <div className={styles.card}>
        <div className={styles.right}>
          <div>
            <Link to="/login" className={styles.logolink}>
              <RealmLogo className={styles.realmlogo} />
            </Link>

            <h1>Signup</h1>
            {errors.username && <div className={styles.errormessage}>{errors.username}</div>}
            {errors.email && <div className={styles.errormessage}>{errors.email}</div>}
            {errors.password && <div className={styles.errormessage}>{errors.password}</div>}
            {errors.general && <div className={styles.errormessage}>{errors.general}</div>}
            <form>
              <input
                type="text"
                placeholder="Name"
                name="username"
                value={inputs.username}
                onChange={handleChange}
              />

              <input
                type="email"
                placeholder="Email"
                name="email"
                value={inputs.email}
                onChange={handleChange}
              />

              <input
                type="password"
                placeholder="Password"
                name="password"
                value={inputs.password}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="MobileNumber"
                name="mobile"
                value={inputs.mobile}
                onChange={handleChange}
              />

              <button className={styles.registerbutton} onClick={handleClick}>
                Signup
              </button>
              <div className={styles.left}>
                <span>Already have an account?</span>
                <Link to="/">
                  <button className={styles.loginbutton}>Login</button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
