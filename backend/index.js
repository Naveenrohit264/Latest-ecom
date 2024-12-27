const express = require("express");
const app = express();
const cors = require("cors");
const cron = require('node-cron');
const cookieParser = require("cookie-parser");
const multer = require("multer");
const nodemailer = require("nodemailer");
const { connection } = require("./connect.js");
const bcrypt = require("bcryptjs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const session = require("express-session");
const { checkUserToken } = require("./middleware/authentication.js");
const Razorpay = require('razorpay');
// importing routes

const dotenv = require("dotenv");
// const fileUpload = require('express-fileupload')

dotenv.config();


app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});


app.use(
  session({
    secret: "your-secret-key", // Change this to a strong, secure secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true in production if using HTTPS
  })
);


app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());




app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const handleDatabaseError = (err, res, message) => {
  console.error(message, err);
  return res.status(500).json({ error: "Internal Server Error" });
};



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });


app.post('/upload', upload.single('image'), (req, res) => {
  try {
    // Extract form data from the request body
    const { title, brandName, productCost, description, category, quantity, gstPercentage } = req.body;

    // Log received data for debugging
    console.log('Received data:', { title, brandName, productCost, description, category, quantity, gstPercentage });

    // Parse productCost and gstPercentage to numbers
    const parsedProductCost = parseFloat(productCost);
    const parsedGstPercentage = parseFloat(gstPercentage);

    // Log parsed values for debugging
    console.log('Parsed values:', { parsedProductCost, parsedGstPercentage });

    // Validate that the values are valid numbers
    if (isNaN(parsedProductCost) || isNaN(parsedGstPercentage)) {
      console.error('Invalid number value for productCost or gstPercentage');
      return res.status(400).json({ error: 'Invalid input data: productCost and gstPercentage must be numbers' });
    }

    // Get the uploaded image file path
    const imagePath = req.file.path;

    // If 'rating' is not present in the form data, set it to null
    const rating = req.body.rating || null;

    // Calculate GST amount
    const gstAmount = parsedProductCost * (parsedGstPercentage / 100);

    // Calculate actual cost by subtracting GST amount from product cost
    const actualCost = parsedProductCost - gstAmount;

    // Ensure that actualCost is a valid number
    if (isNaN(actualCost)) {
      console.error('Error calculating actualCost');
      return res.status(500).json({ error: 'Error calculating actualCost' });
    }

    // Save data to MySQL database
    connection.query(
      'INSERT INTO Allproducts (title, Brand, product_cost, description, category, image_path, rating, quantity, available, actual_cost, gst_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, brandName, parsedProductCost, description, category, imagePath, rating, quantity, quantity, actualCost.toFixed(2), parsedGstPercentage],
      (err, results) => {
        if (err) {
          console.error('Error saving data to MySQL:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Send a success response
        res.json({ success: true });
      }
    );
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/adminproducts', (req, res) => {
  // Query the database to retrieve product name and quantity
  connection.query('SELECT * FROM Allproducts', (err, results) => {
    if (err) {
      console.error('Error retrieving product data from MySQL:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Send the product data as JSON response
    res.json(results);
  });
});

// Update coupon details endpoint
app.put('/coupon/:productId', (req, res) => {
  const productId = req.params.productId;
  const { coupon_code, discount_percentage, minimum_purchase, expiry_date } = req.body;

  // Update query
  const updateQuery = `UPDATE allproducts 
                      SET coupon_code = ?, 
                          discount_percentage = ?, 
                          minimum_purchase = ?, 
                          expiry_date = ? 
                      WHERE id = ?`;

  // Execute the query
  connection.query(updateQuery, [coupon_code, discount_percentage, minimum_purchase, expiry_date, productId], (error, results) => {
    if (error) {
      console.error('Error updating coupon details:', error);
      res.status(500).json({ error: 'An error occurred while updating coupon details.' });
    } else {
      console.log('Coupon details updated successfully');
      res.status(200).json({ message: 'Coupon details updated successfully' });
    }
  });
});


app.get('/allproducts', (req, res) => {
  const query = 'SELECT * FROM allproducts';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});




app.get('/address', (req, res) => {
  const query = 'SELECT * FROM addresses';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});


app.get('/product/:id', (req, res) => {
  const productId = req.params.id;

  const query = 'SELECT * FROM allproducts WHERE id = ?';

  connection.query(query, [productId], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productDetails = results[0];
    res.json(productDetails);
  });
});



app.post('/addtocart', (req, res) => {
  const { productId, userId, image_path, price, quantity, title, brand } = req.body;

  // Check if the product already exists in the cart for the given user
  connection.query(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId],
    (selectErr, selectResult) => {
      if (selectErr) {
        console.error('Error checking cart:', selectErr);
        res.status(500).json({ error: 'Error checking cart' });
      } else {
        if (selectResult.length > 0) {
          // If the product exists, update the quantity
          const updatedQuantity = selectResult[0].quantity + quantity;

          connection.query(
            'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [updatedQuantity, userId, productId],
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error('Error updating cart:', updateErr);
                res.status(500).json({ error: 'Error updating cart' });
              } else {
                console.log('Product quantity updated in cart:', updateResult);
                res.status(200).json({ message: 'Product quantity updated in cart successfully' });
              }
            }
          );
        } else {
          // If the product does not exist, insert a new cart item
          const cartItem = {
            product_id: productId,
            user_id: userId,
            image_path: image_path,
            price: price,
            quantity: quantity,
            title: title,  // Add title to the cart item
            brand: brand,  // Add brand to the cart item
          };

          connection.query('INSERT INTO cart_items SET ?', cartItem, (insertErr, insertResult) => {
            if (insertErr) {
              console.error('Error adding to cart:', insertErr);
              res.status(500).json({ error: 'Error adding to cart' });
            } else {
              console.log('Product added to cart:', insertResult);
              res.status(200).json({ message: 'Product added to cart successfully' });
            }
          });
        }
      }
    }
  );
});

// Endpoint to fetch cart count for the current user
app.get('/cartCount', (req, res) => {
  // Extract the user ID from the request
  const userId = req.query.userId; // Assuming userId is sent as a query parameter
  
  // Query to fetch cart count for the current user
  const query = 'SELECT COUNT(*) AS cartCount FROM cart_items WHERE user_id = ?';

  // Execute the query with the user ID
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching cart count:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // Send the cart count as a JSON response
    res.json({ cartCount: results[0].cartCount });
  });
});




