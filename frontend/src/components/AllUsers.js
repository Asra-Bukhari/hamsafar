import React, { useEffect, useState } from "react";
import axios from "axios";

const AllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 1;

  const backgroundColor = "#F7ECDA";
  const primaryColor = "#B5651D";
  const accentColor = "#2f2f4f";

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, []);

  const nextPage = () => {
    if (startIndex + itemsPerPage < users.length) {
      setStartIndex(startIndex + itemsPerPage);
    }
  };

  const prevPage = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - itemsPerPage);
    }
  };

  return (
    <div style={{ padding: "2rem", backgroundColor, minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", color: accentColor, marginBottom: "2rem" }}>
        All Registered Users
      </h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <button onClick={prevPage} style={{ ...navButtonStyle, backgroundColor: accentColor }} disabled={startIndex === 0}>
          {"<"}
        </button>
        <button onClick={nextPage} style={{ ...navButtonStyle, backgroundColor: accentColor }} disabled={startIndex + itemsPerPage >= users.length}>
          {">"}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {users.slice(startIndex, startIndex + itemsPerPage).map((user, index) => (
          <div key={index} style={{ ...cardStyle, border: `2px solid ${primaryColor}` }}>
            <img
              src="/images/dummy-profile.png"
              alt="User"
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                borderRadius: "0.75rem",
                marginBottom: "1rem",
                border: `2px solid ${accentColor}`,
              }}
            />
            <h3 style={{ color: primaryColor }}>{user.Name}</h3>
            <p><strong style={{ color: accentColor }}>Gender:</strong> {user.Gender}</p>
            <p><strong style={{ color: accentColor }}>Age:</strong> {user.Age}</p>
            <p><strong style={{ color: accentColor }}>City:</strong> {user.City}</p>
            <p><strong style={{ color: accentColor }}>Status:</strong> {user.UserStatus}</p>
            <p><strong style={{ color: accentColor }}>Contact:</strong> {user.Contact}</p>
            <p><strong style={{ color: accentColor }}>Admin:</strong> {user.isAdmin ? "Yes" : "No"}</p>
            <p><strong style={{ color: accentColor }}>Active:</strong> {user.IsActive ? "Yes" : "No"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const cardStyle = {
  width: "350px",
  backgroundColor: "#fff",
  borderRadius: "1rem",
  boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
  padding: "1.5rem",
  textAlign: "left",
};

const navButtonStyle = {
  fontSize: "1.5rem",
  padding: "0.5rem 1.5rem",
  margin: "0 1rem",
  color: "#fff",
  border: "none",
  borderRadius: "0.5rem",
  cursor: "pointer",
};

export default AllUsersPage;
