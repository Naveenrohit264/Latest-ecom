const jwt = require("jsonwebtoken");

// Custom middleware to check the user's token
exports.checkUserToken = (req, res, next) => {
  // Check if the user's token is present in the request (you can modify this based on your cookie setup)
  if (req.cookies && req.cookies.accessToken) {
    const userToken = req.cookies.accessToken;

    // Use the JWT secret from an environment variable or set a default value
    const jwtSecret = process.env.JWT_SECRET ;

    // Verify the token using the JWT secret from the environment variable
    jwt.verify(userToken, jwtSecret, (err, decoded) => {
      if (err) {
        // Token is invalid or expired, return a 401 Unauthorized response
        res.status(401).json({ error: "Unauthorized access. Token is invalid or expired." });
      } else {
        // Token is valid, you can optionally decode and store user information from 'decoded' if needed
        req.userId = decoded.id;
        // Continue to the next middleware or route handler
        next();
      }
    });
  } else {
    // If the user's token is not present, return a 401 Unauthorized response or handle it based on your authentication logic
    res.status(401).json({ error: "Unauthorized access. Token is missing." });
  }
};
