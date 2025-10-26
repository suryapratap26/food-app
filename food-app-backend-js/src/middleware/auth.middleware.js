import jwtUtils from '../utils/jwt.utils.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const email = jwtUtils.extractUsername(token);

  if (email) {
    try {
      const user = await User.findOne({ email });
      if (!user) return next();

      if (jwtUtils.validateToken(token, user)) {
        req.user = user;
        req.userId = user._id.toString();
        req.userRole = user.role;
      }
    } catch (e) {
      console.error('JWT validation error:', e.message);
    }
  }
  next();
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .send({ message: 'Unauthorized: Access token is missing or invalid.' });
  }
  next();
};
