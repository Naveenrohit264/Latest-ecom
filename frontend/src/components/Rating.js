import React, { useState, useContext, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./Rating.module.css";

const StarRating = ({ rating, onRatingChange }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  const handleMouseEnter = (star) => {
    setHoveredRating(star);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          className={styles.star}
          style={{
            color: star <= (hoveredRating || rating) ? "gold" : "gray",
            cursor: "pointer",
          }}
        >
          &#9733; {/* Unicode character for a star */}
        </span>
      ))}
      {hoveredRating > 0 && (
        <div
          className={styles.tooltip}
          style={{
            position: "absolute",
            top: "-30px",
            left: `${(hoveredRating - 1) * 20}px`, // Adjusts the tooltip position based on the hovered star
          }}
        >
          {getHoveredText(hoveredRating)}
        </div>
      )}
    </div>
  );
};

const getHoveredText = (star) => {
  switch (star) {
    case 1:
      return "Very Bad";
    case 2:
      return "Bad";
    case 3:
      return "Good";
    case 4:
      return "Very Good";
    case 5:
      return "Excellent";
    default:
      return "";
  }
};

function Rating() {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const { currentUser } = useContext(AuthContext);
  const [existingRating, setExistingRating] = useState(null);
  const [orderExists, setOrderExists] = useState(false);
  const [showGif, setShowGif] = useState(false); // State for showing GIF

  useEffect(() => {
    const fetchExistingRating = async () => {
      try {
        const userId = currentUser?.id;

        if (userId && id) {
          const response = await axios.get(
            `http://localhost:8800/rating/${id}/${userId}`
          );
          setExistingRating(response.data.rating);
        }
      } catch (error) {
        console.error("Error fetching existing rating:", error);
      }
    };

    const checkOrderExists = async () => {
      try {
        const userId = currentUser?.id;

        if (userId && id) {
          const response = await axios.get(
            `http://localhost:8800/orders/${userId}/${id}`
          );
          setOrderExists(true);
        }
      } catch (error) {
        console.error("Error checking order existence:", error);
      }
    };

    fetchExistingRating();
    checkOrderExists();
  }, [currentUser, id]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleReviewChange = (event) => {
    setReview(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      const userId = currentUser?.id;

      if (!orderExists) {
        // User has not ordered the product
        toast.error("Error: User has not ordered the product.");
        return;
      }

      if (existingRating !== null) {
        // User has already submitted a rating for this product
        toast.error("Error: Rating already exists for this product and user.");
        return;
      }

      if (id && userId) {
        // User hasn't submitted a rating and has ordered the product, proceed to submit
        const response = await axios.post("http://localhost:8800/rating", {
          productId: id,
          userId,
          review,
          rating,
        });

        console.log("Review submitted successfully:", response.data);

        // Show GIF for 5 seconds
        setShowGif(true);
        setTimeout(() => {
          setShowGif(false);
          // Redirect to the orders page
          window.location.href = "/orders";
        }, 5000);
      } else {
        console.error("Product ID or User ID is null or undefined.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  return (
    <div>
      <Link to="/" style={{ display: "inline-block", marginLeft: "3%" }}>
        <img
          src="/flybuy.png"
          alt="Logo"
          style={{ width: "120px", height: "60px" }}
        />{" "}
        {/* Logo */}
      </Link>

      <h2 className={styles.heading} style={{ textAlign: "center" }}>
        Rate and Review
      </h2>
      <ToastContainer />
      <div className={styles.container}>
        {orderExists ? (
          <div className={styles.ratingWrapper}>
            <div>
              <label
                htmlFor="rating"
                className={styles.reviewLabel}
                style={{ marginLeft: "30%", fontWeight: "bold" }}
              >
                Rating{" "}
              </label>
              <StarRating
                rating={rating}
                onRatingChange={handleRatingChange}
               
              />
            </div>
          </div>
        ) : (
          <p>You need to order this product before rating it.</p>
        )}
        <div className={styles.reviewWrapper}>
          <label className={styles.reviewLabel} style={{ fontWeight: "bold" }}>
            Review:
          </label>
          <textarea
            className={styles.textarea}
            rows="4"
            cols="50"
            value={review}
            onChange={handleReviewChange}
          ></textarea>
        </div>
        <button className={styles.submitButton} onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default Rating;
