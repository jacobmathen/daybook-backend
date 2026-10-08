import jwt from 'jsonwebtoken';
import User from './user-model.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('name email avatar preferences');
    if (!user) return res.status(401).json({ message: 'Your account is no longer available.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Your session expired. Please sign in again.' });
  }
}
