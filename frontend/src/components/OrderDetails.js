import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Cancel';


const OrdersPage = () => {
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [deliveringOrders, setDeliveringOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null); // State to track selected status
  const [selectedOrders, setSelectedOrders] = useState(null); // State to track selected orders

  useEffect(() => {
    // Fetch delivered orders
    axios.get('http://localhost:8800/delivered')
      .then(response => {
        setDeliveredOrders(response.data);
      })
      .catch(error => {
        console.error('Error fetching delivered orders:', error);
      });

    // Fetch delivering orders
    axios.get('http://localhost:8800/delivering')
      .then(response => {
        setDeliveringOrders(response.data);
      })
      .catch(error => {
        console.error('Error fetching delivering orders:', error);
      });

    // Fetch cancelled orders
    axios.get('http://localhost:8800/cancelled')
      .then(response => {
        setCancelledOrders(response.data);
      })
      .catch(error => {
        console.error('Error fetching cancelled orders:', error);
      });
  }, []);

  // Function to handle click event on order div
  const handleOrderClick = (status, orderList) => {
    setSelectedStatus(status); // Set selected status
    setSelectedOrders(orderList.filter(order => order.status === status)); // Set selected orders based on status
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col my-3" onClick={() => handleOrderClick('delivered', deliveredOrders)}>
          <div className="card shadow-lg bg-white" style={{marginLeft:"-20%",width:"60%"}}>
            <div className="card-header text-black" >
            <img src='giphy.gif' alt='An image' width='120' height='120' /><span className="badge" style={{color:"#65becf",fontSize:"22px"}}>{deliveredOrders.length}</span>
            </div>
            <ul className="list-group list-group-flush">
              
            </ul>
          </div>
        </div>
        <div className="col" onClick={() => handleOrderClick('delivering', deliveringOrders)}>
          <div className="card" style={{marginLeft:"16%",width:"65%",marginTop:"4%",backgroundColor:"white"}}>
            <div className="card-header text-black" style={{backgroundColor:"white"}}>
            <img src='delivery.gif' alt='An image' width='120' height='120' /><span className="badge " style={{color:"#65becf",fontSize:"22px"}}>{deliveringOrders.length}</span>
            </div>

          </div>
        </div>
        <div className="col my-3" onClick={() => handleOrderClick('cancelled', cancelledOrders)}>
          <div className="card shadow-lg bg-white" style={{marginLeft:"50%",width:"65%"}}>
          <div className="card-header text-black">
          <img src='cancel.gif' alt='An image' width='120' height='120' style={{marginLeft:"12%"}} />
    <span className="badge" style={{color:"#65becf",fontSize:"22px"}}>{cancelledOrders.length}</span>
</div>
            <ul className="list-group list-group-flush">
              
            </ul>
          </div>
        </div>
      </div>
      {/* Display selected order details */}
      {selectedStatus && (
        <div className="row mt-3" style={{ width: "115%", marginLeft: "-8%" }}>
          <div className="col">
            <div className="card shadow-lg bg-white">
              <div className="card-header text-dark">
              <h5 style={{ textAlign: "center" }}>{selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Orders Details</h5>

              </div>
              <div className="card-body">
                {selectedOrders === null ? (
                  <p>Loading...</p>
                ) : selectedOrders.length === 0 ? (
                  <p style={{textAlign:"center",fontWeight:"bold",fontSize:"16px"}}>No orders found for {selectedStatus} status.</p>
                ) : (
                    <table className="table table-bordered table-responsive">
                    <thead style={{ fontSize: "14px",whiteSpace: "nowrap",textAlign:"center"}}>
                      <tr>
                        <th>Order ID</th>
                        
                        <th>Product ID</th>
                        <th>Brand</th>
                        <th>Title</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Amount Paid</th>
                        <th>Payment Mode</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Cancellation Reason</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: "14px",textAlign:"center"}}>
                      {selectedOrders.map(order => (
                        <tr key={order.order_id}>
                          <td>{order.order_id}</td>
                         
                          <td>{order.product_id}</td>
                          <td>{order.brand}</td>
                          <td>{order.title}</td>
                          <td>{order.quantity}</td>
                          <td>{order.price}</td>
                          <td>{order.total_amount}</td>
                          <td>{order.payment_mode}</td>
                          <td>{order.address}</td>
                          <td>{order.status}</td>
                          <td>{order.cancellation_reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;