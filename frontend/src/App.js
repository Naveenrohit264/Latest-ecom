import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  Route,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import { useContext, useEffect } from "react";
import AdminPage from "./components/AdminPage";
import { AuthContext } from "./context/authContext";
import Register from "./components/Register";
import Login from "./components/Login";
import Orders from "./components/Orders";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOtp from "./components/VerifyOtp";
import PasswordReset from "./components/PasswordReset";
import ProductList from "./components/ProductList";
import ProductDetails from "./components/ProductDetails";
import Home from "./components/Home";
import WishList from "./components/WishList";
import Cart from "./components/Cart";
import Rating from "./components/Rating";
import Address from "./components/Address";
import Ordersuccessfull from "./components/Ordersuccessfull";
import EditAddress from "./components/EditAddress";
import AddCoupons from "./components/AddCoupons";
import Search from './components/Search';
import EditStock from "./components/EditStock";
import BarGraph from "./components/Bargraph";
import AllProductsGraph from "./components/AllProductsGraph";
import OrderDetails from "./components/OrderDetails";
import PictorialOrders from "./components/PictorialOrders";

function App() {
  const { currentUser } = useContext(AuthContext);

  const Layout = () => {
    return (
      <div className="light">
        <div>
          <Outlet />
        </div>
      </div>
    );
  };

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/" />;
    }

    return children;
  };

  const RedirectIfLoggedIn = ({ children }) => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
      if (currentUser) {
        // User is already logged in
        if (currentUser.email === "flybuydefenders@gmail.com") {
          // Redirect to the admin page if the email matches
          navigate("/adminpage");
        } else {
          // Redirect to the home page for other users
          navigate("/home");
        }
      }
    }, [currentUser, navigate]);

    // Always render the children
    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <RedirectIfLoggedIn>
          <Login />
        </RedirectIfLoggedIn>
      ),
    },
    
    {
      path: "/register",
      element: (
        <RedirectIfLoggedIn>
          <Register />
        </RedirectIfLoggedIn>
      ),
    },
    {
      path: "/forgotpassword",
      element: (
        <RedirectIfLoggedIn>
          <ForgotPassword />
        </RedirectIfLoggedIn>
      ),
    },
    {
      path: "/VerifyOtp",
      element: <VerifyOtp />,
    },
    {
      path: "/PasswordReset",
      element: <PasswordReset />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/productlist",
          element: <ProductList />,
        },
        {
          path: "/home",
          element: <Home />,
        },
        
        {
          path: "/cart",
          element: <Cart />,
        },
        {
          path: "/ordersuccessfull",
          element: <Ordersuccessfull />,
        },
        {
          path: "/orders",
          element: <Orders />,
        },
        {
          path: "/Pictorialorders",
          element: <PictorialOrders />,
        },
        {
          path: "/search",
          element: <Search />,
        },
        {
          path: "/allproductsgraph",
          element: <AllProductsGraph />,
        },
        {
          path: "/productdetails/:id",
          element: <ProductDetails />,
        },
        {
          path:"/edit/:id",
          element: <EditAddress />,
        },

       
        {
          path: "/wishlist",
          element: <WishList />,
        },
        {
          path: "/orderdetails",
          element: <OrderDetails />,
        },
        {
          path: "/adminpage",
          element: <AdminPage />,

        },

        {
          path: "/addcoupons",
          element: <AddCoupons />,
          
        },
        {
          path: "/editstock",
          element: <EditStock />,
          
        },
        {
          path: "/rating/:id",
          element: <Rating />,
        },
        {
          path: "address",
          element: <Address />,
        },
        {
          path: "bargraph",
          element: <BarGraph />,
        },
      ],
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
