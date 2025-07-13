import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userID");
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios
      .get("http://localhost:5000/users/me/profile", headers)
      .then((res) => setUser(res.data.user))
      .catch(() => toast.error("Failed to load your profile."));
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem("darkMode");
    if (storedTheme === "true") setDarkMode(true);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const handleDeactivate = async () => {
    try {
      await axios.patch(`http://localhost:5000/users/${userId}`, { IsActive: false }, headers);
      toast.success("Account deactivated successfully.");
      setTimeout(() => {
        localStorage.clear();
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error("Failed to deactivate account.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/users/${userId}`, headers);
      toast.success("Account deleted permanently.");
      setTimeout(() => {
        localStorage.clear();
        navigate("/signup");
      }, 1500);
    } catch (err) {
      toast.error("Failed to delete account.");
    }
  };

  const handleAdminKeySubmit = async () => {
    if (user?.isAdmin) {
      toast.info("You are already an admin.");
      return;
    }

    try {
      const { data } = await axios.post(
        `http://localhost:5000/users/make-admin/${userId}`,
        { secretKey: adminKey },
        headers
      );

      if (data.success) {
        toast.success("You are now an admin!");
        setTimeout(() => {
          localStorage.clear();
          navigate("/login");
        }, 1500);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to become admin.");
    }
  };

  const containerStyle = {
    backgroundColor: darkMode ? "#1e1e2f" : "#f5f5f5",
    color: darkMode ? "#f5f5f5" : "#1e1e2f",
    minHeight: "100vh",
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
  };

  const buttonStyle = (bg) => ({
    backgroundColor: bg,
    color: "#fff",
    padding: "1rem",
    width: "100%",
    border: "none",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
    cursor: "pointer",
    fontWeight: "bold",
  });

  const toggleBtnStyle = {
    backgroundColor: darkMode ? "#ddd" : "#333",
    color: darkMode ? "#333" : "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    marginBottom: "2rem",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center" }}>Settings</h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
        <button onClick={toggleTheme} style={toggleBtnStyle}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <button onClick={() => setShowKeyInput(true)} style={buttonStyle("#007bff")}>
          👑 Become Admin
        </button>

        {showKeyInput && (
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="password"
              placeholder="Enter Admin Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              style={{
                padding: "10px",
                width: "100%",
                borderRadius: "5px",
                border: "1px solid #ccc",
                marginBottom: "0.5rem",
              }}
            />
            <button onClick={handleAdminKeySubmit} style={buttonStyle("#28a745")}>
              🔐 Submit Key
            </button>
          </div>
        )}

        <button onClick={handleDeactivate} style={buttonStyle("#ffaa00")}>
          🚫 Deactivate Account
        </button>

        <button onClick={handleDelete} style={buttonStyle("#ff4c4c")}>
          🗑 Delete Account
        </button>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default SettingsPage;