app.get('/cart/:userId', (req, res) => {
  const userId = req.params.userId;

  connection.query('SELECT * FROM cart_items WHERE user_id = ?', [userId], (err, result) => {
    if (err) {
      console.error('Error fetching cart items:', err);
      res.status(500).json({ error: 'Error fetching cart items' });
    } else {
      res.status(200).json(result);
    }
  });
});

app.patch('/cart/:productId', (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  // Update the quantity in the database
  connection.query('UPDATE cart_items SET quantity = ? WHERE product_id = ?', [quantity, productId], (updateError, results) => {
    if (updateError) {
      console.error('Error updating quantity:', updateError);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Return the updated item
    res.json(results);
  });
});
//SIGNUP

app.get('/users', (req, res) => {
  // Query to fetch all users data from the database
  const sql = 'SELECT * FROM users';

  // Execute the query
  connection.query(sql, (error, results) => {
    if (error) {
      // If there's an error, send an error response
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // If successful, send the users data as a JSON response
      res.json(results);
    }
  });
});



app.get('/adminorders', (req, res) => {
 
  const query = `SELECT * FROM orders`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results);
    }
  });
});

app.get('/stockdata/:id', (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM allproducts WHERE id = ${id}`;
  connection.query(query, (err, result) => {
      if (err) {
          console.error('Error fetching stock data:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
      }
      if (result.length === 0) {
          res.status(404).json({ error: 'Product not found' });
          return;
      }
      res.json(result[0]);
  });
});


app.put('/stockdata/:productId', (req, res) => {
  const productId = req.params.productId;
  const updatedData = req.body;

  // Ensure that formData only contains the fields allowed to be updated
  const allowedFields = ['title', 'brand', 'product_cost', 'description', 'category','quantity', 'available'];
  const formData = {};

  // Iterate through allowed fields and add them to formData
  allowedFields.forEach(field => {
    if (updatedData[field]) {
      formData[field] = updatedData[field];
    }
  });


  // Update product data in the database
  connection.query('UPDATE allproducts SET ? WHERE id = ?', [formData, productId], (error, results) => {
    if (error) {
      console.error('Error updating product data:', error);
      res.status(500).json({ error: 'Failed to update product data' });
      return;
    }
    console.log('Product data updated successfully');
    res.status(200).json({ message: 'Product data updated successfully' });
  });
});


app.delete('/stockdata', (req, res) => {
  const productId = req.body.productId;
  const sql = `DELETE FROM allproducts WHERE id = ?`;
  connection.query(sql, [productId], (err, result) => {
    if (err) {
      console.error('Error deleting product from database:', err);
      res.status(500).json({ error: 'Failed to delete product from database' });
    } else {
      console.log('Product deleted from database');
      res.sendStatus(204); // No content (success)
    }
  });
});


app.get('/userorders', (req, res) => {
  const userId = req.query.userId;

  // Ensure userId is properly sanitized to prevent SQL injection
  const query = `SELECT * FROM orders WHERE user_id = ?`;
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results);
    }
  });
});


const { v4: uuidv4 } = require('uuid'); // Use a library to generate UUIDs
const { connect } = require("http2");

// Function to send email

const sendOrderConfirmationEmail = async (
  to,
  orderId,
  totalAmount,
  productIds
) => {
  try {
    // Create a transporter with Gmail SMTP details
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "realmdefend@gmail.com", // Replace with your email address
        pass: "hzictfxkvagjvodi", // Replace with your email password or app-specific password
      },
    });

    // Define email options with HTML body
    let mailOptions = {
      from: "realmdefend@gmail.com", // Sender address
      to: to, // Receiver address
      subject: "Order Confirmation", // Subject line
      html: `
      <div>
  <div
    style="background-color: #ffffff; padding: 20px;background-image: url('https://img.freepik.com/premium-photo/consumer-concept-mini-shopping-trolley-shopping-colored-background-minimalism-top-view_661495-6702.jpg'); background-repeat: none; background-size: cover; max-width: 600px;">

    <h1 style="color: #4CAF50; text-align: center;">Your order has been placed successfully!</h1>
    <img src="https://media.tenor.com/WsmiS-hUZkEAAAAj/verify.gif" alt="Tick"
      style="width: 20%; max-width: 600px; display: block; margin: 0 auto;">
    <p style="text-align: center;">Order ID: <strong>${orderId}</strong></p>
    <p style="text-align: center;">Total Amount: <strong>${totalAmount}</strong></p>
    <p style="text-align: center;">Product IDs: <strong>${productIds.join(
      ", "
    )}</strong></p>
  </div>
</div>
      `, // HTML body
    };

    // Send email
    let info = await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent: ", info.response);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
};





app.get('/address/:id', (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM addresses WHERE id = ${id}`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching address:', error);
      res.status(500).json({ error: 'Error fetching address' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }
    res.json(results[0]);
  });
});

