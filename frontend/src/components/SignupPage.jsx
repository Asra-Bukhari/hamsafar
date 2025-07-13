import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [areaOptions, setAreaOptions] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    gender: "",
    age: "",
    city: "",
    contact: "",
    emergencyContact: "",
    userStatus: "", // Added userStatus field
    currentArea: "",
    preference1: "",
    preference2: "",
    preference3: "",
  });

  const NAVY = "#2f2f4f";
  const LIGHT_BROWN = "#B5651D";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
      if (formData.email && formData.password && formData.confirmPassword) {
        setStep(2);
      } else {
        alert("Please fill all fields");
      }
    } else if (step === 2) {
      if (
        formData.name &&
        formData.gender &&
        formData.age &&
        formData.city &&
        formData.contact &&
        formData.emergencyContact
      ) {
        setStep(3);
      } else {
        alert("Please fill all fields");
      }
    } else {
      alert("Please fill all fields");
    }
  };

  const handleSubmit = () => {
    if (
      formData.currentArea &&
      formData.preference1 &&
      formData.preference2 &&
      formData.preference3 &&
      formData.userStatus
    ) {
      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        gender: formData.gender,
        age: parseInt(formData.age),
        city: formData.city,
        contact: formData.contact,
        emergencycontact: formData.emergencyContact,
        userstatus: formData.userStatus,
        currentarea: parseInt(formData.currentArea),
        preference1: parseInt(formData.preference1),
        preference2: parseInt(formData.preference2),
        preference3: parseInt(formData.preference3),
      };
  
      console.log("Sending data to the server:", userData);
  
      fetch("http://localhost:5000/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Response from server:", data);
  
          if (data.success) {
            const userID = data.userID;
            if (formData.userStatus === "Non-Driver") {
              alert("Signup completed!");
              navigate("/login");
            } else if (formData.userStatus === "Driver") {
              if (userID) {
                alert("Signup completed! Proceeding to driver registration...");
                navigate("/register-driver", { state: { userID: userID } });
              } else {
                alert("User created, but user ID not received. Please try logging in.");
                navigate("/login");
              }
            }
          } else {
            alert("Error: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Error submitting form:", error);
          alert("There was an error signing up. Please try again.");
        });
    } else {
      alert("Please select all area preferences and user status.");
    }
  };
  
  useEffect(() => {
    if (step === 3) {
      fetch("http://localhost:5000/areas/dropdown")
        .then((res) => res.json())
        .then((data) => setAreaOptions(data))
        .catch((err) => console.error("Error fetching areas:", err));
    }
  }, [step]);

  const containerStyle = {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: `30px solid ${NAVY}`,
    boxSizing: "border-box",
    position: "relative",
  };

  const formBoxStyle = {
    border: `3px solid ${NAVY}`,
    padding: "30px",
    borderRadius: "10px",
    backgroundColor: LIGHT_BROWN,
    width: "350px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: `0 0 10px ${NAVY}`,
    position: "relative",
    zIndex: 1,
  };

  const formBoxStyleStep2 = {
    ...formBoxStyle,
    width: "300px",
    padding: "20px",
    marginTop: "100px",
  };

  const logoStyle = {
    position: "absolute",
    top: "calc(50% - 230px)",
    borderRadius: "60%",
    height: "100px",
    width: "100px",
    objectFit: "cover",
    zIndex: 2,
    boxShadow: `0 0 8px ${NAVY}`,
  };

  const inputStyle = {
    backgroundColor: NAVY,
    color: "white",
    border: "1px solid white",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    width: "100%",
  };

  const buttonStyle = {
    backgroundColor: NAVY,
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    alignSelf: "flex-end",
    marginTop: "10px",
  };

  const linkStyle = {
    color: "#F7ECDA",
    marginTop: "15px",
    cursor: "pointer",
    textDecoration: "underline",
    fontWeight: "bold",
  };

  return (
    <div style={containerStyle}>
      <img src="/assets/logo.png" alt="Logo" style={logoStyle} />

      {step === 1 && (
        <div style={formBoxStyle}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            style={inputStyle}
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            style={inputStyle}
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            style={inputStyle}
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button style={buttonStyle} onClick={handleNext}>
            Next
          </button>
          <div style={linkStyle} onClick={() => navigate("/login")}>
            Already have an account? Login
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={formBoxStyleStep2}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            style={inputStyle}
            value={formData.name}
            onChange={handleChange}
          />
          <select
            name="gender"
            style={inputStyle}
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input
            type="number"
            name="age"
            placeholder="Age"
            style={inputStyle}
            value={formData.age}
            onChange={handleChange}
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            style={inputStyle}
            value={formData.city}
            onChange={handleChange}
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact"
            style={inputStyle}
            value={formData.contact}
            onChange={handleChange}
          />
          <input
            type="text"
            name="emergencyContact"
            placeholder="Emergency Contact"
            style={inputStyle}
            value={formData.emergencyContact}
            onChange={handleChange}
          />
          <button style={buttonStyle} onClick={handleNext}>
            Next
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={formBoxStyleStep2}>
          <select
            name="userStatus"
            style={inputStyle}
            value={formData.userStatus}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select Status
            </option>
            <option value="Driver">Driver</option>
            <option value="Non-Driver">Non-Driver</option>
          </select>

          <select
            name="currentArea"
            style={inputStyle}
            value={formData.currentArea}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select Current Area
            </option>
            {areaOptions.map((area, idx) => (
              <option key={idx} value={area.AreaCode}>
                {area.City}, {area.Town}, {area.Place}
              </option>
            ))}
          </select>

          <select
            name="preference1"
            style={inputStyle}
            value={formData.preference1}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select Preference 1
            </option>
            {areaOptions.map((area, idx) => (
              <option key={idx} value={area.AreaCode}>
                {area.City}, {area.Town}, {area.Place}
              </option>
            ))}
          </select>

          <select
            name="preference2"
            style={inputStyle}
            value={formData.preference2}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select Preference 2
            </option>
            {areaOptions.map((area, idx) => (
              <option key={idx} value={area.AreaCode}>
                {area.City}, {area.Town}, {area.Place}
              </option>
            ))}
          </select>

          <select
            name="preference3"
            style={inputStyle}
            value={formData.preference3}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select Preference 3
            </option>
            {areaOptions.map((area, idx) => (
              <option key={idx} value={area.AreaCode}>
                {area.City}, {area.Town}, {area.Place}
              </option>
            ))}
          </select>

          <button style={buttonStyle} onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
