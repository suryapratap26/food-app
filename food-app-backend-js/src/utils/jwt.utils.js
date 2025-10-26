import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret';
const EXPIRATION_SECONDS = parseInt(process.env.JWT_EXPIRATION_MS || '86400000') / 1000;

class JwtUtils {
  generateToken(user) {
    const payload = {
      sub: user.email,
      role: user.role,
    };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRATION_SECONDS });
  }

  extractUsername(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded ? decoded.sub : null;
    } catch (e) {
      return null;
    }
  }

  extractRole(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded ? decoded.role : null;
    } catch (e) {
      return null;
    }
  }

  validateToken(token, user) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      return decoded.sub === user.email;
    } catch (e) {
      return false;
    }
  }
}

export default new JwtUtils();
