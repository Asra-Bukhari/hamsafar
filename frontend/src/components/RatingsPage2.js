import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const RatingsPage = () => {
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { tripID, driverID } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        const passengerID = parseInt(localStorage.getItem("userId"));

        if (!token || !tripID || !driverID || !passengerID) {
            alert("Missing rating data or authentication.");
            return;
        }

        try {
            setLoading(true);
            await axios.post(
                "http://localhost:5000/ratings",
                {
                    tripid: parseInt(tripID),
                    driverid: parseInt(driverID),
                    passengerid: passengerID,
                    rating: Number(rating),
                    review,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("✅ Rating submitted successfully!");
            navigate("/my-profile");
        } catch (err) {
            console.error("❌ Error submitting rating:", err);
            alert("Failed to submit rating.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: "600px",
                margin: "2rem auto",
                padding: "1.5rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: "#fff",
            }}
        >
            <h2 style={{ marginBottom: "1rem", fontWeight: "bold", fontSize: "24px" }}>Rate Your Trip</h2>
            <form onSubmit={handleSubmit}>
                <label style={{ fontWeight: "500" }}>Rating (1-5)</label>
                <input
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    required
                    style={{ width: "100%", padding: "8px", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
                />

                <label style={{ fontWeight: "500" }}>Review (optional)</label>
                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    style={{ width: "100%", padding: "8px", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "600",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? "Submitting..." : "Submit Rating"}
                </button>
            </form>
        </div>
    );
};

export default RatingsPage;
