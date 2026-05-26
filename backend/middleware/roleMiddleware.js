const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure req.user exists (authMiddleware must run first)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'User role not found' });
    }

    // Check if user's role is in the allowed roles array
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Requires one of roles: ${allowedRoles.join(', ')}` 
      });
    }

    // Role is allowed, proceed
    next();
  };
};

module.exports = { requireRole };
