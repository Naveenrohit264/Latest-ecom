import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarRating from './StarRating';
import { AuthContext } from '../context/authContext';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import styles from "./ProductList.module.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All"); // Default to 'Men's Fashion'
  const { currentUser } = useContext(AuthContext);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate hook
  
  const addToCart = async (product) => {
    
    try {
      await axios.post('http://localhost:8800/addtocart', {
        productId: product.id,
        userId: currentUser.id,
        image_path: product.image_path,
        price: product.product_cost,
        quantity: 1,
        title: product.title,
        brand: product.brand,
      });
      navigate('/home'); 
      toast.success('Product added to cart successfully!', {
        position: 'top-center',
        autoClose: 1000, // Auto close after 2 seconds
        
      });
      window.location.reload();
     // Redirect to the home page after successful addition to cart
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const getProductImage = (product) => {
    return product ? `http://localhost:8800/${product.image_path}` : '';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8800/allproducts');
        const productsData = response.data;

        // Fetch and set the average rating for each product
        const productsWithRating = await Promise.all(productsData.map(async (product) => {
          const ratingsResponse = await axios.get(`http://localhost:8800/ratings/${product.id}`);
          const ratings = ratingsResponse.data;
          const averageRating = calculateAverageRating(ratings);
          return { ...product, averageRating };
        }));

        setProducts(productsWithRating);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, []);

  const calculateAverageRating = (ratings) => {
    if (ratings.length === 0) {
      return 0;
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return totalRating / ratings.length;
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const categoryOptions = [
    { name: 'All', image: 'all.avif' }, // Added 'All' category
    { name: "Men's Fashion", image: "mens.jpg"  },
    { name: 'Fashion', image: 'mensfashion.webp' },
    { name: 'Kids', image: 'kids.jpg' },
    { name: 'Electronics', image: 'electronics.webp' },
    { name: "Women", image: 'womens.avif' }, // Changed 'Women' to "Women's Fashion"
    { name: 'Appliances', image: 'appliances.webp' },
  ];
  
  // Assuming you have a state variable named selectedCategory to store the selected category
  // and a state variable named products to store the list of all products
  
  const filteredProducts = selectedCategory === 'All'
    ? products
    : selectedCategory === 'Fashion'
      ? products.filter(product => product.category === "Men's Fashion" || product.category === "Women")
      : products.filter(product => product.category === selectedCategory);
  

  return (
    <div style={{marginLeft:"-10%"}}>
     <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
  {['All', ...categoryOptions].map((category) => (
    <span
      key={category.name}
      onClick={() => handleCategoryClick(category.name)}
      style={{
        cursor: 'pointer',
        margin: '0 10px', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'transform 0.3s ease-in-out',
        color: selectedCategory === category.name ? '#e44d26' : 'inherit', // Highlight selected category
        fontWeight: 'bold', 
        marginLeft:'5%'
      }}
    >
      {category.image && <img src={category.image} alt={category.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%', marginBottom: '5px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }} />} {category.name}
    </span>
  ))}
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', padding: '20px', marginLeft: '13%', alignItems: 'start', fontFamily: 'Arial, sans-serif' }}>
  {filteredProducts.map((product) => (
    <div className={styles.productdetail}  key={product.id} style={{ padding: '15px', position: 'relative', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', transition: 'box-shadow 0.3s ease', backgroundColor: '#fff', overflow: 'hidden', textAlign: 'center', height: '100%'}} >
       
      <Link to={`/productdetails/${product.id}`} style={{ textDecoration: 'none', color: '#333' }}>
        <div  style={{ height: '200px', overflow: 'hidden', borderRadius: '8px', position: 'relative' }}>
          <img src={getProductImage(product)} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }} />
        </div>
        <div style={{ padding: '15px' }}>
         
          <p style={{ textDecoration: "none" }}>
  {product.title.length > 20 ? `${product.title.substring(0, 20)}...` : product.title}
</p>

          <p style={{ margin: '10px 0', fontWeight: 'bold', fontSize: '16px', color: 'black' }}>Rs.{product.product_cost}</p>
        </div>
      </Link>
    </div>
  ))}
</div>
    </div>
  );
};

export default ProductList;