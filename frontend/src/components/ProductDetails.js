import React, { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import styles from "./ProductDetails.module.css"; // Import CSS module
import { AuthContext } from "../context/authContext"; // Import AuthContext
import StarRating from "./StarRating";
import {
  faShoppingCart,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import Header from "./Header";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductDetails = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [product, setProduct] = useState({});
  const [isWishlist, setIsWishlist] = useState(false);
  const [alreadyInWishlist, setAlreadyInWishlist] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8800/product/${id}`);
        const data = await response.json();
        setProduct(data);
        checkIfInWishlist();
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await fetch(
          `http://localhost:8800/product/${id}`
        );
        const productData = await productResponse.json();
        setProduct(productData);

        const ratingResponse = await fetch(
          `http://localhost:8800/ratings/${id}`
        );
        const ratingData = await ratingResponse.json();

        const totalRatings = ratingData.length;
        const sumRatings = ratingData.reduce(
          (acc, rating) => acc + rating.rating,
          0
        );
        const avgRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        setAverageRating(avgRating);

        const reviewsResponse = await fetch(
          `http://localhost:8800/reviews/${id}`
        );
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchData();
  }, [id]);

  const addToCart = async (product) => {
    try {
      await axios.post("http://localhost:8800/addtocart", {
        productId: product.id,
        userId: currentUser.id,
        image_path: product.image_path,
        price: product.product_cost,
        quantity: 1,
        title: product.title,
        brand: product.brand,
      });
      toast.success("Product added to cart", {
        autoClose: 1000,
        position: toast.POSITION.TOP_CENTER,
      });
      window.location.reload()
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const buyToCart = async (product) => {
    try {
      await axios.post("http://localhost:8800/addtocart", {
        productId: product.id,
        userId: currentUser.id,
        image_path: product.image_path,
        price: product.product_cost,
        quantity: 1,
        title: product.title,
        brand: product.brand,
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const checkIfInWishlist = async () => {
    try {
      const response = await fetch(
        `http://localhost:8800/wishlist/${currentUser.id}`
      );
      const data = await response.json();
      const isInWishlist = data.some((item) => item.productId === id);
      setIsWishlist(isInWishlist);
      setAlreadyInWishlist(isInWishlist);
    } catch (error) {
      console.error("Error checking if product is in wishlist:", error);
    }
  };

  const addToWishlist = async () => {
    try {
      if (isWishlist) {
        return;
      }

      const addToWishlistResponse = await fetch(
        "http://localhost:8800/api/wishlist/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.id,
            productId: product.id,
            productTitle: product.title,
            productDescription: product.description,
            productCost: product.product_cost,
            imagePath: product.image_path,
          }),
        }
      );

      if (addToWishlistResponse.ok) {
        setIsWishlist(true);
        toast.success("Product added to wishlist", {
          autoClose: 1000,
          position: toast.POSITION.TOP_CENTER,
        });
        setAlreadyInWishlist(true);
      } else {
        console.error("Failed to add product to wishlist");
      }
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
    }
  };

  return (
    <div className={styles["product-details-container"]}>
      <Header />
      <div className={styles["image-container"]}>
        <img
          src={`http://localhost:8800/${product.image_path}`}
          alt={product.title}
        />
        <button
          className={`${styles["wishlist-icon"]} ${
            isWishlist ? styles["active"] : ""
          }`}
          onClick={addToWishlist}
          style={{background:"none"}}
        >
          <FontAwesomeIcon icon={faHeart}  />
        </button>
      </div>
      <div className={styles["product-details"]}>
        <h2>{product.title}</h2>
        <p style={{fontWeight:"bold",color:"#808080"}}>{product.description}</p>
        <div className={styles["rating"]}>
          <StarRating rating={averageRating || 0} />
          <span style={{fontWeight:"bold",color:"#808080"}}>{`Rating: ${averageRating || "N/A"} out of 5`}</span>
        </div>
        <p style={{fontWeight:"bold",color:"#808080"}}>Rs. {product.product_cost}</p>
        <div className={styles["action-buttons"]}>
          <button onClick={() => addToCart(product)} style={{fontWeight:"bold",backgroundColor:"#65becf"}}>
            <FontAwesomeIcon icon={faShoppingCart}   /> Add to Cart
          </button>
          <Link to="/cart">
            <button onClick={() => buyToCart(product)} style={{fontWeight:"bold",backgroundColor:"#65becf"}}>
              <FontAwesomeIcon icon={faCreditCard} /> Buy Now
            </button>
          </Link>
        </div>
        <div className={styles["delivery-info"]}>
          <p style={{fontWeight:"bold"}}>Free delivery in 2 Days</p>
          <div className={styles["reviews"]}>
            <h3>Customer Reviews</h3>
            <div className={styles["separator"]}></div>
            {reviews.map((review) => (
              <div key={review.id} className={styles["review-item"]}>
                <p style={{fontWeight:"bold"}}>{review.review}</p>
                <StarRating rating={review.rating} />
                <p style={{fontWeight:"bold"}}>{review.username}</p> {/* Display username */}
                <div className={styles["separator"]}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProductDetails;