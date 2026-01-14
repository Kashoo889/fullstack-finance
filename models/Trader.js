import mongoose from 'mongoose';

const traderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Trader name is required'],
      trim: true,
      unique: true,
    },
    shortName: {
      type: String,
      required: [true, 'Short name is required'],
      trim: true,
      uppercase: true,
      maxlength: [10, 'Short name cannot exceed 10 characters'],
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true,
      default: 'from-blue-500 to-blue-600',
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
traderSchema.index({ name: 1 });
traderSchema.index({ shortName: 1 });

const Trader = mongoose.model('Trader', traderSchema);

export default Trader;

