import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GroupTripsPage = ({ passengerID }) => {
  const [trips, setTrips] = useState([]);
  const [groupNo, setGroupNo] = useState('');
  const [friendID, setFriendID] = useState('');
  const [message, setMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/triprequests/passenger/${passengerID}`)
      .then(res => setTrips(res.data))
      .catch(err => console.error("Fetch error:", err));
  }, [passengerID]);

  const respondToTrip = (requestID, response) => {
    axios.patch(`http://localhost:5000/triprequests/respond/${requestID}`, { response })
      .then(() => {
        setTrips(prev =>
          prev.map(t =>
            t.RequestID === requestID ? { ...t, Statuss: response } : t
          )
        );
      })
      .catch(err => console.error("Response error:", err));
  };

  const handleAddFriend = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/friendsgroup/${groupNo}/add`,
        { friendID: parseInt(friendID) },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage("✅ Friend added successfully.");
    } catch (err) {
      setMessage("❌ Failed to add friend.");
    }
  };
  
  const handleRemoveFriend = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/friendsgroup/${groupNo}/remove`,
        { friendID: parseInt(friendID) },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage("✅ Friend removed successfully.");
    } catch (err) {
      setMessage("❌ Failed to remove friend.");
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/friendsgroup`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const group = res.data.find(g => g.GroupNo === parseInt(groupNo));
      if (!group) return setMessage("❌ Group not found");
  
      const memberIDs = group.OtherMembers ? group.OtherMembers.split(',').map(id => parseInt(id.trim())) : [];
      memberIDs.unshift(group.groupAdmin); // show admin too
      setMembers(memberIDs);
      setShowMembers(true);
    } catch (err) {
      setMessage("❌ Could not load group members.");
      console.error(err);
    }
  };
  

  const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    heading: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' },
    card: {
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '15px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    label: { fontWeight: 'bold' },
    status: { fontStyle: 'italic', marginTop: '5px' },
    buttons: { marginTop: '10px', display: 'flex', gap: '10px' },
    acceptBtn: {
      padding: '6px 12px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    },
    declineBtn: {
      padding: '6px 12px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    },
    groupActions: {
      marginTop: '40px',
      padding: '15px',
      border: '1px solid #999',
      borderRadius: '8px',
      maxWidth: '400px'
    },
    input: {
      padding: '6px',
      marginRight: '10px',
      marginTop: '8px',
      width: '150px'
    },
    actionBtn: {
      padding: '6px 12px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginRight: '8px',
      marginTop: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Your Group Trips</h2>
      {trips.length === 0 ? (
        <p>No trips yet.</p>
      ) : (
        trips.map(trip => (
          <div key={trip.RequestID} style={styles.card}>
            <p><span style={styles.label}>Pickup:</span> {trip.PickupLocation}</p>
            <p><span style={styles.label}>Dropoff:</span> {trip.DropoffLocation}</p>
            <p><span style={styles.label}>Date:</span> {new Date(trip.TripDateTime).toLocaleString()}</p>
            <p style={styles.status}><span style={styles.label}>Status:</span> {trip.Statuss}</p>

            {trip.Statuss === 'Pending' && (
              <div style={styles.buttons}>
                <button style={styles.acceptBtn} onClick={() => respondToTrip(trip.RequestID, 'Accepted')}>Accept</button>
                <button style={styles.declineBtn} onClick={() => respondToTrip(trip.RequestID, 'Declined')}>Decline</button>
              </div>
            )}
          </div>
        ))
      )}

      {/* Group Friend Management Section */}
      <div style={styles.groupActions}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Manage Friends in Group</h3>
        <input type="number" placeholder="Group No" value={groupNo} onChange={e => setGroupNo(e.target.value)} style={styles.input} />
        <input type="number" placeholder="Friend ID" value={friendID} onChange={e => setFriendID(e.target.value)} style={styles.input} />
        <div>
          <button onClick={handleAddFriend} style={styles.actionBtn}>Add Friend</button>
          <button onClick={handleRemoveFriend} style={{ ...styles.actionBtn, backgroundColor: '#dc3545' }}>Remove Friend</button>
          <button onClick={fetchGroupMembers} style={styles.actionBtn}>View Members</button>
        </div>
        {showMembers && (
          <div style={{ marginTop: '10px' }}>
            <p><strong>Members in Group #{groupNo}:</strong></p>
            <ul>
              {members.map((id, index) => (
                <li key={index} style={{ marginLeft: '10px' }}>👤 User ID: {id}</li>
              ))}
            </ul>
          </div>
        )}
        {message && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
      </div>
    </div>
  );
};

export default GroupTripsPage;
