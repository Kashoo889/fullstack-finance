import mongoose from 'mongoose';

const bankSchema = new mongoose.Schema(
  {
    trader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trader',
      required: [true, 'Trader reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Bank code is required'],
      trim: true,
      uppercase: true,
    },
    totalBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
bankSchema.index({ trader: 1 });
bankSchema.index({ code: 1 });

const Bank = mongoose.model('Bank', bankSchema);

export default Bank;

