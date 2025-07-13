import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DriverRegistration = () => {
  const { state } = useLocation();
  const userID = state?.userID;
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState({
    name: '',
    color: '',
    company: '',
    typee: '',
    capacity: ''
  });

  const [driver, setDriver] = useState({
    driverStatus: '',
    availability: ''
  });

  const handleVehicleChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };

  const handleDriverChange = (e) => {
    setDriver({ ...driver, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const vehicleRes = await axios.post('http://localhost:5000/vehicles/', vehicle);

      if (vehicleRes.status === 201) {
        const vehicleID = vehicleRes.data.vehicleID;

        const driverPayload = {
          driverID: userID,
          vehicleID: vehicleID,
          driverStatus: driver.driverStatus,
          availability: driver.availability
        };

        const driverRes = await axios.post('http://localhost:5000/drivers/', driverPayload);

        if (driverRes.status === 201) {
          alert("Driver registered successfully!");
          navigate('/login');
        } else {
          alert("Failed to register driver.");
        }
      }
    } catch (error) {
      console.error("Driver registration error:", error);
      alert("Registration failed: " + (error.response?.data?.message || error.message));
    }
  };

  const outerContainerStyle = {
    border: '20px solid #2f2f4f',
    padding: '30px 10px',
    minHeight: '100vh',
    boxSizing: 'border-box'
  };

  const containerStyle = {
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    color: '#2f2f4f',
    boxShadow: `0 0 10px ${"#2f2f4f"}`,
  };

  const sectionStyle = {
    backgroundColor: '#B5651D',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
    color: 'white'
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '10px'
  };

  const inputStyle = {
    flex: 1,
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px'
  };

  const labelStyle = {
    fontWeight: 'bold',
    fontSize: '13px',
    marginBottom: '4px',
    display: 'block'
  };

  const inputContainerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  };

  const buttonStyle = {
    backgroundColor: '#2f2f4f',
    color: 'white',
    padding: '10px 16px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px'
  };

  return (
    <div style={outerContainerStyle}>
      <form onSubmit={handleSubmit} style={containerStyle}>
        <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>
          We need to ask a few things more to register you as a driver
        </h3>

        <div style={sectionStyle}>
          <div style={rowStyle}>
            <div style={inputContainerStyle}>
              <label style={labelStyle}>Vehicle Name</label>
              <input name="name" placeholder="e.g., Corolla" onChange={handleVehicleChange} required style={inputStyle} />
            </div>
            <div style={inputContainerStyle}>
              <label style={labelStyle}>Color</label>
              <input name="color" placeholder="e.g., White" onChange={handleVehicleChange} required style={inputStyle} />
            </div>
          </div>

          <div style={rowStyle}>
            <div style={inputContainerStyle}>
              <label style={labelStyle}>Company</label>
              <input name="company" placeholder="e.g., Toyota" onChange={handleVehicleChange} required style={inputStyle} />
            </div>
            <div style={inputContainerStyle}>
              <label style={labelStyle}>Type</label>
              <select name="typee" onChange={handleVehicleChange} required style={inputStyle}>
                <option value="">Select</option>
                <option value="Mini">Mini</option>
                <option value="Luxury">Luxury</option>
                <option value="Comfort">Comfort</option>
                <option value="Rickshaw">Rickshaw</option>
                <option value="Bike">Bike</option>
              </select>
            </div>
          </div>

          <div style={rowStyle}>
            <div style={inputContainerStyle}>
              <label style={labelStyle}>Capacity</label>
              <input name="capacity" type="number" placeholder="e.g., 4" onChange={handleVehicleChange} required style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={rowStyle}>
            <div style={inputContainerStyle}>
              <label style={labelStyle}>Driver Status</label>
              <select name="driverStatus" onChange={handleDriverChange} required style={inputStyle}>
                <option value="">Select</option>
                <option value="Hired">Hired</option>
                <option value="Collaborator">Collaborator</option>
              </select>
            </div>
            <div style={inputContainerStyle}>
              <label style={labelStyle}>Availability</label>
              <select name="availability" onChange={handleDriverChange} required style={inputStyle}>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button type="submit" style={buttonStyle}>Complete Registration</button>
        </div>
      </form>
    </div>
  );
};

export default DriverRegistration;
