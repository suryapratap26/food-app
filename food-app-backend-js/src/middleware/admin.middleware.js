export const checkAdminRole = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).send({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};
