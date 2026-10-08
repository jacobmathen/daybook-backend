import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  title: { type: String, default: '', maxlength: 300 },
  content: { type: String, default: '', maxlength: 1_400_000 },
  mood: { type: String, default: '🙂', maxlength: 8 },
  tags: { type: [String], default: [], validate: v => v.length <= 20 },
  images: { type: [String], default: [], validate: v => v.length <= 5 },
  encrypted: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
}, { timestamps: true });
entrySchema.index({ user: 1, date: -1 });
entrySchema.index({ user: 1, updatedAt: -1 });
export default mongoose.model('Entry', entrySchema);
