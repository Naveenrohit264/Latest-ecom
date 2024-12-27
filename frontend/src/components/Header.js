import React, { useContext, useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import styles from './Header.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import Logo from './Logo';
import axios from 'axios';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import {
  faShoppingCart,
  faUser,
  faSignOutAlt,
  faClipboardList,
  faGift,
  faIdCard,
  faHeart,
  faEdit,
  faEye,
} from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useContext(AuthContext);
  const [productCount, setProductCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [products, setProducts] = useState([]);
  
const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
const [allProductsCount, setAllProductsCount] = useState(0);





const toggleProfileDropdown = () => {
  setProfileDropdownOpen(!isProfileDropdownOpen);
};



  const fetchProductCount = async () => {
    try {
      const response = await axios.get(`http://localhost:8800/product-count/${currentUser.id}`);
      setProductCount(response.data.count);
    } catch (error) {
      console.error('Error fetching product count:', error);
    }
  };

  

  const getProductImage = (product) => {
    return product ? `http://localhost:8800/${product.image_path}` : '';
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8800/allproducts');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAllProductsCount = async () => {
      try {
        const response = await axios.get('http://localhost:8800/allproducts-count');
        setAllProductsCount(response.data.count);
      } catch (error) {
        console.error('Error fetching all products count:', error);
      }
    };

    fetchAllProductsCount();
  }, []);

  const fetchAllProductData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/all-product-data');
      const productsWithTimeAgo = response.data.products.map((product) => ({
        ...product,
        timeAgo: formatDistanceToNow(new Date(product.created_at), { addSuffix: true }),
      }));
      // Sort products by created_at in descending order
      const sortedProducts = productsWithTimeAgo.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(sortedProducts);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };
  
  const handleProductAdded = () => {
    fetchProductCount();
  };

  const handleNotificationClick = async () => {
    await fetchAllProductData();
    setShowNotifications((prev) => !prev);
  };

  const handleLogoutClick = async () => {
    if (!showNotifications) {
      try {
        await handleLogout();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.log(err);
    }
  };

  // Disable other button clicks when notifications are shown
  const handleOtherButtonClick = () => {
    if (!showNotifications) {
      
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProductCount();
    }

    document.addEventListener('productAdded', handleProductAdded);

    // Add an event listener to close notifications on outside click
    const closeNotificationsOnOutsideClick = (event) => {
      if (!event.target.closest(`.${styles.notificationdetails}`)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', closeNotificationsOnOutsideClick);

    return () => {
      document.removeEventListener('productAdded', handleProductAdded);
      document.removeEventListener('click', closeNotificationsOnOutsideClick);
    };
  }, [currentUser]);

  return (
    <div className={styles.navbarContainer}>
      <div className={styles.logo} >
        <Logo  />
      </div>
      <div className={styles.navItems}>
        <Link to="/home" style={{ textDecoration: 'none',marginTop:"-1.5%" }}>
          <div className={styles.navItem} onClick={handleOtherButtonClick}>
            Home
          </div>
        </Link>
        <Link to="/cart" style={{ textDecoration: 'none',marginTop:"-1.5%" }}>
          <div className={styles.navItem} onClick={handleOtherButtonClick}>
            <ShoppingCartIcon />{productCount}
          </div>
        </Link>

        <Link to="/wishlist" style={{ textDecoration: 'none',marginTop:"-1.5%" }}>
          <div className={styles.navItem} onClick={handleOtherButtonClick}>
           Wishlist
          </div>
        </Link>
        <Link to="/orders" style={{ textDecoration: 'none',marginTop:"-1.5%" }}>
          <div className={styles.navItem} onClick={handleOtherButtonClick}>
           Orders
          </div>
        </Link>
        <Link to="/Search" style={{ textDecoration: 'none',marginTop:"-1%" }}>
  <div onClick={handleOtherButtonClick}>

    <div className={styles.searchBar}>
    
      <input
      
        type="text"
        placeholder="           Search Products"
      
        className={styles.searchInput}
      />
     <SearchIcon className={styles.searchIcon} style={{color:"black"}} />
    </div>
  </div>
</Link>

        <div className={styles.notificationdetails} style={{marginTop:"-1.5%"}}>
  <div className={styles.navItem} onClick={handleNotificationClick}>
    <NotificationsIcon />
    <span>{allProductsCount}</span>

  </div>

  {showNotifications && (
    <div className={styles.notificationContainer}>
      <ul>
        {notifications.map((product, index) => (
          <Link key={index} to={`/productdetails/${product.id}`} style={{textDecoration:"none"}}>
            <li>
              <div>
                <img
                  src={`http://localhost:8800/${product.image_path}`}
                  alt="Product Image"
                  style={{ width: '90px', height: '70px', marginRight: '10px' }}
                />
              </div>
              <div>
                <div style={{color:"black",fontWeight:"bold"}}>{product.title}</div>
                <div style={{color:"black"}}>{product.timeAgo}</div>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  )}
</div>
<li className={styles.navItem} style={{ textDecoration: "none", marginTop: "-1.5%", listStyle: "none" }}>
  <div className={styles.dropdown} style={{ textDecoration: "none" }}>
    <Link to="#" className={styles['nav-link']} onClick={toggleProfileDropdown} style={{ textDecoration: "none",color:"white" }}>
      <PermIdentityIcon /> {currentUser.username}
    </Link>
    {isProfileDropdownOpen && (
          <div className={styles['dropdown-content']}>
            <div className={styles['column']}>
              <Link to='/orders' className={styles['nav-link']}><FontAwesomeIcon icon={faClipboardList} /> Orders</Link>
              {/* <Link to='/OverView' className={styles['nav-link']}>
  <FontAwesomeIcon icon={faEye} /> OverView
</Link> */}
              {/* <Link to='/EditProfile' className={styles['nav-link']}><FontAwesomeIcon icon={faEdit} /> EditProfile</Link> */}
              <Link to='/wishlist' className={styles['nav-link']}><FontAwesomeIcon icon={faHeart} /> Wishlist</Link>
              <Link to='#' className={styles['nav-link']} onClick={handleLogoutClick}>
        <FontAwesomeIcon icon={faSignOutAlt} /> Logout
    </Link>
            </div>
          </div>
        )}
      </div>
    </li>
      </div>
    </div>
  );
};
export default Navbar;