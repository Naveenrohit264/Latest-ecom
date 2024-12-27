// src/ProductList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductList = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const baseURL = 'http://localhost:8800'; // Update with your server's base URL

  // Fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products based on the selected category
  const fetchProducts = async (category) => {
    try {
      const response = await axios.get(`${baseURL}/api/products?category=${category}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchProducts(category);
  };

  return (
    <div>
      <h2>Product Categories</h2>
      <div>
        {categories.map((category) => (
          <button key={category} onClick={() => handleCategoryChange(category)}>
            {category}
          </button>
        ))}
      </div>

      <h2>Products</h2>
      <div>
        {products.length === 0 ? (
          <p>No products available for this category.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} style={{ margin: '10px', border: '1px solid #ccc', padding: '10px' }}>
              <h3>{product.title}</h3>
              <p>Brand: {product.brand}</p>
              <p>Price: ${product.product_cost}</p>
              <img src={`${baseURL}/${product.image_path}`} alt={product.title} style={{ maxWidth: '100px' }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
