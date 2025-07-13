import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory

const TripInfo = () => {
  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [tripStatus, setTripStatus] = useState(''); // To track the trip's status
  const navigate = useNavigate(); // Initialize navigate

  const tripID = localStorage.getItem("tripID");

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const tripRes = await axios.get(`http://localhost:5000/api/trip/${tripID}`);
        setTrip(tripRes.data.trip);
        setMembers(tripRes.data.members);
        setAvailableSeats(tripRes.data.availableSeats);
        setTotalEarned(tripRes.data.totalEarned);
        setTripStatus(tripRes.data.Statuss); // Set the trip status

        const pendingRes = await axios.get(`http://localhost:5000/api/trip/${tripID}/pending-requests`);
        setPendingRequests(pendingRes.data);
      } catch (error) {
        console.error("Failed to fetch trip info:", error);
      }
    };

    fetchTripData();
  }, [tripID]);

  const handleRequestAction = async (joinRequestID, action) => {
    try {
      await axios.put(`http://localhost:5000/api/join-request/${joinRequestID}/${action}`);
      setPendingRequests(pendingRequests.filter(req => req.JoinRequestID !== joinRequestID));
    } catch (error) {
      console.error(`Failed to ${action} join request:`, error);
    }
  };

  const handleStartTrip = async () => {
    try {
      await axios.patch(`http://localhost:5000/scheduledtrips/${tripID}`, { "statuss":"Ongoing" });
      setTripStatus('Ongoing'); // Update trip status locally
    } catch (error) {
      console.error("Failed to start trip:", error);
    }
  };

  const handleCompleteTrip = async () => {
    try {
      await axios.patch(`http://localhost:5000/scheduledtrips/${tripID}`, { 'Statuss':'Completed' });
      setTripStatus('Completed'); // Update trip status locally
    } catch (error) {
      console.error("Failed to complete trip:", error);
    }
  };

  const handlePaymentDone = async () => {
    try {
      await axios.put(`http://localhost:5000/api/trip/${tripID}/payment-done`);
      setTripStatus('Payment Done'); // Update trip status to Payment Done
    } catch (error) {
      console.error("Failed to mark payment as done:", error);
    }
  };

  const handleGoBack = () => {
    navigate("/home"); // Go back to the previous page
  };

  if (!trip) return <div>Loading Trip Information...</div>;

  return (
    <div style={{ padding: "30px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ color: "#2c3e50" }}>Trip Information</h1>

      <div style={{ marginBottom: "20px", padding: "20px", backgroundColor: "#fdf6ef", borderRadius: "15px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <h2>Details</h2>
        <p><strong>From:</strong> {trip.StartCity}, {trip.StartTown}, {trip.StartPlace}</p>
        <p><strong>To:</strong> {trip.DestCity}, {trip.DestTown}, {trip.DestPlace}</p>
        <p><strong>Departure:</strong> {new Date(trip.DepartureTime).toLocaleString()}</p>
        <p><strong>Status:</strong> {tripStatus}</p>
        <p><strong>Available Seats:</strong> {availableSeats}</p>
        <p><strong>Total Earned:</strong> Rs. {totalEarned}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Members</h2>
        {members.length === 0 ? <p>No passengers yet.</p> : (
          <ul>
            {members.map((member) => (
              <li key={member.UserID}>{member.Name}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2>Pending Join Requests</h2>
        {pendingRequests.length === 0 ? <p>No pending requests.</p> : (
          pendingRequests.map((req) => (
            <div key={req.JoinRequestID} style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "10px" }}>
              <p><strong>{req.Name}</strong> wants to join.</p>
              <button onClick={() => handleRequestAction(req.JoinRequestID, 'accept')} style={{ marginRight: "10px", backgroundColor: "green", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>
                Accept
              </button>
              <button onClick={() => handleRequestAction(req.JoinRequestID, 'reject')} style={{ backgroundColor: "red", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>
                Reject
              </button>
            </div>
          ))
        )}
      </div>

      <div>
        {tripStatus === 'Ongoing' ? (
          <button onClick={handleCompleteTrip} style={{ backgroundColor: "orange", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}>
            Trip Completed
          </button>
        ) : tripStatus === 'Completed' ? (
          <div>
            <button onClick={handlePaymentDone} style={{ backgroundColor: "green", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}>
              Payment Done
            </button>
            <button onClick={handleGoBack} style={{ marginLeft: "10px", backgroundColor: "gray", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}>
              Go Back
            </button>
          </div>
        ) : (
          <button onClick={handleStartTrip} style={{ backgroundColor: "blue", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}>
            Start Trip
          </button>
        )}
      </div>
    </div>
  );
};

export default TripInfo;
