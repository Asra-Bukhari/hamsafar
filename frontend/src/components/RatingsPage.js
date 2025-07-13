import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RatingsOverviewPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      const token = localStorage.getItem("token");
      const userID = localStorage.getItem("userID");

      if (!userID) {
        console.warn("User ID not found in localStorage.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/scheduledtrips/user-completed/${userID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTrips(response.data);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleRateNow = (tripId, driverId) => {
    navigate(`/rate/${tripId}/${driverId}`);
  };

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading trips...</p>;

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "2rem auto",
        padding: "1.5rem",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "1.5rem",
        }}
      >
        📝 My Trip Ratings
      </h2>

      {trips.length === 0 ? (
        <p style={{ textAlign: "center" }}>No completed trips found.</p>
      ) : (
        trips.map((trip) => (
          <div
            key={trip.TripID}
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <p><strong>Trip #{trip.TripID}</strong></p>
            <p>From: {trip.StartLocation}</p>
            <p>To: {trip.Destination}</p>
            <p>Departure: {new Date(trip.DepartureTime).toLocaleString()}</p>

            {trip.RatingID == null ? (
              <button
                onClick={() => handleRateNow(trip.TripID, trip.DriverID)}
                style={{
                  marginTop: "0.75rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Rate Now
              </button>
            ) : (
              <div style={{ marginTop: "0.5rem", color: "green" }}>
                <p>⭐ Rating: {trip.Rating}/5</p>
                <p>📝 Review: {trip.Review || "No written review."}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default RatingsOverviewPage;
