const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user was set by auth middleware
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Access denied. You are not authorized to perform this action.",
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };
