import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const [user, setUser] = useState({
    name: "",
    age: "",
    email: "",
    city: "",
    userstatus: "",
    contact: "",
    emergencycontact: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userID = localStorage.getItem("userId");
  
    if (!token || !userID) {
      setError("Missing token or userID. Please log in again.");
      return;
    }
  
    const updateData = Object.fromEntries(
      Object.entries(user).filter(([_, value]) => value !== "")
    );
  
    if (Object.keys(updateData).length === 0) {
      setError("Please fill at least one field to update.");
      return;
    }
  
    try {
      const res = await axios.patch(
        `http://localhost:5000/users/${userID}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setSuccessMessage(res.data.message || "Profile updated successfully.");
      setError("");
  
      if (updateData.userstatus) {
        const status = updateData.userstatus.toLowerCase();
        if (status === "driver") {
          setTimeout(() => {
            navigate("/register-driver");
          }, 1500);
        } 
      }
  
    } catch (err) {
      setError("Failed to update profile");
      console.error("Error updating profile:", err);
    }
  };
  return (
    <div style={{ padding: "2rem", backgroundColor: "#F7ECDA", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#B5651D", textAlign: "center" }}>Edit Profile</h2>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {successMessage && <p style={{ color: "green", textAlign: "center" }}>{successMessage}</p>}

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "0.5rem",
          boxShadow: "0 0 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        {[
          { label: "Name", type: "text", name: "name" },
          { label: "Email", type: "email", name: "email" },
          { label: "Age", type: "number", name: "age" },
          { label: "City", type: "text", name: "city" },
          { label: "User Status", type: "text", name: "userstatus" },
          { label: "Contact", type: "text", name: "contact" },
          { label: "Emergency Contact", type: "text", name: "emergencycontact" },
        ].map(({ label, type, name }) => (
          <div style={{ marginBottom: "1rem" }} key={name}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>{label}:</label>
            <input
              type={type}
              name={name}
              placeholder={`Enter ${label.toLowerCase()}`}
              value={user[name]}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "0.25rem",
                border: "1px solid #ccc",
              }}
            />
          </div>
        ))}

        <button
          type="submit"
          style={{
            backgroundColor: "#B5651D",
            color: "#fff",
            padding: "0.7rem 1.5rem",
            borderRadius: "0.375rem",
            width: "100%",
            cursor: "pointer",
            border: "none",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;
