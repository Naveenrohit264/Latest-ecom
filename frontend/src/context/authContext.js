import { createContext, useEffect, useState } from "react";
import axios from 'axios';

export const AuthContext = createContext();


export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
 

  const login = async (inputs) => {
    try {
      const res = await axios.post("http://localhost:8800/signin", inputs, {
        withCredentials: true,
      });
  
      setCurrentUser(res.data);
    } catch (error) {
      if (error.response && error.response.data) {
        // Check if the error message indicates incorrect email or password
        const errorMessage = error.response.data.message.toLowerCase();
        if (errorMessage.includes("email") || errorMessage.includes("password")) {
          throw new Error("Incorrect email or password");
        } else {
          throw new Error(error.response.data.message);
        }
      } else {
        throw new Error("An error occurred during login");
      }
    }
  };
  

  const logout = async () => {
    await axios.post("http://localhost:8800/logout", null, {
      withCredentials: true,
    });

    setCurrentUser(null);

    localStorage.removeItem("user");
    
  };



  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]); 

  return (
    <AuthContext.Provider value={{ currentUser, login, logout,  }}>
      {children}
    </AuthContext.Provider>
  );
};