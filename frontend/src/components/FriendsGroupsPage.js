import React, { useEffect, useState } from "react";
import axios from "axios";

const GroupTripsPage = ({ passengerID }) => {
  const [trips, setTrips] = useState([]);
  const [groupNo, setGroupNo] = useState("");
  const [friendID, setFriendID] = useState("");
  const [message, setMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [groups, setGroups] = useState([
    { id: 1, name: "NUCES Carpool", members: [2, 3, 4] },
    { id: 2, name: "Office Carpool", members: [5, 6] },
  ]);
  const [joinRequests, setJoinRequests] = useState([
    { id: 101, name: "Ali Khan", groupId: 1 },
  ]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/triprequests/passenger/${passengerID}`)
      .then((res) => setTrips(res.data))
      .catch((err) => console.error("Fetch error:", err));
  }, [passengerID]);

  const respondToTrip = (requestID, response) => {
    axios
      .patch(`http://localhost:5000/triprequests/respond/${requestID}`, {
        response,
      })
      .then(() => {
        setTrips((prev) =>
          prev.map((t) =>
            t.RequestID === requestID ? { ...t, Statuss: response } : t
          )
        );
      })
      .catch((err) => console.error("Response error:", err));
  };

  const handleAddFriend = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/friendsgroup/${groupNo}/add`,
        { friendID: parseInt(friendID) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Friend added successfully.");
    } catch {
      setMessage("❌ Failed to add friend.");
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/friendsgroup/${groupNo}/remove`,
        { friendID: parseInt(friendID) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Friend removed successfully.");
    } catch {
      setMessage("❌ Failed to remove friend.");
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/friendsgroup`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const group = res.data.find((g) => g.GroupNo === parseInt(groupNo));
      if (!group) return setMessage("❌ Group not found");

      const memberIDs = group.OtherMembers
        ? group.OtherMembers.split(",").map((id) => parseInt(id.trim()))
        : [];
      memberIDs.unshift(group.groupAdmin);
      setMembers(memberIDs);
      setShowMembers(true);
    } catch (err) {
      setMessage("❌ Could not load group members.");
      console.error(err);
    }
  };

  const deleteGroup = (id) => {
    setGroups(groups.filter((g) => g.id !== id));
  };

  const createGroup = () => {
    const newId = Math.max(...groups.map((g) => g.id)) + 1;
    setGroups([...groups, { id: newId, name: `New Group ${newId}`, members: [] }]);
  };

  const acceptJoinRequest = (requestId) => {
    setJoinRequests(joinRequests.filter((r) => r.id !== requestId));
  };

  const rejectJoinRequest = (requestId) => {
    setJoinRequests(joinRequests.filter((r) => r.id !== requestId));
  };

  const styles = {
    pageWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      minHeight: "100vh",
      background: "beige",
      padding: "20px",
    },
    container: {
      width: "100%",
      maxWidth: "900px",
      background: "rgba(255, 255, 255, 0.9)",
      borderRadius: "16px",
      padding: "30px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    },
    groupCard: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px",
      background: "#f9fafb",
      borderRadius: "8px",
      marginBottom: "10px",
    },
    trashBtn: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: "#ef4444",
      fontSize: "18px",
    },
    joinCard: {
      background: "#fff7ed",
      padding: "10px",
      borderRadius: "8px",
      marginBottom: "10px",
      border: "1px solid #fbbf24",
    },
    button: {
      padding: "6px 10px",
      marginLeft: "5px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h2>👥 Your Groups</h2>

        {groups.map((group) => (
          <div key={group.id} style={styles.groupCard}>
            <span>{group.name} ({group.members.length} members)</span>
            <button style={styles.trashBtn} onClick={() => deleteGroup(group.id)}>🗑️</button>
          </div>
        ))}

        <button style={{ ...styles.button, background: "#3b82f6", color: "white" }} onClick={createGroup}>
          ➕ Create New Group
        </button>

        <h3 style={{ marginTop: "20px" }}>📩 Join Requests</h3>
        {joinRequests.map((req) => (
          <div key={req.id} style={styles.joinCard}>
            <span>{req.name} wants to join group NUCES Carpool</span>
            <div>
              <button style={{ ...styles.button, background: "#10b981", color: "white" }} onClick={() => acceptJoinRequest(req.id)}>Accept</button>
              <button style={{ ...styles.button, background: "#ef4444", color: "white" }} onClick={() => rejectJoinRequest(req.id)}>Reject</button>
            </div>
          </div>
        ))}

        <hr style={{ margin: "20px 0" }} />

        <h2>🚗 Your Group Trips</h2>
        {trips.length === 0 ? (
          <p>No trips yet.</p>
        ) : (
          trips.map((trip) => (
            <div key={trip.RequestID} style={{ marginBottom: "15px", background: "#f9fafb", padding: "10px", borderRadius: "8px" }}>
              <p>Pickup: {trip.PickupLocation}</p>
              <p>Dropoff: {trip.DropoffLocation}</p>
              <p>Date: {new Date(trip.TripDateTime).toLocaleString()}</p>
              <p>Status: {trip.Statuss}</p>
              {trip.Statuss === "Pending" && (
                <>
                  <button style={{ ...styles.button, background: "#10b981", color: "white" }} onClick={() => respondToTrip(trip.RequestID, "Accepted")}>Accept</button>
                  <button style={{ ...styles.button, background: "#ef4444", color: "white" }} onClick={() => respondToTrip(trip.RequestID, "Declined")}>Decline</button>
                </>
              )}
            </div>
          ))
        )}

        <hr style={{ margin: "20px 0" }} />

        <h3>Manage Friends in Group</h3>
        <input type="number" placeholder="Group No" value={groupNo} onChange={(e) => setGroupNo(e.target.value)} />
        <input type="number" placeholder="Friend Name" value={friendID} onChange={(e) => setFriendID(e.target.value)} />
        <button style={{ ...styles.button, background: "#3b82f6", color: "white" }} onClick={handleAddFriend}>Add Friend</button>
        <button style={{ ...styles.button, background: "#ef4444", color: "white" }} onClick={handleRemoveFriend}>Remove Friend</button>
        <button style={{ ...styles.button, background: "#6366f1", color: "white" }} onClick={fetchGroupMembers}>View Members</button>

        {showMembers && (
          <ul>
            {members.map((id, index) => (
              <li key={index}>👤 User ID: {id}</li>
            ))}
          </ul>
        )}

        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default GroupTripsPage;
