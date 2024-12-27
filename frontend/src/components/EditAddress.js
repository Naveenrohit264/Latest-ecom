import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // Import the arrow icon from react-icons

const EditAddress = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [address, setAddress] = useState({
    flat_no: '',
    plot_no: '',
    area: '',
    pincode: '',
    mobile_number: ''
  });

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/address/${id}`);
        setAddress(response.data);
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    };

    fetchAddress();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress({
      ...address,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8800/address/${id}`, address);
      console.log('Address updated successfully');
      navigate("/cart");
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  return (
    <div className="container" style={{ marginTop: "2%" }}>
      <div className="text-left mb-3">
        <button className="btn btn-secondary" onClick={() => navigate("/cart")}><FaArrowLeft /></button>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="p-4 bg-light rounded shadow-sm">
            <h2 className="mb-4" style={{ textAlign: "center" }}>Edit Address</h2>
            <div className="form-group">
              <label>Flat No:</label>
              <input
                className="form-control"
                type="text"
                name="flat_no"
                value={address.flat_no}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Plot No:</label>
              <input
                className="form-control"
                type="text"
                name="plot_no"
                value={address.plot_no}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Area:</label>
              <input
                className="form-control"
                type="text"
                name="area"
                value={address.area}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Pincode:</label>
              <input
                className="form-control"
                type="text"
                name="pincode"
                value={address.pincode}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Mobile Number:</label>
              <input
                className="form-control"
                type="text"
                name="mobile_number"
                value={address.mobile_number}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block mt-4" style={{ marginLeft: "35%" }}>Update Address</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAddress;
