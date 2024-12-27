import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Header from "./Header";
import styles from './Wishlist.module.css';
import DeleteIcon from '@mui/icons-material/Delete';

const Wishlist = () => {
  const { currentUser } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // State to track loading state
  const [removingItem, setRemovingItem] = useState(null); // State to track item removal

  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        const response = await fetch(`http://localhost:8800/wishlist/${currentUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch wishlist items');
        }
        const data = await response.json();
        console.log(data);
        // Filter out duplicate products
        const uniqueItems = data.filter((item, index, self) =>
          index === self.findIndex(t => (
            t.productId === item.productId
          ))
        );
        setWishlistItems(uniqueItems);
        setLoading(false); // Set loading to false after data fetching is complete
      } catch (error) {
        setError(error.message);
      }
    };
    fetchWishlistItems();
  }, [currentUser.id]);

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8800/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setRemovingItem(productId); // Set the removing item ID
        setTimeout(() => {
          setWishlistItems(prevItems => prevItems.filter(item => item.productId !== productId));
          setRemovingItem(null); // Reset removing item ID
        }, 1000); // Wait for the animation to finish before removing the item
      } else {
        throw new Error('Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div>
      <div className={styles.wishlistHeader}>
       <Header />
       
      </div>
      <div className={styles.wishlistContent} style={{marginTop:"10%"}}>
      <h2 className={styles.wishlistHeading} style={{marginLeft:"45%"}}>My Wishlist ({wishlistItems.length})</h2>
      {wishlistItems.length === 0 ? (
         <div className={styles.emptyWishlist}>
           
           <p style={{fontWeight:"bold",fontSize:"25px",marginTop:"-20%",marginLeft:"5%"}}>Your wishlist is empty. Start adding products!</p>
           <Link to="/home" style={{marginLeft:"45%"}} ><button style={{backgroundColor:"#527fc7",color:"white",marginTop:"1%"}}>View Products</button></Link>
         </div>
      ) : (
        <div>
          
          <div className={styles.wishlistContainer}>
          {wishlistItems.map((item, index) => (
            
  <div key={index} className={`${styles.wishlistItem} ${removingItem === item.productId ? styles.removing : ''}`} style={{ width: "106%", marginLeft: "-10%", marginBottom: "20px", padding: "20px", backgroundColor: "#fff",  boxShadow: "0 20px 40px 40px rgba(0, 0, 0, 0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background-color 0.3s ease" }}>
    <Link to={`/ProductDetails/${item.productId}`} className={styles.link} style={{textDecoration:"none"}}>
    <div className={styles.wishlistItemContent} style={{ display: "flex", alignItems: "center" }}>
      
      <img className={styles.wishlistItemImage} src={`http://localhost:8800/${item.imagePath}`} alt={item.productTitle} style={{ width: "120px", height: "120px", objectFit: "cover", marginRight: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }} />
      <div className={styles.wishlistItemDetails}>
        <h3 style={{ margin: "0", marginBottom: "5px", fontSize: "20px", fontWeight: "bold", color: "#333" }}>{item.productTitle}</h3>
        <p style={{ margin: "0", marginBottom: "10px", fontSize: "16px", color: "#666" }}>{item.productDescription}</p>
        <p style={{ margin: "0", fontSize: "18px", fontWeight: "bold", color: "#333" }}>Rs.{item.productCost}</p>
       
      </div>
     
    </div>
    </Link>
    <DeleteIcon className={styles.wishlistItemRemove} icon={faTimes} onClick={() => removeFromWishlist(item.productId)} style={{ cursor: "pointer", color: "#65becf", fontSize: "24px", transition: "color 0.3s ease" }} />
  </div>
  
))}

          </div>
        </div>
      )}
    </div>
    </div>
  ); 
};

export default Wishlist;
