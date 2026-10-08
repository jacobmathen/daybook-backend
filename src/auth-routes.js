import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './user-model.js';
import { requireAuth } from './middleware-auth.js';

const router = Router();
const publicUser = user => ({ id: user.id, name: user.name, email: user.email, avatar: user.avatar, preferences: user.preferences });
const issueToken = user => jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d', issuer: 'daybook' });

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (name.trim().length > 60) return res.status(400).json({ message: 'Name must be 60 characters or fewer.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (password.length < 10) return res.status(400).json({ message: 'Choose a password with at least 10 characters.' });
    if (await User.exists({ email: email.toLowerCase().trim() })) return res.status(409).json({ message: 'An account with that email already exists.' });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'The email or password is incorrect.' });
    res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, avatar, preferences } = req.body;
    if (name !== undefined) {
      if (!name.trim() || name.trim().length > 60) return res.status(400).json({ message: 'Name must be between 1 and 60 characters.' });
      req.user.name = name.trim();
    }
    if (avatar !== undefined) {
      if (typeof avatar !== 'string' || avatar.length > 5_500_000) return res.status(400).json({ message: 'Profile image must be under 4 MB.' });
      req.user.avatar = avatar;
    }
    if (preferences?.theme && ['light', 'dark', 'system'].includes(preferences.theme)) req.user.preferences.theme = preferences.theme;
    if (preferences?.weekStartsOn !== undefined && [0, 1].includes(preferences.weekStartsOn)) req.user.preferences.weekStartsOn = preferences.weekStartsOn;
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (error) { next(error); }
});
export default router;
