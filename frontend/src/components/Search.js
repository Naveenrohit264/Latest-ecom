import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styles from "./Search.module.css";
import axios from "axios";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StarRating from "./StarRating";
import { AuthContext } from "../context/authContext";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search"; // Import search icon from Material-UI Icons
import Logo from "./Logo";
import Slideshow from "./SlideShow";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Search = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useContext(AuthContext);

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
      toast.success('Product added to cart successfully!', {
        position: 'top-center',
        autoClose: 1000, // Auto close after 2 seconds
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const getAverageRating = async (productId) => {
    try {
      const response = await axios.get(
        `http://localhost:8800/ratings/${productId}`
      );
      const ratings = response.data;

      if (ratings.length > 0) {
        const totalRating = ratings.reduce(
          (sum, rating) => sum + rating.rating,
          0
        );
        return totalRating / ratings.length;
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error fetching average rating:", error);
      return 0;
    }
  };

  const getProductImage = (product) => {
    return product ? `http://localhost:8800/${product.image_path}` : "";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8800/allproducts");
        const productsData = response.data;

        const productsWithRating = await Promise.all(
          productsData.map(async (product) => {
            const averageRating = await getAverageRating(product.id);
            return { ...product, averageRating };
          })
        );

        setProducts(productsWithRating);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div >
      <div className={styles.fixedHeader} style={{backgroundColor:"#65becf"}}>
      <Link to="/home" className={styles.logoicon}>
        <Logo />
        </Link>
        
        <div className={styles.searchBar}>
        <SearchIcon className={styles.searchIcon} /> {/* Search icon */}
        <div >
         
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
          />
          
          {searchQuery && (
            <div className={styles.clearButton} onClick={clearSearch}>
              X
            </div>
          )}
        </div>
      </div>
      <div className={styles.scrollcontainer}>
      <ToastContainer />
      </div>
      <div className={styles.productlistcontainer}>
    
        {filteredProducts.length === 0 ? (
          <p className={styles.results} style={{marginLeft:"180%",width:"300%",fontWeight:"bold",color:"red"}}>Results not found.</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className={styles.productitem}>
              <Link 
                to={`/productdetails/${product.id}`}
                className={styles.productLink}
                style={{ textDecoration: "none" }}
              >
                <img src={getProductImage(product)} alt={product.title} />
                <p style={{ textDecoration: "none",color:"black",fontWeight:"500" }}>
  {product.title.length > 20 ? `${product.title.substring(0, 20)}...` : product.title}
</p>

                <p style={{ textDecoration: "none",color:"black",fontWeight:"bold" }}>Rs.{product.product_cost}</p>
                <StarRating rating={product.averageRating} />
              </Link>
              <Tooltip title="Add to Cart" arrow>
                <IconButton
                  className={styles.addToCartBtn}
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCartIcon className={styles.cartIcon}  style={{color:"#65becf"}}/>
                </IconButton>
              </Tooltip>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Search;