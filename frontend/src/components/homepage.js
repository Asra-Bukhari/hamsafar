import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

mapboxgl.accessToken = 'pk.eyJ1IjoiYXNyYWJ1a2hhcmkiLCJhIjoiY208aXk0enoyMDhlZzJpcjR2ODNvZm51NyJ9.aOF8rIy52nwgEhRnGzmvsw';

const HomePage = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [areas, setAreas] = useState([]);
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [userStatus, setUserStatus] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      console.warn("User ID not found in localStorage.");
      return;
    }

    // NEW: Check if user is already in a trip
    axios.get(`http://localhost:5000/scheduledtrips/check-in-trip/${userID}`)
      .then((response) => {
        if (response.data.inTrip) {
          localStorage.setItem('tripID', response.data.tripID);
          navigate("/tripinfo");
        }
      })
      .catch((err) => {
        console.error("Error checking user trip:", err);
      });

    axios.get(`http://localhost:5000/users/location/${userID}`)
      .then((response) => {
        const { latitude, longitude } = response.data;
        setUserCoordinates([longitude, latitude]);
      })
      .catch(console.error);

    axios.get(`http://localhost:5000/users/name/${userID}`)
      .then((response) => setUserName(response.data.name))
      .catch(console.error);

    axios.get(`http://localhost:5000/users/email/${userID}`)
      .then((response) => setUserEmail(response.data.email))
      .catch(console.error);

    axios.get(`http://localhost:5000/areas/dropdown`)
      .then((response) => setAreas(response.data))
      .catch((err) => console.error("Error fetching areas:", err));

    axios.get(`http://localhost:5000/users/status/${userID}`)
      .then((response) => setUserStatus(response.data.userStatus))
      .catch((err) => console.error("Error fetching user status:", err));
  }, [navigate]);

  useEffect(() => {
    if (!userCoordinates || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: userCoordinates,
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    new mapboxgl.Marker({ color: 'navy' })
      .setLngLat(userCoordinates)
      .setPopup(new mapboxgl.Popup().setText("Your Current Location"))
      .addTo(map.current);
  }, [userCoordinates]);

  const handleTripClick = (type) => {
    if (!startLocation || !destination || !fare) {
      alert("Please fill all fields.");
      return;
    }

    localStorage.setItem("startAreaCode", startLocation);
    localStorage.setItem("destinationAreaCode", destination);
    localStorage.setItem("fare", fare);
    localStorage.setItem("paymentMethod", paymentMethod);

    navigate(`/${type}`);
  };

  const styles = {
    container: {
      height: "100vh",
      width: "100vw",
      border: "10px solid #2f2f4f",
      boxSizing: "border-box",
      position: "relative",
      display: "flex",
    },
    map: {
      flex: 1,
      height: "100%",
    },
    sidebar: {
      position: "absolute",
      top: 0,
      left: sidebarOpen ? 0 : "-270px",
      height: "100%",
      width: "270px",
      backgroundColor: "#2f2f4f",
      color: "white",
      padding: "20px",
      boxSizing: "border-box",
      transition: "left 0.3s ease",
      zIndex: 2,
    },
    menuButton: {
      position: "absolute",
      top: "20px",
      left: "20px",
      height: "50px",
      width: "50px",
      borderRadius: "50%",
      backgroundColor: "#2f2f4f",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      zIndex: 3,
    },
    formBox: {
      width: "350px",
      backgroundColor: "#f5f5f5",
      padding: "20px",
      boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      borderRadius: "10px",
      margin: "30px",
      alignSelf: "flex-start",
    },
    formGroup: {
      marginBottom: "15px",
    },
    label: {
      fontWeight: "bold",
    },
    select: {
      width: "100%",
      padding: "8px",
      marginTop: "5px",
    },
    input: {
      width: "100%",
      padding: "8px",
      marginTop: "5px",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "space-between",
    },
    button: {
      padding: "10px 15px",
      backgroundColor: "#2f2f4f",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    profileBox: {
      backgroundColor: "#B5651D",
      borderRadius: "10px",
      padding: "15px",
      marginBottom: "30px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      cursor: "pointer",
    },
    profileIcon: {
      fontSize: "45px",
      color: "white",
    },
    profileText: {
      display: "flex",
      flexDirection: "column",
    },
    profileName: {
      fontSize: "18px",
      fontWeight: "bold",
    },
    profileEmail: {
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={{ fontSize: "30px", fontWeight: "bold", cursor: "pointer", marginBottom: "10px" }}
          onClick={() => setSidebarOpen(false)}>×
        </div>
        <div style={styles.profileBox} onClick={() => window.location.href = "/my-profile"}>
          <FaUserCircle style={styles.profileIcon} />
          <div style={styles.profileText}>
            <div style={styles.profileName}>{userName}</div>
            <div style={styles.profileEmail}>{userEmail}</div>
          </div>
        </div>
        <div>
          <h4>About Us</h4>
          <p>We connect drivers and passengers to reduce traffic and costs.</p>
        </div>
        <div style={{ marginTop: "20px" }}>
          <h4>Help</h4>
          <p>Contact support at carpool@app.com</p>
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainer} style={styles.map}>
        {!userCoordinates && <p style={{ color: "white", padding: "10px" }}>Loading map...</p>}
      </div>

      {/* Form Box */}
      <div style={styles.formBox}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Start Location:</label>
          <select style={styles.select} onChange={(e) => setStartLocation(e.target.value)} value={startLocation}>
            <option value="">Select Start</option>
            {areas.map((area) => (
              <option key={area.AreaCode} value={area.AreaCode}>
                {area.City}, {area.Town}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Destination:</label>
          <select style={styles.select} onChange={(e) => setDestination(e.target.value)} value={destination}>
            <option value="">Select Destination</option>
            {areas.map((area) => (
              <option key={area.AreaCode} value={area.AreaCode}>
                {area.City}, {area.Town}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Fare (PKR):</label>
          <input type="number" style={styles.input} value={fare} onChange={(e) => setFare(e.target.value)} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Payment Method:</label>
          <select style={styles.select} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="Easypaisa">Easypaisa</option>
            <option value="JazzCash">JazzCash</option>
          </select>
        </div>

        <div style={styles.buttonGroup}>
          {userStatus === "Driver" && (
            <button style={styles.button} onClick={() => handleTripClick("scheduletrip")}>
              Schedule Trip
            </button>
          )}
          <button style={styles.button} onClick={() => handleTripClick("jointrip")}>
            Join Trip
          </button>
        </div>
      </div>

      {/* Menu Button */}
      {!sidebarOpen && (
        <div style={styles.menuButton} onClick={() => setSidebarOpen(true)}>
          <div style={{ width: "20px", height: "2px", backgroundColor: "#fff", margin: "3px 0" }}></div>
          <div style={{ width: "20px", height: "2px", backgroundColor: "#fff", margin: "3px 0" }}></div>
          <div style={{ width: "20px", height: "2px", backgroundColor: "#fff", margin: "3px 0" }}></div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
