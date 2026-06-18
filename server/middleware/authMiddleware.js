const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from headers
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization denied, token missing' });
  }

  // Token format: "Bearer <token>"
  const tokenParts = authHeader.split(' ');
  const token = tokenParts[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authorization denied, token malformed' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Authorization denied, invalid or expired token' });
  }
};
