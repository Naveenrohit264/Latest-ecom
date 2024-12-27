import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RealmLogo from "./RealmLogo";

const Login = () => {
  const [inputs, setInputs] = useState({
    identifier: "",
    password: "",
  });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);


  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      await login(inputs);
  
      // Assuming "flybuydefenders@gmail.com" is the email of the admin
      if (inputs.identifier === "flybuydefenders@gmail.com") {
        navigate("/adminpage");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message, {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <>
      <ToastContainer />
      <div style={{ display: "flex", alignItems: "stretch", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ display: "flex", width: "100%" }}>
          <div style={{ flex: "3", paddingRight: "20px" }}>
            {/* Left side with GIF */}
            <img src="./Login3.gif" alt="GIF" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: "1", borderRadius: "10px", overflow: "hidden", transition: "box-shadow 0.3s ease-in-out" }}>
            {/* Right side with login form */}
            <div style={{marginLeft:"29%",marginTop:"23%"}}>
              <RealmLogo />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", height: "100%",marginTop:"6%"}}>
              <form onSubmit={handleLogin} style={{ width: "100%" }}>
                <input
                  type="text"
                  placeholder="Email or Mobile Number"
                  name="identifier"
                  value={inputs.identifier}
                  onChange={handleChange}
                  style={{ ...inputStyle }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={inputs.password}
                  onChange={handleChange}
                  style={{ ...inputStyle }}
                />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button type="submit" style={{ ...buttonStyle, backgroundColor: '#65becf',fontWeight:"bold" }}>
                    Login
                  </button>
                  <Link to="/forgotpassword" style={{ color: "#007bff", textDecoration: "none", fontSize: "14px", marginTop: "10px" }}>
                    Forgot Password?
                  </Link>
                </div>
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
                  <span style={{ marginRight: "10px",marginTop:"5%" }}>New User?</span>
                  <Link to="/register">
                    <button style={{ 
                      backgroundColor: '#65becf',  
                      color: "#ffffff",
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight:"bold",
                      fontSize: "16px",
                      transition: "background-color 0.3s ease-in-out",
                    }}>Register</button>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const inputStyle = {
  padding: "10px",
  marginBottom: "20px",
  border: "1px solid #cccccc",
  borderRadius: "5px",
  fontSize: "16px",
  width: "100%",
  transition: "border-color 0.3s ease-in-out",
};

const buttonStyle = {
  backgroundColor: "#007bff",
  color: "#ffffff",
  padding: "10px 20px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
  transition: "background-color 0.3s ease-in-out",
};

export default Login;
