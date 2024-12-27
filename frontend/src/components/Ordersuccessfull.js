import React from 'react';
import { Link } from 'react-router-dom';

const OrderPlaced = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Local Video */}
      <div>
        <video width="1200" height="250" autoPlay loop muted style={{ marginTop: '100px' }}>
          <source src="/order_successfull.mp4" type="video/mp4" />
        </video>
      </div>
      <div>
        <h1 style={{ margin: '0 auto', marginTop: '50PX' }}>Thank you for shopping with us.</h1>
        <Link to="/home">
        <button style={{ marginTop: '20px', backgroundColor: "#65becf", color: "#ffffff" }}>Continue Shopping</button>

        </Link>
      </div>
    </div>
  );
};

export default OrderPlaced;
