import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddressForm = () => {
  const [flatNo, setFlatNo] = useState('');
  const { currentUser } = useContext(AuthContext);
  const [plotNo, setPlotNo] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation for mobile number
    if (mobileNumber.length !== 10 || isNaN(mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    // Validation for pincode
    if (pincode.length !== 6 || isNaN(pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8800/address', {
        userId: currentUser.id,
        flatNo,
        plotNo,
        area,
        pincode,
        mobileNumber,
      });
      console.log('Address saved successfully:', response.data);
      // Clear form fields after successful submission
      setFlatNo('');
      setPlotNo('');
      setArea('');
      setPincode('');
      setMobileNumber('');
      navigate('/cart'); // Navigate to the cart
    } catch (error) {
      console.error('Error saving address:', error);
      // Handle error, show a message, etc.
    }
  };

  return (
    <div className="container" style={{ marginTop: '2%' }}>
      <ToastContainer />
      <div className="text-left mb-3">
        <Link to="/cart" className="btn btn-secondary">
          <FaArrowLeft />
        </Link>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="p-4 bg-light rounded shadow-sm">
            <h2 className="mb-4" style={{ textAlign: 'center' }}>Add Address</h2>
            <div className="form-group">
              <label>Flat Number:</label>
              <input
                className="form-control"
                type="number"
                value={flatNo}
                onChange={(e) => setFlatNo(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Plot Number:</label>
              <input
                className="form-control"
                type="number"
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Area:</label>
              <input
                className="form-control"
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Pincode:</label>
              <input
                className="form-control"
                type="text"
                pattern="[0-9]{6}"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
                
              />
            </div>
            <div className="form-group">
              <label>Mobile Number:</label>
              <input
                className="form-control"
                type="text"
                pattern="[0-9]{10}"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter your mobile number"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block mt-4" style={{ marginLeft: '35%' }}>Save Address</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
