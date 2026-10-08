import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  avatar: { type: String, default: '' },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    weekStartsOn: { type: Number, enum: [0, 1], default: 1 },
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
