import mongoose from 'mongoose';

const specialEntrySchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    balanceType: {
      type: String,
      required: [true, 'Balance type is required'],
      enum: {
        values: ['Online', 'Cash'],
        message: 'Balance type must be either Online or Cash',
      },
    },
    nameRupees: {
      type: Number,
      required: [true, 'Name rupees is required'],
      min: [0, 'Name rupees cannot be negative'],
    },
    submittedRupees: {
      type: Number,
      required: [true, 'Submitted rupees is required'],
      min: [0, 'Submitted rupees cannot be negative'],
      default: 0,
    },
    referencePerson: {
      type: String,
      trim: true,
      default: '',
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate balance before saving
specialEntrySchema.pre('save', function (next) {
  this.balance = this.nameRupees - this.submittedRupees;
  next();
});

// Index for faster queries
specialEntrySchema.index({ date: -1 });
specialEntrySchema.index({ userName: 1 });
specialEntrySchema.index({ balanceType: 1 });

const SpecialEntry = mongoose.model('SpecialEntry', specialEntrySchema);

export default SpecialEntry;

