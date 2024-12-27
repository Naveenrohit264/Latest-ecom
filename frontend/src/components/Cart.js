import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styles from './Cart.module.css';
import ConfirmationModal from './ConfirmationModal'; // Import the new component
import { AuthContext } from '../context/authContext';
import Header from "./Header";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditIcon from '@mui/icons-material/Edit';




const Cart = () => {
  const { currentUser } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(); // New state to store the selected address ID
  const [paymentMethod, setPaymentMethod] = useState(''); // Default to COD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [razorpayOptions, setRazorpayOptions] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);


  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/cart/${currentUser.id}`);
        const initialCartItems = response.data;
        setCartItems(initialCartItems);
        setSelectedItems(initialCartItems); // Initially select all items
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    if (currentUser) {
      fetchCartItems();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axios.get('http://localhost:8800/coupons'); // Assuming your backend server is running on the same host
        setCoupons(response.data);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };

    fetchCoupons();
  }, []);

  const initializeRazorpay = async (amount, selectedAddressId) => {
    try {
      if (!amount) {
        throw new Error('Amount is required for Razorpay initialization.');
      }
  
      if (!selectedAddressId) {
        throw new Error('Selected address ID is required for Razorpay initialization.');
      }
  
      const response = await axios.post('http://localhost:8800/api/razorpay/init', {
        amount: amount * 100,
        currency: 'INR',
        selectedAddressId: selectedAddressId // Pass selectedAddressId to the API endpoint
      });
  
      if (!response.data.amount) {
        throw new Error('Amount field is missing in the response data');
      }
  
      const options = {
        key: 'rzp_test_VKZJRNMqJeXNhH',
        amount: response.data.amount,
        currency: response.data.currency,
        name: 'FLYBUY',
        description: 'Payment for your order',
        order_id: response.data.id,
        handler: async function (response) {
          console.log('Payment successful:', response);
          saveOrderDetails();
          window.location.href = '/ordersuccessfull';
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
        },
        theme: {
          color: '#F37254',
        },
      };
  
      setRazorpayOptions(options);
    } catch (error) {
      console.error('Error initializing Razorpay:', error.message);
      // Handle the error gracefully, show a message to the user, etc.
    }
  };
  

  const calculateTotalAmount = () => {
    return selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    newQuantity = Math.max(1, newQuantity);

    const updatedCartItems = cartItems.map((item) =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    );

    setCartItems(updatedCartItems);

    // Update selectedItems when the quantity changes
    const updatedSelectedItems = updatedCartItems.filter((item) =>
      selectedItems.some((selectedItem) => selectedItem.product_id === item.product_id)
    );

    setSelectedItems(updatedSelectedItems);

    try {
      // Make API call to update quantity in the database
      await axios.patch(`http://localhost:8800/cart/${productId}`, { quantity: newQuantity });
    } catch (error) {
      console.error('Error updating quantity in the database:', error);
      // If the update fails, you may want to handle this by reverting the local state or showing an error message.
    }
  };

  const handleRemoveItem = (productId) => {
    setItemToRemove(productId);
    setIsModalOpen(true);
  };

  const confirmRemoveItem = async () => {
    // Remove the item from both cartItems and selectedItems
    const updatedCartItems = cartItems.filter((item) => item.product_id !== itemToRemove);
    const updatedSelectedItems = selectedItems.filter((item) => item.product_id !== itemToRemove);

    setCartItems(updatedCartItems);
    setSelectedItems(updatedSelectedItems);

    try {
      // Make API call to remove the item from the database
      await axios.delete(`http://localhost:8800/cart/${itemToRemove}`);
      window.location.reload();
    } catch (error) {
      console.error('Error removing item from the database:', error);
      // Handle error, show a message, etc.
    }

    setIsModalOpen(false);
    setItemToRemove(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setItemToRemove(null);
  };

  const handleCheckboxChange = (productId) => {
    const isChecked = selectedItems.some((item) => item.product_id === productId);

    if (isChecked) {
      const updatedSelectedItems = selectedItems.filter((item) => item.product_id !== productId);
      setSelectedItems(updatedSelectedItems);
    } else {
      const selectedItem = cartItems.find((item) => item.product_id === productId);
      setSelectedItems([...selectedItems, selectedItem]);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    console.log('Selected items:', selectedItems);
    console.log('Selected address ID:', selectedAddressId);
    console.log('Payment method:', paymentMethod);
  
    if (selectedItems.length === 0) {
      alert('Please select items before placing an order.');
      return;
    }
  
    if (!selectedAddressId) {
      toast.success('Please provide all address details before placing an order.', {
        autoClose: 1000,
        position: toast.POSITION.TOP_CENTER
      });
      return;
    }
  
    if (!paymentMethod) {
      toast.error('Please select a payment mode before placing an order.', {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER
      });
      return;
    }
  
    try {
      if (paymentMethod === 'cod') {
        await saveOrderDetails(selectedAddressId);
  
        const updatedCartItemsResponse = await axios.get(`http://localhost:8800/cart/${currentUser.id}`);
        const updatedCartItems = updatedCartItemsResponse.data;
  
        setCartItems(updatedCartItems);
        setSelectedItems(updatedCartItems);
  
        navigate('/ordersuccessfull');
      } else if (paymentMethod === 'razorpay') {
        const totalAmount = calculateTotalAmount();
        await initializeRazorpay(totalAmount, selectedAddressId); // Pass selectedAddressId to initializeRazorpay
  
        if (razorpayOptions) {
          const razorpayInstance = new window.Razorpay(razorpayOptions);
  
          razorpayInstance.on('payment.success', async function (response) {
            console.log('Payment successful:', response);
  
            await saveOrderDetails(selectedAddressId);
  
            const updatedCartItemsResponse = await axios.get(`http://localhost:8800/cart/${currentUser.id}`);
            const updatedCartItems = updatedCartItemsResponse.data;
  
            setCartItems(updatedCartItems);
            setSelectedItems(updatedCartItems);
  
            razorpayInstance.close();
  
            setCartItems([]);
            setSelectedItems([]);
  
            navigate('/ordersuccessfull');
          });
  
          razorpayInstance.on('payment.error', function (response) {
            console.error('Payment error:', response);
            toast.success('Payment Failed', {
              autoClose: 1000,
              position: toast.POSITION.TOP_CENTER
            });
          });
  
          razorpayInstance.open();
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };
  
  const handleDeleteAddress = (addressId) => {
    axios.delete(`http://localhost:8800/delete-address/${addressId}`)
      .then(response => {
        console.log('Address deleted successfully:', response.data);
        // Remove the deleted address from the addresses array
        setAddresses(prevAddresses => prevAddresses.filter(address => address.id !== addressId));
      })
      .catch(error => {
        console.error('Error deleting address:', error);
      });
  };
  
  

  const saveOrderDetails = async () => {
    try {
      const orderDetails = {
        userId: currentUser.id,
        addressId: selectedAddressId, // Include the selected address ID
        items: selectedItems.map((item) => ({
          product_id: item.product_id,
          title: item.title,
          quantity: item.quantity,
          brand: item.brand,
          price: item.price,
          image_path: item.image_path,
        })),
        totalAmount: calculateTotalAmount(),
        paymentMode: paymentMethod,
        email: currentUser.email, // Include the email address
      };
  
      // Make API call to save order details
      await axios.post('http://localhost:8800/orders', orderDetails);
  
      console.log('Order details saved successfully!');
    } catch (error) {
      console.error('Error saving order details:', error);
      // Handle error, show a message, etc.
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8800/address');
        setAddresses(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error (e.g., show an error message to the user)
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    // Only initialize Razorpay if there are selected items
    if (selectedItems.length > 0) {
      const newTotalAmount = calculateTotalAmount();
      initializeRazorpay(newTotalAmount);
    }
  }, [selectedItems]); // Dependency array includes selectedItems to trigger the effect on changes

  const handleApplyCoupon = () => {
    const selectedCoupon = coupons.find(coupon => coupon.coupon_code === appliedCoupon);
  
    if (selectedCoupon) {
      // Check if the coupon is not expired
      const currentDate = new Date();
      const expiryDate = new Date(selectedCoupon.expiry_date);
      if (expiryDate < currentDate) {
        toast.error('Coupon has expired.');
        return;
      }
  
      // Calculate the total amount based on the prices of items in the cart
      const totalAmount = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  
      // Check if the total amount meets the minimum purchase condition
      if (totalAmount < selectedCoupon.minimum_purchase) {
        toast.error('Minimum purchase amount not met.');
        return;
      }
  
      const matchingItem = selectedItems.find(item => item.product_id === selectedCoupon.id);
  
      if (matchingItem) {
        const discountAmount = (matchingItem.price * selectedCoupon.discount_percentage) / 100;
        matchingItem.price -= discountAmount;
        setDiscountApplied(discountAmount); // Set the discount applied
        setCouponApplied(true);
        toast.success(`Coupon applied successfully. You got ${selectedCoupon.discount_percentage}% off.`);
      } else {
        toast.error('No matching product found in the cart for this coupon.');
      }
    } else {
      toast.error('Invalid coupon code.');
    }
  };
  
  
  return (
    <div>
      <Header />
      <ToastContainer />
      <div className={styles.cartContainer} style={{backgroundColor:"white"}}>
      <h2 className={styles.cartTitle} style={{textAlign:"center",marginLeft:"3%"}}>My Cart</h2>
        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
           
           <img
  src="anim.gif"
  alt="Empty Cart"
  className={styles.emptyCartImage}
  style={{ width: "50%", height: "330px",marginLeft:"25%",backgroundColor:"transparent",marginTop:"0%"}}
/>

            <h4 className={styles.emptyCartText} style={{textAlign:"center"}}>
              Cart's feeling empty! Let's spice it up with some must-haves. 🛍️

             
            </h4>
          
            <Link to="/home" style={{marginLeft:"45%"}} ><button style={{backgroundColor:"#65becf",color:"white",marginTop:"1%"}}>View Products</button></Link>
           
          </div>
        ) : (
          <div>
            {cartItems.map((item) => (
              <div key={item.product_id} className={styles.cartItem}>
                <ConfirmationModal
                  isOpen={isModalOpen}
                  onClose={closeModal}
                  onConfirm={confirmRemoveItem}
                />
                <Link to={`/productdetails/${item.product_id}`} className={styles.productLink} style={{textDecoration:"none"}}>
                  <div className={styles.productInfo}>
                    <img src={`http://localhost:8800/${item.image_path}`} alt={item.product_id} className={styles.productImage} />
                    <div className={styles.productDetails} style={{color:"black",fontWeight:"bold"}}>
                    <p className={styles.productTitle} >{item.title}</p>
                      <p className={styles.productBrand} style={{fontWeight:"600"}}>{item.brand}</p>
                      <p className={styles.productPrice} style={{fontWeight:"600"}}>Rs.{item.price}</p>
                      
                      <p className={styles.coupon_code}>{item.coupon_code}</p>
                    </div>
                  </div>
                </Link>
                <div className={styles.quantity}>
                  <button onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)} className={styles.quantityButton} style={{fontWeight:"bold"}}>-</button>
                  <span style={{fontWeight:"600"}}>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)} className={styles.quantityButton} style={{fontWeight:"bold"}}>+</button>
                </div>
                <button onClick={() => handleRemoveItem(item.product_id)} className={styles.removeButton}><DeleteOutlineIcon /></button>
                <input
                  type="checkbox"
                  checked={selectedItems.some((selectedItem) => selectedItem.product_id === item.product_id)}
                  onChange={() => handleCheckboxChange(item.product_id)}
                  className={styles.checkbox}
                  style={{width:"80px",height:"20px",marginLeft:'20%'}}
                />
              </div>
            ))}
            <div className={styles.breakdown}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 
  
  {/* Offers & Coupons Section */}
  <div style={{ backgroundColor: 'white', padding: '1rem', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', width:"70%", minWidth:"70%" }}>
  <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>Offers & Coupons</h2>
  {!couponApplied && (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        value={appliedCoupon}
        onChange={(e) => setAppliedCoupon(e.target.value)}
        placeholder="Enter coupon code"
        style={{
          padding: '0.5rem',
          marginRight: '1rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '1rem',
          flex: '1'
        }}
      />
      <button onClick={handleApplyCoupon} style={{ padding: '0.5rem 1rem', fontSize: '1rem', color: 'white', backgroundColor: '#65becf', border: 'none', fontWeight:"bold", cursor: 'pointer' }}>Apply Coupon</button>
    </div>
  )}
  {/* Render coupons */}
  <ul style={{ marginTop: '1rem', padding: 0 }}>
  {coupons.filter(coupon => {
    // Filter based on brand match and check if the coupon is not expired
    const applicableProducts = cartItems.some(item => item.brand === coupon.brand);
    const isNotExpired = new Date(coupon.expiry_date) > new Date(); // Check if the coupon is not expired
    return applicableProducts && isNotExpired;
  }).length > 0 ? (
    coupons.map((coupon) => {
      // Filter coupons based on products in the cart and expiration
      const applicableProducts = cartItems.filter(item => item.brand === coupon.brand);
      const isNotExpired = new Date(coupon.expiry_date) > new Date();

      if (applicableProducts.length > 0 && isNotExpired) {
        // Ensure valid values for discount_percentage and minimum_purchase
        const discountPercentage = parseInt(coupon.discount_percentage) || 0;
        const minimumPurchase = parseInt(coupon.minimum_purchase) || 0;

        return (
          <li key={coupon.coupon_code} style={{ listStyle: 'none', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '1rem', color: '#333', fontWeight: "600" }}>
              Use code <>{coupon.coupon_code}</> to get <>{discountPercentage}%</> off on a minimum purchase of <>&#x20b9;{minimumPurchase}</> on {coupon.brand}
              {couponApplied && appliedCoupon === coupon.coupon_code && (
                <span style={{ color: 'green', marginLeft: '0.5rem' }}> - Applied (Discount: &#x20b9;{discountApplied})</span>
              )}
            </p>
          </li>
        );
      }
      return null; // Return null for coupons that are not applicable or expired
    })
  ) : (
    <p style={{ fontSize: '1rem', color: '#333', fontWeight: "600" }}>No coupons available</p>
  )}
</ul>

</div>


  {/* Price Details Section */}
  <div style={{ backgroundColor: 'white', padding: '1rem',  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',width:"25%",fontWeight:"600" }}>
    <h4>Price details:</h4>
    {selectedItems.map((item) => (
      <p key={item.product_id} className={styles.itemPrice}>{`${item.title} ( ${item.quantity} items ) = Rs.${item.price * item.quantity}`}</p>
      
    ))}
   
    <p>Discount={discountApplied} </p>
    <div className={styles.total}>
      <hr ></hr>
      <p className={styles.totalAmount} style={{fontWeight:"500"}}>Amount Payable: &#x20b9;{calculateTotalAmount()}</p>
      <hr></hr>
    </div>
  
  </div>
</div>


<div style={{ backgroundColor: 'white', padding: '1rem', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',marginTop:"1%",width:"70%" }}>
  {/* Add Address Link */}
  <Link to="/address" className={styles.addAddressLink} style={{textDecoration:"none"}}>
    <AddCircleOutlineIcon className={styles.addAddressIcon} />Address
  </Link>




  <ul style={{ listStyle: 'none', padding: 0 }}>
        {addresses
          .filter(address => address.user_id === currentUser.id)
          .map(address => (
      <li key={address.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <input
          type="radio"
          name="selectedAddress"
          value={address.id}
          onChange={() => setSelectedAddressId(address.id)}
          style={{ marginRight: '10px' }}
        />
        <label style={{ flex: 1,fontWeight:"600" }}>
          <>Flat No:</> {address.flat_no},{' '}
          <>Plot No:</> {address.plot_no},{' '}
          <>Area:</> {address.area},{' '}
          <>Pincode:</> {address.pincode},{' '}
          <>Mobile Number:</> {address.mobile_number}
        </label>
        <Link to={`/edit/${address.id}`} style={{ marginRight: '10px' }}>
          <EditIcon />
        </Link>
        <button onClick={() => handleDeleteAddress(address.id)} style={{backgroundColor:"#65becf"}}><DeleteOutlineIcon /></button> 
      </li>
    ))}
</ul>



</div>



            </div>
            <div style={{ backgroundColor: 'white', padding: '1rem',  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',width:"70%",marginTop:"1%" }}>
  <div className={styles.paymentOptions}>
    <h3>Select Payment Method:</h3>
    <div className={styles.paymentMethod}>
      <label className={styles.paymentLabel} style={{fontWeight:"600"}}>
        <input
          type="radio"
          value="cod"
          checked={paymentMethod === 'cod'}
          onChange={() => handlePaymentMethodChange('cod')}
          className={styles.paymentInput}
          
        />
        Cash On Delivery (COD)
      </label>
    </div>
    <div className={styles.paymentMethod}>
      <label className={styles.paymentLabel} style={{fontWeight:"600"}}>
        <input
          type="radio"
          value="razorpay"
          checked={paymentMethod === 'razorpay'}
          onChange={() => handlePaymentMethodChange('razorpay')}
          className={styles.paymentInput}
        />
        RazorPay
      </label>
    </div>
  </div>
  <button onClick={handlePlaceOrder} className={styles.placeOrderButton} style={{ backgroundColor: '#65becf',fontWeight:"bold", color: 'white',  padding: '0.5rem 1rem', fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
    {paymentMethod === 'razorpay' ? 'Pay with RazorPay' : 'Place Order'}
  </button>
</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
