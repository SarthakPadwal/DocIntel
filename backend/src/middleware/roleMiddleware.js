const { errorResponse } = require('../utils/response');

const requireRole = (...roles) => {
  return (req, res, next) => {
    const userRole = (req.user?.role || '').toUpperCase();
    const allowedRoles = roles.map(r => r.toUpperCase());
    if (!req.user || !allowedRoles.includes(userRole)) {
      return errorResponse(res, 'Forbidden, insufficient permissions', 403);
    }
    next();
  };
};

module.exports = requireRole;