// Update address by ID
app.put('/address/:id', (req, res) => {
  const id = req.params.id;
  const { flat_no, plot_no, area, pincode, mobile_number } = req.body;
  const query = `UPDATE addresses SET flat_no = ?, plot_no = ?, area = ?, pincode = ?, mobile_number = ? WHERE id = ?`;
  connection.query(query, [flat_no, plot_no, area, pincode, mobile_number, id], (error, results) => {
    if (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ error: 'Error updating address' });
      return;
    }
    res.json({ message: 'Address updated successfully' });
  });
});


cron.schedule('*/5 * * * *', async () => {
  try {
    const updateQuery = `
      UPDATE orders
      SET status = 'delivered'
      WHERE status = 'delivering'
      AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) >= 30
    `;  
    connection.query(updateQuery, (err, result) => {
      if (err) {
        console.error('Error updating delivery status:', err);
      } else {
        console.log('Delivery status updated successfully:', result.affectedRows, 'orders');
      }
    });
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Gracefully shutting down cron job and MySQL connection');
  cron.stop(); // Stop the cron job
  connection.end(); // Close MySQL connection
  process.exit(0);
});



app.post('/orders', async (req, res) => {
  const { userId, addressId, items, totalAmount, paymentMode, email } = req.body; // Extract email from the request body

  

  // Fetch the address details based on the addressId
  try {
    const addressDetails = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT flat_no, plot_no, area, pincode, mobile_number FROM addresses WHERE id = ?',
        [addressId],
        (err, result) => {
          if (err) {
            console.error('Error fetching address details:', err);
            reject(err);
          } else {
            
            resolve(result[0]); // Assuming there's only one address with the given id
          }
        }
      );
    });

    // Concatenate the address details
    const address = `${addressDetails.flat_no}, Plot ${addressDetails.plot_no}, ${addressDetails.area}, ${addressDetails.pincode}, Mobile: ${addressDetails.mobile_number}`;

    


    // Generate a unique order ID for the entire order
    const orderId = uuidv4();

    const orderItems = items.map(item => [
      orderId,
      userId,
      item.product_id,
      item.title,
      item.quantity,
      item.brand,
      item.price,
      item.image_path,
      totalAmount,
      paymentMode,
      address, // Include the concatenated address here
    ]);

    // Proceed with the database transactions
    await new Promise((resolve, reject) => {
      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          console.error('Error starting transaction:', transactionErr);
          res.status(500).json({ error: 'Error placing order' });
          reject();
        } else {
          connection.query(
            'INSERT INTO orders (order_id, user_id, product_id, title, quantity, brand, price, image_path, total_amount, payment_mode, address, status) VALUES ?',
            [orderItems.map(item => [...item, 'delivering'])], // Set status to 'delivering'
            (orderErr, orderResult) => {
              if (orderErr) {
                console.error('Error placing order:', orderErr);
                connection.rollback(() => {
                  res.status(500).json({ error: 'Error placing order' });
                  reject();
                });
              } else {
                console.log('Order placed successfully:', orderResult);

                const updatePromises = items.map(item => {
                  return new Promise((resolve, reject) => {
                    connection.query(
                      'UPDATE allproducts SET available = available - ? WHERE id = ?',
                      [item.quantity, item.product_id],
                      (updateErr) => {
                        if (updateErr) {
                          console.error('Error updating available count:', updateErr);
                          connection.rollback(() => {
                            reject('Error updating available count');
                          });
                        } else {
                          console.log('Available count updated successfully');
                          resolve();
                        }
                      }
                    );
                  });
                });

                Promise.all(updatePromises)
                  .then(() => {
                    // Add a query to delete items from cart_items table
                    connection.query(
                      'DELETE FROM cart_items WHERE user_id = ? AND product_id IN (?)',
                      [userId, items.map(item => item.product_id)],
                      (deleteErr) => {
                        if (deleteErr) {
                          console.error('Error deleting items from cart:', deleteErr);
                          connection.rollback(() => {
                            reject('Error deleting items from cart');
                          });
                        } else {
                          console.log('Items deleted from cart successfully');
                          connection.commit((commitErr) => {
                            if (commitErr) {
                              console.error('Error committing transaction:', commitErr);
                              res.status(500).json({ error: 'Error placing order' });
                              reject();
                            } else {
                              // Send order confirmation email
                              const productIds = items.map(item => item.title);
                              sendOrderConfirmationEmail(email, orderId, totalAmount, productIds);

                              res.status(200).json({ message: 'Order placed successfully!', orderId });
                              resolve();
                            }
                          });
                        }
                      }
                    );
                  })
                  .catch((error) => {
                    res.status(500).json({ error });
                    reject();
                  });
              }
            }
          );
        }
      });
    });

    // Do not include setInterval here
  } catch (error) {
    // Handle any uncaught errors here
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// In your backend route handler
app.put('/cancel/:id', (req, res) => {
  const { id: orderId } = req.params;
  const { status, cancellationReason } = req.body;

  // Update the order status and cancellation reason in the database
  connection.query(
    'UPDATE orders SET status = ?, cancellation_reason = ? WHERE order_id = ?',
    [status, cancellationReason, orderId],
    (error, results) => {
      if (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.status(200).json({ message: 'Order status updated successfully' });
    }
  );
});




app.post('/address', (req, res) => {
  const { userId, flatNo, plotNo, area, pincode, mobileNumber } = req.body;
  const query = `INSERT INTO addresses (user_id, flat_no, plot_no, area, pincode, mobile_number) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
  connection.query(query, [userId, flatNo, plotNo, area, pincode, mobileNumber], (error, results) => {
    if (error) {
      console.error('Error saving address:', error);
      res.status(500).json({ error: 'An error occurred while saving the address' });
    } else {
      res.status(201).json({ message: 'Address saved successfully' });
    }
  });
});





app.delete('/cart/:productId', (req, res) => {
  const productId = req.params.productId;

  // Perform the database update to remove the item
  const query = `DELETE FROM cart_items WHERE product_id = ?`;

  connection.query(query, [productId], (error, results) => {
    if (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json({ message: 'Item removed from cart successfully' });
    }
  });
});

app.post("/signup", async (req, res) => {
  const { username, email, mobile, password } = req.body;

  try {
    // Check if the email already exists in the database
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(
      checkEmailQuery,
      [email],
      async (emailErr, emailResults) => {
        if (emailErr) {
          console.error("Error checking email:", emailErr);
          return res
            .status(500)
            .json({ success: false, message: "Error checking email" });
        }

        if (emailResults.length > 0) {
          // If email already exists, return an error message
          return res
            .status(400)
            .json({ success: false, message: "Email already exists" });
        }

        // Check if the mobile number already exists in the database
        const checkMobileQuery = "SELECT * FROM users WHERE mobile = ?";
        connection.query(
          checkMobileQuery,
          [mobile],
          async (mobileErr, mobileResults) => {
            if (mobileErr) {
              console.error("Error checking mobile:", mobileErr);
              return res
                .status(500)
                .json({ success: false, message: "Error checking mobile" });
            }

            if (mobileResults.length > 0) {
              // If mobile number already exists, return an error message
              return res
                .status(400)
                .json({
                  success: false,
                  message: "Mobile number already exists",
                });
            }

            // Check if the password or mobile number format is incorrect
            const isValidMobile = /^\d{10}$/.test(mobile); // Validate 10 digits for mobile number
            if (!isValidMobile) {
              return res
                .status(400)
                .json({
                  success: false,
                  message: "Mobile number should be 10 digits only",
                });
            }

            // Hash the password before saving it
            const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

            // Insert the hashed password into the database
            const INSERT_USER_QUERY =
              "INSERT INTO users (username, email, mobile, password) VALUES (?, ?, ?, ?)";
            connection.query(
              INSERT_USER_QUERY,
              [username, email, mobile, hashedPassword],
              (err, userResults) => {
                if (err) {
                  console.error("Error creating user:", err);
                  return res
                    .status(500)
                    .json({ success: false, message: "Error creating user" });
                }

                // Sending welcome email
                const transporter = nodemailer.createTransport({
                  service: "gmail",
                  auth: {
                    user: "realmdefend@gmail.com", // Replace with your email address
                    pass: "hzictfxkvagjvodi", // Replace with your email password or app-specific password
                  },
                });

                const mailOptions = {
                  from: "realmdefend@gmail.com",
                  to: email,
                  subject: "Welcome to our platform!",
                  text: `Dear ${username},\nThank you for signing up! Welcome to our platform.`,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.error("Error sending email:", error);
                    // Handle error (e.g., inform the user about email sending failure)
                  } else {
                    console.log("Email sent:", info.response);
                    // Email sent successfully (you can add any additional logic here)
                  }
                });

                res
                  .status(200)
                  .json({
                    success: true,
                    message: "User created successfully",
                  });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error("Error during signup:", error);
    res
      .status(500)
      .json({ success: false, message: "Error during signup process" });
  }
});

app.get('/coupons', (req, res) => {
  const query = 'SELECT id,brand, coupon_code, discount_percentage, minimum_purchase, expiry_date FROM allproducts';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching coupons from database:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});



app.post("/signin", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const FIND_USER_QUERY =
      "SELECT * FROM users WHERE email = ? OR mobile = ?";

    connection.query(
      FIND_USER_QUERY,
      [identifier, identifier], // Check both email and mobile
      async (err, results) => {
        if (err) {
          console.error("Error finding user:", err);
          return res
            .status(500)
            .json({ success: false, message: "Error finding user" });
        }

        if (results.length > 0) {
          const user = results[0];

          const isPasswordValid = await bcrypt.compare(
            password,
            user.password
          );

          if (isPasswordValid) {
            // Continue with the sign-in process
            const timestamp = Date.now();
            const token = jwt.sign(
              { id: user.id, timestamp },
              process.env.JWT_SECRET || "secretkey"
            );
            res.cookie("accessToken", token, {
              httpOnly: true,
            });
            const { password, ...others } = user;

            return res.status(200).json(others);
          } else {
            return res
              .status(401)
              .json({ success: false, message: "Invalid credentials" });
          }
        } else {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }
      }
    );
  } catch (error) {
    console.error("Error during signin:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error during signin" });
  }
});



// forgotpassword
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "realmdefend@gmail.com", // Replace with your email address
    pass: "hzictfxkvagjvodi", // Replace with your email password or app-specific password
  },
});


const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit OTP
};

// Temporary storage for email during password reset
let emailForPasswordReset = "";

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();

    // Store the email temporarily for password reset
    emailForPasswordReset = email;

    // Check if the email exists in the users table
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(checkEmailQuery, [email], (err, results) => {
      if (err) {
        console.error("Error checking email:", err);
        return res.status(500).json({ message: "Error checking email" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Email not found. Please sign up." });
      }

      // Create the otp_storage table if it doesn't exist
      const createOTPTableQuery = `
        CREATE TABLE IF NOT EXISTS otp_storage (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp VARCHAR(10) NOT NULL
        )
      `;
      connection.query(createOTPTableQuery, (tableErr, tableResult) => {
        if (tableErr) {
          console.error("Error creating otp_storage table:", tableErr);
          return res
            .status(500)
            .json({ message: "Error creating otp_storage table" });
        }

        // Insert the email and OTP into the otp_storage table
        const insertOTPQuery =
          "INSERT INTO otp_storage (email, otp) VALUES (?, ?)";
        connection.query(
          insertOTPQuery,
          [email, otp],
          (insertErr, insertResult) => {
            if (insertErr) {
              console.error("Error inserting OTP:", insertErr);
              return res.status(500).json({ message: "Error inserting OTP" });
            }

            // Send email with OTP
            const mailOptions = {
              from: "realmdefend@gmail.com",
              to: email,
              subject: "Password Reset OTP",
              text: `Your OTP for password reset is: ${otp}`,
            };

            transporter.sendMail(mailOptions, (error) => {
              if (error) {
                console.error("Error sending email:", error);
                return res
                  .status(500)
                  .json({ message: "Failed to send OTP. Please try again." });
              } else {
                console.log("Email sent");
                return res
                  .status(200)
                  .json({ message: "OTP sent successfully." });
              }
            });
          }
        );
      });
    });
  } catch (error) {
    console.error("Error in send-otp endpoint:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { otp } = req.body;

    // Retrieve the stored OTP for the provided email from the otp_storage table
    const getStoredOTPQuery = "SELECT * FROM otp_storage WHERE email = ?";

    // Use Promise to handle the database query
    const results = await new Promise((resolve, reject) => {
      connection.query(
        getStoredOTPQuery,
        [emailForPasswordReset],
        (err, results) => {
          if (err) {
            console.error("Error retrieving stored OTP:", err);
            reject(err); // Reject the Promise with the error
          } else {
            resolve(results); // Resolve the Promise with the query results
          }
        }
      );
    });

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "OTP not found. Please try again." });
    }

    const storedOTP = results[0].otp;

    if (otp !== storedOTP) {
      return res
        .status(401)
        .json({ message: "Incorrect OTP. Please try again." });
    }

    // OTP matches, proceed with the password reset logic or other actions
    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error in verify-otp endpoint:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Check if emailForPasswordReset contains a stored email for password reset
    if (!emailForPasswordReset) {
      console.error("No email found for password reset");
      return res
        .status(400)
        .json({ message: "Email not provided for password reset." });
    }

    // Hash the new password before updating in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Using bcrypt for hashing

    // Proceed to update the hashed password in the users table for the stored email
    const updatePasswordQuery = "UPDATE users SET password = ? WHERE email = ?";
    connection.query(
      updatePasswordQuery,
      [hashedPassword, emailForPasswordReset],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating password:", updateErr);
          return res
            .status(500)
            .json({ message: "Failed to update password. Please try again." });
        }

        if (updateResult.affectedRows === 0) {
          console.error("Password update unsuccessful - Email not found");
          return res
            .status(404)
            .json({ message: "Email not found. Please sign up." });
        }

        console.log("Password updated successfully");

        // Clear the stored email after successful password update

        // Delete the stored OTP record after successful password update
        const deleteOTPQuery = "DELETE FROM otp_storage WHERE email = ?";

        connection.query(
          deleteOTPQuery,
          [emailForPasswordReset],
          (deleteErr, deleteResult) => {
            if (deleteErr) {
              console.error("Error deleting OTP record:", deleteErr);
              return res
                .status(500)
                .json({ message: "Error deleting OTP record" });
            }
            console.log("OTP record deleted");
            emailForPasswordReset = "";
            return res
              .status(200)
              .json({ message: "Password updated successfully" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error in reset-password endpoint:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});






//wishlist

app.post('/api/wishlist/add', (req, res) => {
  const { userId, productId, productTitle, productDescription, productCost, imagePath } = req.body;

  const sql = 'INSERT INTO wishlist (userId, productId, productTitle, productDescription, productCost, imagePath) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [userId, productId, productTitle, productDescription, productCost, imagePath];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error adding product to wishlist:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.log('Product added to wishlist');
      res.status(201).json({ message: 'Product added to wishlist successfully' });
    }
  });
});

const razorpay = new Razorpay({
  key_id: 'rzp_test_VKZJRNMqJeXNhH',
  key_secret: 'dpz4B68eJsj3xo7ejXEtkaU3',
});

app.use(express.json());

app.post('/api/razorpay/init', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount, // amount in the smallest currency unit (paise for INR)
      currency: currency,
      receipt: 'order_receipt_' + Math.random().toString(36).substr(2, 9),
    };

    const order = await razorpay.orders.create(options);

    // Assuming the payment is successful and the order ID is obtained

    // Redirect to home page after payment success
    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key: razorpay.key_id,
      redirectUrl: '/home', // Redirect URL to home page
    });
  } catch (error) {
    console.error('Error initializing Razorpay:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/product-count/:userId', (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const query = 'SELECT COUNT(*) AS count FROM cart_items WHERE user_id = ?';
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching product count:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const count = results[0].count || 0;
    res.status(200).json({ count });
  });
});



// Route to fetch wishlist items for a specific user
app.get('/wishlist/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    // Query to fetch wishlist items for the given user ID
    const query = 'SELECT * FROM wishlist WHERE userId = ?';
    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching wishlist items:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(results); // Send wishlist items as JSON response
      }
    });
  } catch (error) {
    console.error('Error fetching wishlist items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Endpoint to remove a product from the wishlist
app.delete('/api/wishlist/remove/:productId', (req, res) => {
  const productId = req.params.productId;

  const sql = 'DELETE FROM wishlist WHERE productId = ?';
  connection.query(sql, [productId], (err, result) => {
    if (err) {
      console.error('Error removing product from wishlist:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.log('Product removed from wishlist');
      res.status(200).json({ message: 'Product removed from wishlist successfully' });
    }
  });
});



app.post("/rating", (req, res) => {
  const { userId, productId, review, rating } = req.body;

  const sql =
    "INSERT INTO rating (user_Id, product_Id, review, rating) VALUES (?, ?, ?, ?)";
  const values = [userId, productId, review, rating];

  connection.query(sql, values, (error) => {
    if (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(201).json({ message: "Review submitted successfully!" });
    }
  });
});


app.get("/ratings/:productId", (req, res) => {
  const productId = req.params.productId;

  const sql = "SELECT * FROM rating WHERE product_id = ?";
  connection.query(sql, [productId], (error, results) => {
    if (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(200).json(results);
    }
  });
});


app.get("/reviews/:productId", (req, res) => {
  const productId = req.params.productId;

  const sql =
    "SELECT rating.*, users.username FROM rating INNER JOIN users ON rating.user_id = users.id WHERE rating.product_id = ? AND rating.review IS NOT NULL";

  connection.query(sql, [productId], (error, results) => {
    if (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get("/rating/:productId/:userId", (req, res) => {
  const productId = req.params.productId;
  const userId = req.params.userId;
  
  const sql = "SELECT rating FROM rating WHERE product_id = ? AND user_id = ?";
  connection.query(sql, [productId, userId], (error, results) => {
    if (error) {
      console.error("Error fetching existing rating:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (results.length > 0) {
        res.status(200).json({ rating: results[0].rating });
      } else {
        res.status(200).json({ rating: null });
      }
    }
  });
});


app.get("/rating/:productId/:userId", (req, res) => {
  const productId = req.params.productId;
  const userId = req.params.userId;

  const sql = "SELECT rating FROM rating WHERE product_id = ? AND user_id = ?";
  connection.query(sql, [productId, userId], (error, results) => {
    if (error) {
      console.error("Error fetching existing rating:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (results.length > 0) {
        res.status(200).json({ rating: results[0].rating });
      } else {
        res.status(200).json({ rating: null });
      }
    }
  });
});

app.get("/orders/:userId/:id", (req, res) => {
  const userId = req.params.userId;
  const productId = req.params.id;
  const query = `SELECT * FROM orders WHERE user_id = ${userId} AND product_id = ${productId}`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      res.status(500).send("Internal Server Error");
    } else {
      if (results.length > 0) {
        // Order exists for the specified user ID and product ID
        res.status(200).send("Page content goes here"); // Send the page content here
      } else {
        // Order doesn't exist for the specified user ID and product ID
        res.status(404).send("Order not found"); // Return an error indicating that the order doesn't exist
      }
    }
  });
});


app.post("/users/names", (req, res) => {
  const { userIds } = req.body;
  const sql = "SELECT id, username FROM users WHERE id IN (?)";
  connection.query(sql, [userIds], (error, results) => {
    if (error) {
      console.error("Error fetching usernames:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(200).json(results);
    }
  });
});



app.post("/logout", (req, res) => {
  const cookiesToClear = ["accessToken", "userRole"]; // Add all your cookie names here
  cookiesToClear.forEach((cookieName) => {
    res.clearCookie(cookieName, {
      secure: true,
      sameSite: "none",
    });
  });
  res.status(200).json({ message: "User has been logged out." });
});


app.get("/all-product-data", (req, res) => {
  const selectQuery = `
    SELECT id, title, image_path, created_at
    FROM allproducts;
  `;
  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send("Error fetching product data from the database.");
    }
    const products = results.map((result) => ({
      id: result.id,
      title: result.title,
      image_path: result.image_path,
      created_at: result.created_at,
    }));
    return res.status(200).json({ products });
  });
});



app.get('/allproducts-count', (req, res) => {
  const selectQuery = `SELECT COUNT(*) AS count FROM allproducts`;
  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.error('Error fetching product count:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    const count = results[0].count;
    return res.status(200).json({ count });
  });
});


app.get('/pictorialstockdata', (req, res) => {
  const sql = 'SELECT id, title, brand, quantity, available,product_cost,actual_cost,image_path FROM allproducts';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching data from MySQL database:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});


// Endpoint to fetch orders with status 'delivering'
app.get('/delivering', (req, res) => {
  const sqlQuery = 'SELECT * FROM orders WHERE status = "delivering"';
  connection.query(sqlQuery, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }
    res.json(results);
  });
});

// Endpoint to fetch orders with status 'delivered'
app.get('/delivered', (req, res) => {
  const sqlQuery = 'SELECT * FROM orders WHERE status = "delivered"';
  connection.query(sqlQuery, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }
    res.json(results);
  });
});

// Endpoint to fetch orders with status 'cancelled'
app.get('/cancelled', (req, res) => {
  const sqlQuery = 'SELECT * FROM orders WHERE status = "cancelled"';
  connection.query(sqlQuery, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }
    res.json(results);
  });
});



app.get('/profitanalysis', (req, res) => {
  const query = 'SELECT id, product_cost, actual_cost FROM allproducts';
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});


app.get('/total_order_amount', (req, res) => {
  const query = `SELECT user_id, SUM(total_amount) AS total_order_amount FROM orders GROUP BY user_id`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching total order amount:', error);
      res.status(500).json({ error: 'Error fetching total order amount' });
      return;
    }
    res.json(results);
  });
});


app.get('/product_count', (req, res) => {
  const query = `
    SELECT product_id, SUM(quantity) AS total_quantity
    FROM orders
    GROUP BY product_id
  `;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching product count:', error);
      res.status(500).json({ error: 'Error fetching product count' });
      return;
    }
    res.json(results);
  });
});


app.delete('/delete-address/:addressId', (req, res) => {
  const addressId = req.params.addressId;
  // SQL query to delete the address with the given addressId
  const deleteQuery = `DELETE FROM addresses WHERE id = ?`;
  // Execute the delete query
  connection.query(deleteQuery, [addressId], (error, results) => {
    if (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({ error: 'Error deleting address' });
    } else {
      console.log('Address deleted successfully');
      res.status(200).json({ message: 'Address deleted successfully' });
    }
  });
});




app.get('/gstdetails', (req, res) => {
  const query = 'SELECT id, brand,category, title, actual_cost, product_cost, gst_percentage FROM allproducts';
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching data from the database' });
    } else {
      // Calculate GST amount and total price for each product
      const productsWithGst = results.map((product) => {
        const gstAmount = (product.product_cost * (product.gst_percentage / 100)).toFixed(2);
        const totalPrice = (parseFloat(product.product_cost) + parseFloat(gstAmount)).toFixed(2);
        return {
          id: product.id,
          brand: product.brand,
          title: product.title,
          product_cost: product.product_cost,
          actual_cost:product.actual_cost,
          gst_percentage: product.gst_percentage,
          gst_amount: gstAmount,
          total_price: totalPrice,
          category:product.category,

        };
      });
      res.json(productsWithGst);  // Send the GST details response
    }
  });
});

const PORT = process.env.PORT || 8800;


app.listen(PORT,'0.0.0.0', () => {
  console.log(`server running on ${PORT}`);
});
