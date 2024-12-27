import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import axios from 'axios';
import Logo from './Logo';
import ProductList from './ProductList';
import { useNavigate, Link } from 'react-router-dom';
import AdminOrders from './AdminOrders'; // Import the Orders component
import AddCoupons from "./AddCoupons";
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS import
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'; // Import icons from Font Awesome
import Bargraph from './Bargraph';
import Orderdetails from "./OrderDetails";
import PictorialOrders from "./PictorialOrders";
import GstDetails from './GstDetails';




const UploadForm = () => {
  const [formKey, setFormKey] = useState(0); 
  const [formData, setFormData] = useState({
    title: '',
    brandName: '',
    productCost: '',
    description: '',
    category: '',
    image: null,
    rating: '',
    quantity: '',
    gst: "" 
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [productData, setProductData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const { currentUser, logout } = useContext(AuthContext);
  const [showOrders, setShowOrders] = useState(false); // New state variable for showing orders
  const [showCoupon, setShowCoupon] = useState(false); // New state variable for showing orders
  const [showOrderDetails, setShowOrderDetails] = useState(true); 
  const [showPictorialOrders, setshowPictorialOrders] = useState(false);
  const navigate = useNavigate();
  const [categoryOptions] = useState(['Men\'s Fashion', 'Women', 'Kids', 'Electronics', 'Appliances']);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [totalOrderAmounts, setTotalOrderAmounts] = useState([]);
  const [showGstDetails, setShowGstDetails] = useState(false);

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowGstDetails = () => {
    setShowGstDetails(true);
    
    setShowUserList(false);   // Hide other sections
    setShowForm(false);
    setShowStock(false);
    setShowOrders(false);
    setShowCoupon(false);
    setShowGraph(false);
    setShowOrderDetails(false);
    setshowPictorialOrders(false);
  };
  

  const ConfirmationPopup = ({ message, onCancel, onConfirm }) => {
    return (
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', border: '1px solid #ccc', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <p>{message}</p>
        <button onClick={onCancel} style={{ marginLeft:"15%",backgroundColor:"#b53a40",fontWeight:"bold" }}>Cancel</button>
        <button onClick={onConfirm} style={{  marginLeft:"8%",marginRight: '10px',backgroundColor:"#49bf74",fontWeight:"bold" }}>Confirm</button>
      </div>
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const filteredProducts = productData.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchUsersData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users data:', error);
    }
  };

  useEffect(() => {
    const fetchTotalOrderAmounts = async () => {
      try {
        const response = await axios.get('http://localhost:8800/total_order_amount');
        setTotalOrderAmounts(response.data);
      } catch (error) {
        console.error('Error fetching total order amounts:', error);
      }
    };

    if (showUserList) {
      fetchUsersData();
      fetchTotalOrderAmounts();
    }
  }, [showUserList]);

  const handleShowUserList = () => {
    setShowUserList(true);
    setShowForm(false);
    setShowGstDetails(false);  // Set GST details visibility to true
    setShowStock(false);
    setShowOrders(false);
    setShowCoupon(false)
    setShowGraph(false)
    setShowOrderDetails(false)
    setshowPictorialOrders(false);
    
  };

  
const handleShowPictorialOrders = () => {
  setshowPictorialOrders(true);
  setShowUserList(false);
  setShowGstDetails(false);  // Set GST details visibility to true
    setShowForm(false);
    setShowStock(false);
    setShowOrders(false);
    setShowCoupon(false)
    setShowGraph(false)
    setShowOrderDetails(false)
};


  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/adminproducts');
      setProductData(response.data);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataForUpload = new FormData();

    formDataForUpload.append('title', formData.title);
    formDataForUpload.append('brandName', formData.brandName);
    formDataForUpload.append('productCost', formData.productCost);
    formDataForUpload.append('description', formData.description);
    formDataForUpload.append('category', formData.category);
    formDataForUpload.append('image', formData.image || null);
    formDataForUpload.append('rating', formData.rating);
    formDataForUpload.append('quantity', formData.quantity);
   
    formDataForUpload.append('gstPercentage', formData.gst);

    try {
      await axios.post('http://localhost:8800/upload', formDataForUpload);

      setFormData({
        title: '',
        brandName: '',
        productCost: '',
        description: '',
        category: '',
        image: null,
        rating: '',
        quantity: '',
   
        gst: '', // Reset GST
      });

      setShowSuccessPopup(true);

      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);

      fetchData();
      
      // Update the key to force re-render
      setFormKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleUpdateProductClick = () => {
    setShowForm(true);
    setShowStock(false);
    setShowOrders(false);
    setShowUserList(false);
    setShowCoupon(false)

    setShowGstDetails(false);  // Set GST details visibility to true
    setShowGraph(false)
    setShowOrderDetails(false)
    setshowPictorialOrders(false);
  };


  const handleStockLevelClick = () => {
    setShowForm(false);
    setShowStock(false);
    setShowOrders(false);
    setShowGstDetails(false);  // Set GST details visibility to true
    setShowOrderDetails(false)
    setshowPictorialOrders(false);
    setShowUserList(false);
    setShowCoupon(false)
    setShowGraph(true)
  };


  const handleUpdateAddCouponsClick = () => {
    setShowForm(false);
    setShowStock(false);
    setShowGstDetails(false);  // Set GST details visibility to true
    setShowOrders(false);
    setshowPictorialOrders(false);
    setShowUserList(false);
    setShowOrderDetails(false)
    
    setShowCoupon(true)
    setShowGraph(false)
  };

  const handleStockClick = () => {
    setShowForm(false);
    setShowStock(true);
    setShowGstDetails(false);  // Set GST details visibility to true
    setShowCoupon(false)
    setshowPictorialOrders(false);
    setShowOrders(false);
    setShowOrderDetails(false);
    setShowUserList(false);
    setShowGraph(false)
  };

  const handleOrdersClick = () => {
    setShowOrders(true);
    setShowForm(false);
    setShowGstDetails(false);  // Set GST details visibility to true
    setShowCoupon(false);
    setshowPictorialOrders(false);
    setShowUserList(false);
    setShowOrderDetails(false);
    setShowStock(false);
    setShowGraph(false);
  };

  const handleShowOrderDetails = () => {
    setShowOrders(false);
    setShowForm(false);
    setShowCoupon(false)
    setShowUserList(false)
    setShowGstDetails(false);  // Set GST details visibility to true;
    setShowOrderDetails(false)
    setShowStock(false);
    setShowGraph(false)
    setShowOrderDetails(true)
    setshowPictorialOrders(false);
  };

  useEffect(() => {
    fetchData();
  }, [formKey]); // Use formKey as a dependency to trigger useEffect on key update

  const handleEdit = (productId) => {
    navigate(`/editstock?productId=${productId}`); // Navigate to the edit form page with product ID as parameter
  };
  
  const handleDelete = (productId) => {
    setProductIdToDelete(productId);
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    setShowConfirmation(false);
    const updatedProducts = productData.filter(product => product.id !== productIdToDelete);
    setProductData(updatedProducts);

    fetch('http://localhost:8800/stockdata', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: productIdToDelete }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      // Handle success response if needed
    })
    .catch(error => {
      console.error('Error deleting product:', error);
      // Handle error
    });
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredResults = productData.filter(
    (product) =>
      String(product.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  const sortedResults = filteredResults.slice().sort((a, b) => {
    if (sortBy === 'price') {
      const priceA = parseFloat(a.product_cost);
      const priceB = parseFloat(b.product_cost);
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    } else if (sortBy === 'available') {
      const availableA = parseInt(a.available);
      const availableB = parseInt(b.available);
      return sortOrder === 'asc' ? availableA - availableB : availableB - availableA;
    } else if (sortBy === 'productId') {
      const idA = parseInt(a.id);
      const idB = parseInt(b.id);
      return sortOrder === 'asc' ? idA - idB : idB - idA;
    }
    return 0;
  });


  const handleSort = (sortByField) => {
    if (sortBy === sortByField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sortByField);
      setSortOrder('asc');
    }
  };




  return (
    <div className="container mt-5">
     
      <style>
        {`
          .navbar {
            background-color: #65becf;
            
            padding: 15px 0;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            height: 75px;
          }
          .navbar-nav {
            margin-top: 1.3%;
          }
          .navbar-nav .btn {
            position: relative;
            color: white;
            font-weight: 900;
            padding: 8px 16px;
            border: 1px solid transparent;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            overflow: hidden;
            transition: background-color 0.3s, border-color 0.3s;
          }
          .navbar-nav .btn::before {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 2px;
            background-color: white;
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.3s;
          }
          .navbar-nav .btn:hover {
            border-color: white;
          }
          .navbar-nav .btn:hover::before {
            transform: scaleX(1);
            transform-origin: left;
          }
        `}
      </style>
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top mb-3">
        <div className="container-fluid">
          <div className="navbar-brand">
            <Logo />
          </div>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav" style={{ marginTop: "1.3%" }}>
            <ul className="navbar-nav ms-auto">
               <li className="nav-item">
        <button
          className="btn me-2"
          style={{ borderRadius: '5px', padding: '8px 16px', color: "white",marginTop: "-5%" }}
          onClick={handleShowOrderDetails} // Add the click handler to show orders
        >
          Home
        </button>
      </li>
              <li className="nav-item">
                <button
                  className="btn me-2"
                  onClick={handleUpdateProductClick}
                  style={{ borderRadius: '5px', padding: '8px 16px', color: "white",marginTop: "-3%" }}
                >
                  Add Product
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn"
                  onClick={handleStockClick}
                  style={{ borderRadius: '5px', padding: '8px 16px', color: "white",marginTop: "-5%" }}
                >
                  Stock
                </button>
              </li>

              <li className="nav-item">
        <button
          className="btn me-2"
          style={{ borderRadius: '5px', padding: '8px 16px', color: "white",marginTop: "-5%" }}
          onClick={handleOrdersClick} // Add the click handler to show orders
        >
          Orders
        </button>
      </li>
      <li className="nav-item">
        <button
          className="btn me-2"
          style={{ borderRadius: '5px', padding: '8px 16px', color: "white",marginTop: "-3%" }}
          onClick={handleShowPictorialOrders} // Add the click handler to show orders
        >
          Orders Flow Display
        </button>
      </li>

      <li className="nav-item">
        <button
          className="btn me-2"
          style={{ borderRadius: '5px', padding: '8px 16px', color: "white",marginTop: "-7%" }}
          onClick={handleShowUserList} // Add the click handler to show orders
        >
          Users
        </button>
      </li>
      <li className="nav-item">
        <button
          className="btn me-2"
          style={{ borderRadius: '5px', padding: '8px 16px', color: "white",marginTop: "-5%" }}
          onClick={handleUpdateAddCouponsClick} // Add the click handler to show orders
        >
         AddCoupons
        </button>
      </li>
     
      <li className="nav-item">
        <button
          className="btn me-2"
          style={{ borderRadius: '5px', padding: '8px 16px', color: "white",marginTop: "-5%" }}
          onClick={ handleShowGstDetails } // Add the click handler to show orders
        >
         GST Details
        </button>
      </li>
     


    

              <li className="nav-item">
                <Link to="/" onClick={handleLogoutClick}>
                  <button
                    className="btn"
                    style={{ borderRadius: '5px', padding: '8px 16px', color: "white",marginTop: "-8%" }}
                  >
                    Logout
                  </button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div style={{marginTop:"10%"}}>
      {showOrders && <AdminOrders />}
      </div>
      <div style={{marginTop:"10%"}}>
      {showPictorialOrders && <PictorialOrders />}
      </div>
      <div style={{marginTop:"10%"}}>
      {showCoupon && <AddCoupons />}
      </div>
      <div style={{marginTop:"10%"}}>
      {showOrderDetails && <Orderdetails />}
      </div>
      

      <div style={{marginTop:"10%"}}>
      {showGraph && <Bargraph />}
      </div>
     
      {showForm && (
        <form key={formKey} onSubmit={handleSubmit} className="mb-5 animated-border" style={{ width: '50%', marginLeft: '25%', marginTop: '10%', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', padding: '20px', background: '#fff' }}>
          <h4 style={{ textAlign: "center", fontWeight: "bold", color: "#328192" }}>Stock Entry Form</h4>
          <div className="mb-3" style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="title" className="form-label" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Title:
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div className="mb-3" style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="brandName" className="form-label" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Brand Name:
            </label>
            <input
              type="text"
              className="form-control"
              id="brandName"
              name="brandName"
              value={formData.brandName}
              onChange={handleChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div className="mb-3" style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="productCost" className="form-label" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Product Cost:
            </label>
            <input
              type="text"
              className="form-control"
              id="productCost"
              name="productCost"
              value={formData.productCost}
              onChange={handleChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div className="mb-3" style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="description" className="form-label" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Description:
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            ></textarea>
          </div>

          <div className="mb-3" style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="category" className="form-label" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Category:
            </label>
            <select
              className="form-select"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="" disabled>Select Category</option>
              {categoryOptions.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="mb-3" style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="image" className="form-label" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Image:
            </label>
            <input
              type="file"
              className="form-control"
              id="image"
              name="image"
              required
              onChange={handleFileChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div className="mb-3" style={{ display: 'flex', flexDirection: 'column' }}>
    <label
        htmlFor="gst"
        className="form-label"
        style={{ marginBottom: '8px', fontWeight: 'bold' }}
    >
        GST (%):
    </label>
    <select
        className="form-select"
        id="gst"
        name="gstPercentage"
        value={formData.gst} // Ensure the value is controlled by state
        onChange={handleChange} // Update state when a selection is made
        style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc'
        }}
    >
        <option value="" disabled>
            Select GST
        </option>
        <option value="12">12%</option>
        <option value="15">15%</option>
        <option value="18">18%</option>
        
    </select>
</div>


      

          <div className="mb-3" style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="quantity" className="form-label" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Quantity:
            </label>
            <input
              type="text"
              className="form-control"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid ' }}
            />
          </div>

         


          <div className="mb-3 ">
            <button type="submit" className="btn btn-primary " style={{ padding: '10px 20px', background: '#3291a8', color: '#fff', cursor: 'pointer', border: 'none', marginLeft: "38%",fontWeight:"bold" }}>
              Submit
            </button>
          </div>
        </form>
      )}

      {showSuccessPopup && (
        <div className="alert alert-success mt-3" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor:"green",
          color:"white"
        }}>
          Product added successfully!
        </div>
      )}
 {showConfirmation && (
        <ConfirmationPopup
          message="Are you sure you want to delete this product?"
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
       {showGstDetails && <GstDetails />}
{showStock && (
  <div style={{ width: '113.5%', marginTop: "10%", marginLeft: "-7%", fontWeight: "600",fontSize:"12px" }}>
    
    <h2 className="mt-5" style={{ textAlign:"center" }}>Stock Quantity and Availability</h2>
    <input
        type="text"
        placeholder="Search by ProductId or Name or Brand"
        value={searchTerm}
        onChange={handleSearch}
        style={{width:"25%",padding:"0.7%",fontWeight:"bold",marginBottom:"1%",marginLeft:"1%"}}
      />
      <button style={{backgroundColor:"#65becf",marginLeft:"58%",fontWeight:"bold"}} onClick={handleStockLevelClick}>
      Availability Chart
      </button>
     
   <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#65becf', color: 'white', padding: '12px', textAlign: 'center', borderBottom: '2px solid white' }}>
            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc' }}>Sl. No</th>
            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc', cursor: 'pointer' }} onClick={() => handleSort('productId')}>
              Product Id
              {sortBy === 'productId' && sortOrder === 'asc' && <FaSortUp />}
              {sortBy === 'productId' && sortOrder === 'desc' && <FaSortDown />}
              {sortBy !== 'productId' && <FaSort />}
            </th>
            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc' }}>Brand</th>
            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc' }}>Product Name</th>
            {/* <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc' }}>Actual Cost</th> */}

            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc', cursor: 'pointer' }} onClick={() => handleSort('price')}>
              Price
              {sortBy === 'price' && sortOrder === 'asc' && <FaSortUp />}
              {sortBy === 'price' && sortOrder === 'desc' && <FaSortDown />}
              {sortBy !== 'price' && <FaSort />}
            </th>
            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc' }}>GST</th>
            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc' }}>GST Amount(₹)</th>

            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc' }}>Quantity</th>
            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc', cursor: 'pointer' }} onClick={() => handleSort('available')}>
              Available
              {sortBy === 'available' && sortOrder === 'asc' && <FaSortUp />}
              {sortBy === 'available' && sortOrder === 'desc' && <FaSortDown />}
              {sortBy !== 'available' && <FaSort />}
            </th>
            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc' }}>Coupon</th>
            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc' }}>CouponExpiry</th>
            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ccc' }}>Discount</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th> {/* New column for actions */}
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((product, index) => (
            <tr key={index} style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ccc' }}>
              <td style={{ borderRight: '1px solid #ccc' }}>{index + 1}</td>
              <td style={{ borderRight: '1px solid #ccc' }}>{product.id}</td>
              <td style={{ borderRight: '1px solid #ccc' }}>{product.brand}</td>
              <td style={{ borderRight: '1px solid #ccc' }}>{product.title}</td>
              {/* <td style={{ borderRight: '1px solid #ccc' }}>{product.actual_cost}</td> */}

              <td style={{ borderRight: '1px solid #ccc' }}>{product.product_cost}</td>
              <td style={{ borderRight: '1px solid #ccc' }}>
  {product.gst_percentage ? `${Math.floor(product.gst_percentage)}%` : 'N/A'}
</td>
<td style={{ borderRight: '1px solid #ccc' }}>
  {product.gst_percentage && product.product_cost
    ? `${(product.product_cost * (product.gst_percentage / 100)).toFixed(2)}`
    : 'N/A'}
</td>
              <td style={{ borderRight: '1px solid #ccc' }}>{product.quantity}</td>
              <td style={{ borderRight: '1px solid #ccc' }}>{product.available}</td>
              <td style={{ borderRight: '1px solid #ccc' }}>{product.coupon_code ? product.coupon_code : 'None'}</td>
              <td style={{ borderRight: '1px solid #ccc' }}>{product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('en-US') : 'None'}</td>
              <td style={{ borderRight: '1px solid #ccc' }}>{product.discount_percentage != null ? (typeof product.discount_percentage === 'number' ? parseFloat(product.discount_percentage).toFixed(2).replace('.00', '') : parseFloat(product.discount_percentage.replace('.00', ''))) + '%' : 'None'}</td>
              <td>
                <button onClick={() => handleEdit(product.id)} style={{backgroundColor:"white",color:"#8ef5bc",fontWeight:"bold"}}>Edit</button> {/* Edit button */}
                <button onClick={() => handleDelete(product.id)}  style={{backgroundColor:"white",color:"#f59fab",fontWeight:"bold"}}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  </div>
)}
 
    <div>
     
  
  
    {showUserList && (
  <div>
    <h2 style={{ marginTop: '20px', textAlign: "center" }}>Users List</h2>
    <table style={{ borderCollapse: 'collapse', width: '115%', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',marginLeft:"-8%" }}>
      <thead>
        <tr style={{textAlign:"center"}}>
          <th style={{ padding: '12px', backgroundColor: '#f2f2f2', fontWeight: 'bold', border: '1px solid #ccc',textAlign:"center" }}>ID</th>
          <th style={{ padding: '12px', backgroundColor: '#f2f2f2', fontWeight: 'bold', border: '1px solid #ccc',textAlign:"center" }}>Username</th>
          <th style={{ padding: '12px', backgroundColor: '#f2f2f2', fontWeight: 'bold', border: '1px solid #ccc' ,textAlign:"center"}}>Email</th>
          <th style={{ padding: '12px', backgroundColor: '#f2f2f2', fontWeight: 'bold', border: '1px solid #ccc' ,textAlign:"center"}}>Mobile</th>
          <th style={{ padding: '12px', backgroundColor: '#f2f2f2', fontWeight: 'bold', border: '1px solid #ccc' ,textAlign:"center"}}>Total Amount Spent</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id} style={{ backgroundColor: '#f9f9f9', border: '1px solid #ccc', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',textAlign:"center" }}>
            <td style={{ padding: '12px', borderRight: '1px solid #ccc' }}>{user.id}</td>
            <td style={{ padding: '12px', borderRight: '1px solid #ccc' }}>{user.username}</td>
            <td style={{ padding: '12px', borderRight: '1px solid #ccc' }}>{user.email}</td>
            <td style={{ padding: '12px', borderRight: '1px solid #ccc' }}>{user.mobile}</td>
            {/* Display total order amount for this user */}
            <td style={{ padding: '12px' }}>
  ₹{Math.round(totalOrderAmounts.find(item => item.user_id === user.id)?.total_order_amount) || 0}
</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


    </div>
    </div>
  );
};

export default UploadForm;
