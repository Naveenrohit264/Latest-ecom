import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const EditStockForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    product_cost: '',
    description: '',
    category: '',
    quantity: '',
    available: '',
  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('productId');
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    if (productId) {
      fetch(`http://localhost:8800/stockdata/${productId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch product data');
          }
          return response.json();
        })
        .then(productData => {
          setFormData(productData);
        })
        .catch(error => {
          console.error('Error fetching product data:', error);
        });
    }
  }, [productId]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const formattedData = { ...formData };
    const createdAtDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    formattedData.created_at = createdAtDate;

    fetch(`http://localhost:8800/stockdata/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedData)
    })
    .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update product data');
        }
        toast.success('Product data updated successfully');
        setTimeout(() => {
          // Navigate to '/adminpage' after 2 seconds
          navigate('/adminpage');
        }, 2000);
      })
    .catch(error => {
      console.error('Error updating product data:', error);
      toast.error('Failed to update product data'); // Display error toast
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="container mt-5">
        <ToastContainer />
        <h4 style={{textAlign:"center"}}>Edit Product</h4>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
           
            <div className="card-body" style={{boxShadow: "0 20px 40px 40px rgba(0, 0, 0, 0.1)",border:"2px solid black"}}>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" style={{fontWeight:"bold"}}>Title:</label>
                  <input className="form-control" type="text" name="title" value={formData.title} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{fontWeight:"bold"}}>Brand:</label>
                  <input className="form-control" type="text" name="brand" value={formData.brand} onChange={handleChange} />
                </div>
                <div className="mb-3" style={{fontWeight:"bold"}}>
                  <label className="form-label">Product Cost:</label>
                  <input className="form-control" type="text" name="product_cost" value={formData.product_cost} onChange={handleChange} />
                </div>
                <div className="mb-3" style={{fontWeight:"bold"}}>
                  <label className="form-label">Description:</label>
                  <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} />
                </div>
                <div className="mb-3" style={{fontWeight:"bold"}}>
                  <label className="form-label">Category:</label>
                  <input className="form-control" type="text" name="category" value={formData.category} onChange={handleChange} />
                </div>
                <div className="mb-3" style={{fontWeight:"bold"}}>
                  <label className="form-label">Quantity:</label>
                  <input className="form-control" type="text" name="quantity" value={formData.quantity} onChange={handleChange} />
                </div>
                <div className="mb-3" style={{fontWeight:"bold"}}>
                  <label className="form-label">Available:</label>
                  <input className="form-control" type="text" name="available" value={formData.available} onChange={handleChange} />
                </div>
                <button className="btn btn-primary" type="submit" style={{marginLeft:"40%"}}>Submit</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStockForm;
