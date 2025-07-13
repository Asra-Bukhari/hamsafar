import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const styles = {
    outerContainer: {
      height: "100vh",
      border: "30px solid #2f2f4f", 
      boxSizing: "border-box",
    },
    container: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
    },
    logo: {
      width: "100px",
      height: "100px",
      marginBottom: "20px",
    },
    box: {
      backgroundColor: "#f5f5dc",
      border: "5px solid #2f2f4f",
      padding: "40px",
      borderRadius: "12px",
      width: "320px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    },
    heading: {
      color: "#001f3f",
      textAlign: "center",
      marginBottom: "20px",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "16px",
      border: "none",
      borderRadius: "6px",
      backgroundColor: "#001f3f",
      color: "white",
      fontSize: "16px",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "center",
    },
    button: {
      width: "70%",
      padding: "12px",
      backgroundColor: "#001f3f",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: "16px",
    },
    paragraph: {
      color: "#001f3f",
      textAlign: "center",
      marginTop: "12px",
    },
    linkText: {
      textDecoration: "underline",
      cursor: "pointer",
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/users/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      const { token, userID, IsActive } = response.data;

      if (token && userID) {
        localStorage.setItem("token", token);
        localStorage.setItem("userID", userID);

        if (IsActive === false) {
          const headers = {
            headers: {
              Authorization: `Bearer ${token}`, // Corrected interpolation
            },
          };

          await axios.patch(
            `http://localhost:5000/users/${userID}`, // Corrected URL interpolation
            { IsActive: true },
            headers
          );
          toast.info("🎉 Account activated successfully!", { position: "top-center" });
        } else {
          toast.success("✅ Login successful!");
          setTimeout(() => {
            navigate("/home");
          }, 2000);
        }
      } else {
        toast.error("Login unsuccessful!");
        alert("Login failed: Missing token or userID");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <img src="/assets/logo.png" alt="Logo" style={styles.logo} />

        <div style={styles.box}>
          <h2 style={styles.heading}>Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <div style={styles.buttonContainer}>
              <button type="submit" style={styles.button}>
                Login
              </button>
            </div>
          </form>
          <p style={styles.paragraph}>
            Don’t have an account?{" "}
            <span onClick={() => navigate("/signup")} style={styles.linkText}>
              Sign Up
            </span>
          </p>
          <ToastContainer position="top-center" autoClose={3000} />
          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
