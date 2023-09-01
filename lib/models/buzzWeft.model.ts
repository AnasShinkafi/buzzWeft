import mongoose from "mongoose";

const buzzWeftSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  parentId: {
    type: String,
  },
  children: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BuzzWeft'
    }
  ]
});

const BuzzWeft = mongoose.models.BuzzWeft || mongoose.model('BuzzWeft', buzzWeftSchema);

export default BuzzWeft; 