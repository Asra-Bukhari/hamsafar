import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const MyProfilePage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const backgroundColor = "#F7ECDA";
  const primaryColor = "#B5651D";
  const accentColor = "#2f2f4f";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in again.");
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5000/users/me/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data && res.data.user) {
          setUser(res.data.user);
        } else {
          throw new Error("User data not found in response.");
        }
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setError("Failed to load your profile.");
      });
  }, [navigate]);

  if (error)
    return <p style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</p>;
  if (!user)
    return <p style={{ textAlign: 'center' }}>Loading profile...</p>;

  const linkStyle = {
    padding: '0.8rem 1.2rem',
    margin: '0.5rem 0',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    color: '#fff',
    backgroundColor: primaryColor,
    display: 'block',
    textAlign: 'center',
    fontWeight: 'bold'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor }}>

      <div
        style={{
          position: 'fixed',
          left: navOpen ? 0 : '-250px',
          top: 0,
          bottom: 0,
          width: '250px',
          backgroundColor: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          transition: 'left 0.3s ease',
          padding: '2rem 1rem',
          zIndex: 20
        }}
      >
        <h3 style={{ marginBottom: '1rem', color: accentColor }}>Menu</h3>
        <Link to="/my-FriendGroups" style={linkStyle}>Friends</Link>
        <Link to="/my-ratings" style={linkStyle}>Ratings ⭐</Link>
      </div>

      <div
        style={{
          position: 'fixed',
          right: settingsOpen ? 0 : '-200px',
          top: 0,
          bottom: 0,
          width: '200px',
          backgroundColor: '#fff',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
          transition: 'right 0.3s ease',
          padding: '2rem 1rem',
          zIndex: 20
        }}
      >
        <h3 style={{ marginBottom: '1rem', color: accentColor }}>Settings</h3>
        <Link to="/Settings-see" style={{ ...linkStyle, backgroundColor: accentColor }}>Settings</Link>
        {user.isAdmin === 1 && (
          <>
            <Link to="/allusers" style={{ ...linkStyle, backgroundColor: accentColor }}>All Users</Link>
            <Link to="/view-all-vehicles" style={{ ...linkStyle, backgroundColor: accentColor }}>All Vehicles</Link>
            <Link to="/alltrips" style={{ ...linkStyle, backgroundColor: accentColor }}>All Scheduled Trips</Link>
          </>
        )}
      </div>

      <div style={{ flex: 1, padding: '2rem', marginLeft: '250px', marginRight: '200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setNavOpen(!navOpen)}
            style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: accentColor }}
          >
            ☰
          </button>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: accentColor }}
          >
            ⚙
          </button>
        </div>

        <div style={{
          maxWidth: '600px',
          margin: '2rem auto',
          backgroundColor: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '2rem',
          border: `2px solid ${primaryColor}`
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
              src="/images/dummy-profile.png"
              alt="Profile"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `4px solid ${accentColor}`
              }}
            />
            <div style={{ marginTop: '1rem' }}>
              <Link
                to="/Edit-My-Profile"
                style={{ ...linkStyle, backgroundColor: accentColor, width: 'auto', display: 'inline-block' }}
              >
                Edit Profile ✏
              </Link>
            </div>
          </div>

          <div style={{ color: '#333', lineHeight: '1.6', fontSize: '1rem' }}>
            <p><strong style={{ color: accentColor }}>Name:</strong> {user.Name}</p>
            <p><strong style={{ color: accentColor }}>Gender:</strong> {user.Gender}</p>
            <p><strong style={{ color: accentColor }}>Age:</strong> {user.Age}</p>
            <p><strong style={{ color: accentColor }}>City:</strong> {user.City}</p>
            <p><strong style={{ color: accentColor }}>Status:</strong> {user.UserStatus}</p>
            {user.Email && <p><strong style={{ color: accentColor }}>Email:</strong> {user.Email}</p>}
            {user.Contact && <p><strong style={{ color: accentColor }}>Contact:</strong> {user.Contact}</p>}
            {"isAdmin" in user && (
              <p><strong style={{ color: accentColor }}>Admin:</strong> {user.isAdmin ? "Yes" : "No"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
