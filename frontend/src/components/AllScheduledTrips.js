import React, { useEffect, useState } from "react";
import axios from "axios";

const AllScheduledTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 1;

  const backgroundColor = "#F7ECDA";
  const primaryColor = "#B5651D";
  const accentColor = "#2f2f4f";

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/scheduledtrips", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTrips(res.data);
      })
      .catch((err) => {
        console.error("Error fetching scheduled trips:", err);
      });
  }, []);

  const nextPage = () => {
    if (startIndex + itemsPerPage < trips.length) {
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
        All Scheduled Rides
      </h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <button onClick={prevPage} style={{ ...navButtonStyle, backgroundColor: accentColor }} disabled={startIndex === 0}>
          {"<"}
        </button>
        <button onClick={nextPage} style={{ ...navButtonStyle, backgroundColor: accentColor }} disabled={startIndex + itemsPerPage >= trips.length}>
          {">"}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {trips.slice(startIndex, startIndex + itemsPerPage).map((trip, index) => (
          <div key={index} style={{ ...cardStyle, border: `2px solid ${primaryColor}` }}>
            <img
              src="/images/dummy-trip-image.jpg"
              alt="Scheduled Trip"
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                borderRadius: "0.75rem",
                marginBottom: "1rem",
                border: `2px solid ${accentColor}`,
              }}
            />
            <h3 style={{ color: primaryColor }}>Trip ID: {trip.TripID}</h3>
            <p><strong style={{ color: accentColor }}>Start:</strong> {trip.StartLocation}</p>
            <p><strong style={{ color: accentColor }}>Destination:</strong> {trip.Destination}</p>
            <p><strong style={{ color: accentColor }}>Departure Time:</strong> {new Date(trip.DepartureTime).toLocaleString()}</p>
            <p><strong style={{ color: accentColor }}>Driver ID:</strong> {trip.DriverID}</p>
            <p><strong style={{ color: accentColor }}>Status:</strong> {trip.Statuss}</p>
            <p><strong style={{ color: accentColor }}>Travelers:</strong> {trip.Travelers}</p>
            <p><strong style={{ color: accentColor }}>Expected Duration:</strong> {trip.ExpectedDuration} mins</p>
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

export default AllScheduledTripsPage;
