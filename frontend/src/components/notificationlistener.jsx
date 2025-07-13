import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const NotificationListener = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("new-notification", (notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    if (notification.message.includes("Click to rate")) {
      try {
        const response = await axios.get(
          `http://localhost:5000/scheduledtrips/driver/${notification.tripid}`
        );
        const driverID = response.data.driverID;

        if (driverID) {
          window.location.href = `/rate/${notification.tripid}/${driverID}`;
        } else {
          alert("Driver not found for this trip.");
        }
      } catch (err) {
        console.error("Error fetching driver:", err);
        alert("Failed to redirect to rating page.");
      }
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 1000 }}>
      {notifications.map((n, i) => (
        <div
          key={i}
          onClick={() => handleNotificationClick(n)}
          style={{
            marginBottom: "0.5rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#fef3c7",
            borderLeft: "4px solid #f59e0b",
            borderRadius: "6px",
            cursor: "pointer",
            width: "300px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
};

export default NotificationListener;
