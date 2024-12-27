import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast,ToastContainer } from 'react-toastify'; // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for react-toastify

function CouponForm() {
  const [productId, setProductId] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [productOptions, setProductOptions] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [minimumPurchase, setMinimumPurchase] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');

  
  useEffect(() => {
    axios.get('http://localhost:8800/adminproducts')
      .then(response => {
        setProductOptions(response.data); // Assuming the response is an array of product objects { id, title }
        console.log("Product Options:", response.data); // Log productOptions
      })
      .catch(error => {
        console.error('Error fetching product IDs:', error);
      });
  }, []);

  const handleProductChange = (event) => {
    const selectedProductId = event.target.value;
    setProductId(selectedProductId);
    // Reset other fields when product changes
    setCouponCode('');
    setDiscountPercentage(0);
    setMinimumPurchase(0);
    setExpiryDate('');
  };
  
  useEffect(() => {
    console.log("productId changed:", productId);
    console.log("productOptions:", productOptions);
    const selectedProduct = productOptions.find(product => product.id === parseInt(productId));
    if (selectedProduct) {
      console.log("Selected Product:", selectedProduct);
      setProductTitle(selectedProduct.title);
    } else {
      console.log("No product found for productId:", productId);
      setProductTitle('');
    }
  }, [productId, productOptions]);
  
  const handleSubmit = (event) => {
    event.preventDefault();
    axios.put(`http://localhost:8800/coupon/${productId}`, {
      coupon_code: couponCode,
      discount_percentage: discountPercentage,
      minimum_purchase: minimumPurchase,
      expiry_date: expiryDate
    })
      .then((response) => {
        console.log(response);
        // Reset the form after successful submission
        setProductId('');
        setProductTitle('');
        setCouponCode('');
        setDiscountPercentage(0);
        setMinimumPurchase(0);
        setExpiryDate('');
        toast.success('Coupon added successfully!', {
          position: toast.POSITION.TOP_CENTER
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <ToastContainer /> 
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Coupon Form</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column',boxShadow: "20px 40px 60px rgba(0, 0, 0, 0.1)",padding:"40px" }}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="productId" style={{ fontWeight: 'bold', marginBottom: '5px' }}>Product ID:</label>
          <select id="productId" name="productId" value={productId} onChange={handleProductChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}>
            <option value="">Select a product ID</option>
            {productOptions.map(product => (
              <option key={product.id} value={product.id}>{product.id}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="productTitle" style={{ fontWeight: 'bold', marginBottom: '5px' }}>Brand:</label>
          <p style={{ fontStyle: 'italic', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}>{productTitle}</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="couponCode" style={{ fontWeight: 'bold', marginBottom: '5px' }}>Coupon Code:</label>
          <input type="text" id="couponCode" name="couponCode" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="discountPercentage" style={{ fontWeight: 'bold', marginBottom: '5px' }}>Discount Percentage:</label>
          <input type="number" step="0.01" id="discountPercentage" name="discountPercentage" value={discountPercentage} onChange={(event) => setDiscountPercentage(event.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="minimumPurchase" style={{ fontWeight: 'bold', marginBottom: '5px' }}>Minimum Purchase:</label>
          <input type="number" step="0.01" id="minimumPurchase" name="minimumPurchase" value={minimumPurchase} onChange={(event) => setMinimumPurchase(event.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="expiryDate" style={{ fontWeight: 'bold', marginBottom: '5px' }}>Expiry Date:</label>
          <input type="date" id="expiryDate" name="expiryDate" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }} />
        </div>
        <button type="submit" style={{ backgroundColor: '#65becf', color: 'white', border: 'none', padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', width: '100%',fontWeight:"bold" }}>Save</button>
      </form>
    </div>
  );
}

export default CouponForm;
