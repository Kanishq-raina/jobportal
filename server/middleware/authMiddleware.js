import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '🚫 No token provided.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('_id username role');
    if (!user) {
      return res.status(401).json({ message: '🚫 User no longer exists.' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    console.log("✅ Authenticated User:", req.user);

    next();
  } catch (error) {
    console.error('❌ Token verification error:', error);
    return res.status(401).json({ message: '🚫 Invalid token.' });
  }
};
