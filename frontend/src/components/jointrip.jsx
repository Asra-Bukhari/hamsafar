import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYXNyYWJ1a2hhcmkiLCJhIjoiY204aXk0enoyMDhlZzJpcjR2ODNvZm51NyJ9.aOF8rIy52nwgEhRnGzmvsw";

const JoinTrip = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [coordinates, setCoordinates] = useState({ start: null, destination: null });
  const [areaInfo, setAreaInfo] = useState({ start: {}, destination: {} });
  const [loading, setLoading] = useState(true);
  const [nearbyTrips, setNearbyTrips] = useState([]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      const startAreaCode = localStorage.getItem("startAreaCode");
      const destinationAreaCode = localStorage.getItem("destinationAreaCode");

      try {
        const [startRes, destRes, startInfo, destInfo] = await Promise.all([
          axios.get(`http://localhost:5000/areas/coordinates/${startAreaCode}`),
          axios.get(`http://localhost:5000/areas/coordinates/${destinationAreaCode}`),
          axios.get(`http://localhost:5000/areas/${startAreaCode}`),
          axios.get(`http://localhost:5000/areas/${destinationAreaCode}`),
        ]);

        setCoordinates({
          start: [startRes.data.longitude, startRes.data.latitude],
          destination: [destRes.data.longitude, destRes.data.latitude],
        });

        setAreaInfo({
          start: startInfo.data,
          destination: destInfo.data,
        });

        setTimeout(() => {
          setLoading(false);
        }, 2000);

        const response = await axios.get(
          `http://localhost:5000/triprequests/nearby-trips?latitude=${startRes.data.latitude}&longitude=${startRes.data.longitude}`
        );
        setNearbyTrips(response.data);
      } catch (error) {
        console.error("Error fetching coordinates or area info:", error);
      }
    };

    fetchCoordinates();
  }, []);

  useEffect(() => {
    if (!coordinates.start || !coordinates.destination) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: coordinates.start,
      zoom: 12,
    });

    map.current.on("load", () => {
      new mapboxgl.Marker({ color: "#003366" })
        .setLngLat(coordinates.start)
        .setPopup(new mapboxgl.Popup().setHTML("<strong>Start Location</strong>"))
        .addTo(map.current);

      new mapboxgl.Marker({ color: "#b91c1c" })
        .setLngLat(coordinates.destination)
        .setPopup(new mapboxgl.Popup().setHTML("<strong>Destination</strong>"))
        .addTo(map.current);

      const center = turf.point(coordinates.start);
      let radius = 4;
      let options = { steps: 64, units: "kilometers" };
      let circle = turf.circle(center, radius, options);

      map.current.addSource("circle", {
        type: "geojson",
        data: circle,
      });

      map.current.addLayer({
        id: "circle-fill",
        type: "fill",
        source: "circle",
        paint: {
          "fill-color": "#0c4a6e",
          "fill-opacity": 0.2,
        },
      });

      map.current.addLayer({
        id: "circle-outline",
        type: "line",
        source: "circle",
        paint: {
          "line-color": "#fbbf24",
          "line-width": 3,
        },
      });

      const route = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [coordinates.start, coordinates.destination],
        },
      };

      map.current.addSource("route", {
        type: "geojson",
        data: route,
      });

      map.current.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#003366",
          "line-width": 6,
          "line-opacity": 0.8,
        },
      });

      let opacity = 0.2;
      let increasing = true;

      const animateCircle = () => {
        if (!map.current.getLayer("circle-fill")) return;
        opacity += increasing ? 0.01 : -0.01;
        if (opacity >= 0.4) increasing = false;
        if (opacity <= 0.2) increasing = true;

        map.current.setPaintProperty("circle-fill", "fill-opacity", opacity);
        requestAnimationFrame(animateCircle);
      };

      animateCircle();
    });
  }, [coordinates]);

  const handleJoinClick = async (tripID) => {
    const passengerID = localStorage.getItem("userID");
  
    if (!passengerID) {
      alert("User not logged in!");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/joinrequests", {
        tripRequestID: tripID,
        passengerID: parseInt(passengerID),
      });
  
      if (response.status === 201) {
        alert(`✅ Request to join trip ID ${tripID} has been submitted and is now pending approval!`);
      }
    } catch (error) {
      console.error("Error sending join request:", error);
      alert("❌ Failed to send join request. Please try again later.");
    }
  };
  
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div ref={mapContainer} style={{ flex: 2 }} />
      <div
        style={{
          flex: 1,
          padding: "30px",
          backgroundColor: "#f5f5dc",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderLeft: "5px solid #003366",
        }}
      >
        {loading ? (
          <h2 style={{ color: "#003366", fontSize: "18px" }}>
            Please wait while we scan your area...
          </h2>
        ) : (
          <div style={{ marginTop: "10px" }}>
            <div style={{ marginBottom: "10px" }}>
              <p><strong>Start Location:</strong> {areaInfo.start.City}, {areaInfo.start.Town}</p>
              <p><strong>Destination Location:</strong> {areaInfo.destination.City}, {areaInfo.destination.Town}</p>
            </div>

            <h3 style={{ color: "#003366" }}>Nearby Trips:</h3>
            {nearbyTrips.length > 0 ? (
  nearbyTrips.map((trip) => (
    <div
      key={trip.TripID}
      style={{
        backgroundColor: "#e2e8f0",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "5px",
        width: "100%",
      }}
    >
      <p><strong>Driver:</strong> {trip.DriverName}</p>
      <p><strong>Pickup Location:</strong> {trip.PickupTown}, {trip.PickupCity}</p>
      <p><strong>Trip Date:</strong> {new Date(trip.DepartureTime).toLocaleString()}</p>
      <button
        onClick={() => handleJoinClick(trip.TripID)}
        style={{
          backgroundColor: "#003366",
          color: "white",
          border: "none",
          padding: "10px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Join Trip
      </button>
    </div>
  ))
) : (
  <p style={{ color: "#003366" }}>No nearby trips found.</p>
)}

          </div>
        )}
      </div>
    </div>
  );
};

export default JoinTrip;
