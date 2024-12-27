import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import DownloadIcon from '@mui/icons-material/Download';


function Orders() {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const baseURL = 'http://localhost:8800'; // Update with your server's base URL

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = currentUser?.id;

        if (userId) {
          const response = await axios.get(`${baseURL}/adminorders?sort=desc`);
          const sortedOrders = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setOrders(sortedOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [currentUser?.id]);

  // Function to handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter(order =>
    order.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.order_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle download of orders
// Function to handle download of orders
const handleDownloadOrders = () => {
  // Construct CSV content based on filtered orders
  const csvContent = "User ID,Brand,Title,Product ID,Quantity,Payment Mode,Amount Paid,Order ID,Address,Status,Cancellation Reason\n" +
                     filteredOrders.map(order => 
                       `${order.user_id},${order.brand},${order.title},${order.product_id},${order.quantity},${order.payment_mode},${order.total_amount},${order.order_id},"${order.address}",${order.status},${order.cancellation_reason}`
                     ).join("\n");
  
  // Create a Blob containing the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a temporary anchor element to trigger the download
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "orders.csv");
  document.body.appendChild(link);

  // Trigger the download
  link.click();

  // Clean up
  document.body.removeChild(link);
};


  return (
    <div className="container mt-4" style={{ width: "130%", fontSize: "12px" }}>
      <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#3291a8' }}>User Orders</h2>

      <input
        type="text"
        placeholder="Search Orders"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ marginBottom: '1rem', padding: '0.5rem', marginLeft: "-7%" }}
      />
<button className="btn mb-3" onClick={handleDownloadOrders} style={{marginLeft:"88%",marginTop:"2%",color:"#005087"}}><DownloadIcon /></button>
      {filteredOrders.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "25px", fontWeight: "bold", marginTop: "10%" }}>No orders available.</p>
      ) : (
        <div>
          
          <table className="table table-bordered table-hover" style={{ width: "114%", marginLeft: "-8%" }}>
            <thead className="thead-dark" style={{ backgroundColor: '#005087', color: '#fff', textAlign: "center" }}>
              <tr className='bg-info'>
                <th scope="col" style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', backgroundColor: "#65becf" }} className='text-white'>User ID</th>
                <th scope="col" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', backgroundColor: "#65becf" }} className='text-white'>Product Image</th>
                <th scope="col" style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', backgroundColor: "#65becf" }} className='text-white'>Brand</th>
                <th scope="col" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', backgroundColor: "#65becf" }} className='text-white'>Title</th>
                <th scope="col" style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', backgroundColor: "#65becf" }} className='text-white'>Product ID</th>
                <th scope="col" style={{ maxWidth: '80px', whiteSpace: 'nowrap', overflow: 'hidden', backgroundColor: "#65becf" }} className='text-white'>Quantity</th>
                <th scope="col" style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', backgroundColor: "#65becf" }} className='text-white'>Payment Mode</th>
                <th scope="col" style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', backgroundColor: "#65becf" }} className='text-white'>Amount Paid </th>
                <th scope="col" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', backgroundColor: "#65becf" }} className='text-white'>Order Id</th>
                <th scope='col' style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', backgroundColor: "#65becf" }} className='text-white'>Address</th>
                <th scope='col' style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', backgroundColor: "#65becf" }} className='text-white'>Status</th>
                <th scope='col' style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', backgroundColor: "#65becf" }} className='text-white'>Cancellation Reason</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.order_id} style={{ fontWeight:"bold" }}>
                  <td>{order.user_id}</td>
                  <td>
                    <img
                      src={`${baseURL}/${order.image_path}`}
                      alt={order.title}
                      style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px' }}
                    />
                  </td>
                  <td>{order.brand}</td>
                  <td>{order.title}</td>
                  <td>{order.product_id}</td>
                  <td>{order.quantity}</td>
                  <td>{order.payment_mode}</td>
                  <td>{order.total_amount}</td>
                  <td>{order.order_id}</td>
                  <td>{order.address}</td>
                  <td>{order.status}</td>
                  <td>{order.cancellation_reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Orders;
