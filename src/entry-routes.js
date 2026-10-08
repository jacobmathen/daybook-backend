import { Router } from 'express';
import Entry from './entry-model.js';
import { requireAuth } from './middleware-auth.js';

const router = Router();
router.use(requireAuth);
const fields = 'date title content mood tags images encrypted favorite createdAt updatedAt';

router.get('/', async (req, res, next) => {
  try {
    const { from, to, favorite } = req.query;
    const filter = { user: req.user.id };
    if (from || to) filter.date = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
    if (favorite === 'true') filter.favorite = true;
    const entries = await Entry.find(filter).select(fields).sort({ date: -1, updatedAt: -1 }).limit(500).lean();
    res.json({ entries });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { date, title = '', content = '', mood = '🙂', tags = [], images = [], encrypted = false, favorite = false } = req.body;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return res.status(400).json({ message: 'Choose a valid entry date.' });
    if (typeof title !== 'string' || typeof content !== 'string' || title.length > 300 || content.length > 1_400_000) return res.status(400).json({ message: 'This entry is too large.' });
    if (!Array.isArray(tags) || tags.length > 20 || tags.some(tag => typeof tag !== 'string' || tag.length > 40)) return res.status(400).json({ message: 'Use up to 20 short tags.' });
    if (!Array.isArray(images) || images.length > 5 || images.some(image => typeof image !== 'string' || image.length > 2_800_000)) return res.status(400).json({ message: 'Use up to 5 images, each under 2 MB.' });
    const entry = await Entry.findOneAndUpdate({ user: req.user.id, date }, { $set: { title, content, mood, tags, images, encrypted: Boolean(encrypted), favorite: Boolean(favorite) }, $setOnInsert: { user: req.user.id, date } }, { upsert: true, new: true, runValidators: true }).select(fields);
    res.status(200).json({ entry });
  } catch (error) { next(error); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, user: req.user.id }).select(fields);
    if (!entry) return res.status(404).json({ message: 'Entry not found.' });
    res.json({ entry });
  } catch (error) { next(error); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const entry = await Entry.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Entry not found.' });
    res.json({ message: 'Entry deleted.' });
  } catch (error) { next(error); }
});
export default router;
