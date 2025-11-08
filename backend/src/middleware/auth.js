const jwt = require('jsonwebtoken');

               const authenticateToken = (req, res, next) => {
                 if (req.method === 'OPTIONS') {
                   return next();
                 }

                 const authHeader = req.headers['authorization'];
                 const token = authHeader && authHeader.split(' ')[1];

                 if (!token) {
                   return next();
                 }

                 jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                   if (err) {
                     return res.status(401).json({ error: 'Invalid token' });
                   }
                   req.user = decoded;
                   next();
                 });
               };

               const authorizeRoles = (...roles) => {
                 return (req, res, next) => {
                   if (!req.user) {
                     return res.status(401).json({ error: 'Authentication required' });
                   }

                   if (!roles.includes(req.user.role)) {
                     return res.status(403).json({ error: 'Insufficient permissions' });
                   }

                   next();
                 };
               };

               module.exports = {
                 authenticateToken,
                 authorizeRoles
               };