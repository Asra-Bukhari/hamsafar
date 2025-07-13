import React, { useEffect, useState } from "react";
import axios from "axios";

const FeedPage = () => {
  const [matchingTrips, setMatchingTrips] = useState([]);
  const [nearbyTrips, setNearbyTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token"); 

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
    
        // Fetch matching trips
        try {
          const matchingRes = await axios.get(
            "http://localhost:5000/scheduledtrips/trips/matching-preferences",
            config
          );
          setMatchingTrips(matchingRes.data.trips || []);
        } catch (err) {
          console.error("Matching trips error:", err.response?.data || err.message);
          setMatchingTrips([]); // fallback to empty
        }
    
        // Fetch nearby trips
        try {
          const nearbyRes = await axios.get(
            "http://localhost:5000/scheduledtrips/nearby",
            config
          );
          setNearbyTrips(nearbyRes.data.trips || []);
        } catch (err) {
          console.error("Nearby trips error:", err.response?.data || err.message);
          setNearbyTrips([]); // fallback to empty
        }
    
      } catch (err) {
        console.error("Unexpected error in fetchTrips:", err.message);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    

    fetchTrips();
  }, [token]);

  if (loading) return <p>Loading feed...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🚗 Matching Trips (Preferred Areas)</h2>
      {matchingTrips.length === 0 ? (
        <p>No matching trips found.</p>
      ) : (
        matchingTrips.map((trip) => (
          <TripCard key={trip.TripID} trip={trip} />
        ))
      )}

      <h2 className="text-2xl font-bold mt-8 mb-4">📍 Nearby Trips</h2>
      {nearbyTrips.length === 0 ? (
        <p>No nearby trips found.</p>
      ) : (
        nearbyTrips.map((trip) => (
          <TripCard key={trip.TripID} trip={trip} />
        ))
      )}
    </div>
  );
};

const TripCard = ({ trip }) => {
  return (
    <div className="border p-4 rounded-xl shadow mb-4 bg-white">
      <p><strong>From:</strong> {trip.StartLocation}</p>
      <p><strong>To:</strong> {trip.Destination}</p>
      <p><strong>Departure:</strong> {new Date(trip.DepartureTime).toLocaleString()}</p>
      <p><strong>Status:</strong> {trip.Statuss}</p>
      <p><strong>Driver ID:</strong> {trip.DriverID}</p>
    </div>
  );
};

export default FeedPage;
