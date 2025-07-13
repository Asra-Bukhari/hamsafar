import React, { useEffect, useRef, useState } from "react";
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from "mapbox-gl";
import axios from "axios";

mapboxgl.accessToken = 'pk.eyJ1IjoiYXNyYWJ1a2hhcmkiLCJhIjoiY204aXk0enoyMDhlZzJpcjR2ODNvZm51NyJ9.aOF8rIy52nwgEhRnGzmvsw';

const ScheduleTrip = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [coordinates, setCoordinates] = useState({ start: null, destination: null });
  const [areaInfo, setAreaInfo] = useState({ start: {}, destination: {} });
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    const fetchCoordinates = async () => {
      const startAreaCode = localStorage.getItem("startAreaCode");
      const destinationAreaCode = localStorage.getItem("destinationAreaCode");

      try {
        const [startRes, destRes, startInfo, destInfo] = await Promise.all([
          axios.get(`http://localhost:5000/areas/coordinates/${startAreaCode}`),
          axios.get(`http://localhost:5000/areas/coordinates/${destinationAreaCode}`),
          axios.get(`http://localhost:5000/areas/${startAreaCode}`),
          axios.get(`http://localhost:5000/areas/${destinationAreaCode}`)
        ]);

        setCoordinates({
          start: [startRes.data.longitude, startRes.data.latitude],
          destination: [destRes.data.longitude, destRes.data.latitude],
        });

        setAreaInfo({
          start: startInfo.data,
          destination: destInfo.data
        });
      } catch (error) {
        console.error("Failed to fetch coordinates or area info:", error);
      }
    };

    fetchCoordinates();
  }, []);

  useEffect(() => {
    if (!coordinates.start || !coordinates.destination) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: coordinates.start,
      zoom: 12,
    });

    map.current.on('load', () => {
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [coordinates.start, coordinates.destination],
          },
        },
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#3b82f6', 'line-width': 5 },
      });

      new mapboxgl.Marker({ color: 'green' })
        .setLngLat(coordinates.start)
        .setPopup(new mapboxgl.Popup().setText("Start Location"))
        .addTo(map.current);

      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(coordinates.destination)
        .setPopup(new mapboxgl.Popup().setText("Destination"))
        .addTo(map.current);
    });
  }, [coordinates]);

  const handleConfirmTrip = async () => {
    const DriverID = localStorage.getItem("userID");
    const startAreaCode = localStorage.getItem("startAreaCode");
    const destinationAreaCode = localStorage.getItem("destinationAreaCode");
    const fare = localStorage.getItem("fare"); // Assuming you stored the fare earlier
  
    console.log("DriverID:", DriverID);
    console.log("StartAreaCode:", startAreaCode);
    console.log("DestinationAreaCode:", destinationAreaCode);
    console.log("Fare:", fare);
  
    try {
      // 1. First, schedule the trip
      const tripResponse = await axios.post("http://localhost:5000/scheduledtrips/schedule-a-trip", {
        DriverID: DriverID,
        StartLocation: startAreaCode,
        Destination: destinationAreaCode,
        DepartureTime: `${departureDate}T${departureTime}`,
      });
  
      const tripID = tripResponse.data.tripID; // Assuming backend sends back the TripID
  
      console.log("Scheduled TripID:", tripID);
  
      if (tripID) {
        // 2. Insert into Payments
        await axios.post("http://localhost:5000/payments/create-payment", {
          TripID: tripID,
          EarnedAmount: parseInt(fare),
          Statuss: "Unpaid",
        });
      } else {
        console.error("No TripID returned from trip scheduling.");
      }
  
      setConfirmationMessage(
        `🚗 Trip from ${areaInfo.start.City}, ${areaInfo.start.Town} (${areaInfo.start.Place}) to ${areaInfo.destination.City}, ${areaInfo.destination.Town} (${areaInfo.destination.Place}) is scheduled for ${departureTime}. We'll notify you when anyone requests to join.`
      );
    } catch (error) {
      console.error("Failed to schedule trip or create payment:", error);
    }
  };
  

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", fontFamily: "Segoe UI, sans-serif" }}>
      <div ref={mapContainer} style={{ flex: 2 }} />
      <div
        style={{
          flex: 1,
          padding: "30px",
          backgroundColor: "#fdf6ef",
          borderLeft: "4px solid #2c3e50",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "25px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            border: "2px solid #b08968",
          }}
        >
          <h2 style={{ color: "#2c3e50", marginBottom: "15px" }}>🚙 Trip Details</h2>
          <p><strong style={{ color: "#6b4c3b" }}>Start:</strong> {areaInfo.start.City}, {areaInfo.start.Town}, {areaInfo.start.Place}</p>
          <p><strong style={{ color: "#6b4c3b" }}>Destination:</strong> {areaInfo.destination.City}, {areaInfo.destination.Town}, {areaInfo.destination.Place}</p>

          <div style={{ marginTop: "15px" }}>
            <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Departure Date:</label><br />
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "10px",
                border: "1px solid #ccc"
              }}
            />
            <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Departure Time:</label><br />
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "20px",
                borderRadius: "10px",
                border: "1px solid #ccc"
              }}
            />
          </div>

          <button
            onClick={handleConfirmTrip}
            style={{
              backgroundColor: "#2c3e50",
              color: "#fff",
              padding: "12px 20px",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
              width: "100%",
              transition: "background-color 0.3s ease"
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#3f5772")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#2c3e50")}
          >
            Confirm Trip
          </button>

          {confirmationMessage && (
            <div
              style={{
                marginTop: "25px",
                padding: "15px",
                backgroundColor: "#e6ffed",
                border: "1px solid #34a853",
                borderRadius: "12px",
                color: "#2c662d",
                fontWeight: "500",
                lineHeight: "1.4"
              }}
            >
              {confirmationMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleTrip;
