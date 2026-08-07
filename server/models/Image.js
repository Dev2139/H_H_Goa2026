import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    trim: true,
    default: ''
  },
  stack: {
    type: String,
    trim: true,
    default: ''
  },
  builderTitle: {
    type: String,
    trim: true,
    default: ''
  },
  imageType: {
    type: String,
    enum: ['frame', 'card'],
    required: true
  },
  originalImageUrl: {
    type: String,
    default: ''
  },
  generatedImageUrl: {
    type: String,
    required: true
  },
  shareId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // TTL of 24 hours (86400 seconds)
  }
}, {
  timestamps: true
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
