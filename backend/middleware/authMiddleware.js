const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is missing. Server cannot start.");
  process.exit(1);
}
const protect = (req, res, next) => {
  let token;

  // Read token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If token is missing
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded user payload to req.user
    // Payload includes: id, email, role, name
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(403).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

module.exports = { protect };
