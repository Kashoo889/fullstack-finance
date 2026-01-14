import mongoose from 'mongoose';

const saudiEntrySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
    },
    refNo: {
      type: String,
      required: [true, 'Reference number is required'],
      trim: true,
      uppercase: true,
    },
    pkrAmount: {
      type: Number,
      required: [true, 'PKR amount is required'],
      min: [0, 'PKR amount cannot be negative'],
    },
    riyalRate: {
      type: Number,
      required: [true, 'Riyal rate is required'],
      min: [0, 'Riyal rate cannot be negative'],
    },
    riyalAmount: {
      type: Number,
      default: 0,
    },
    submittedSar: {
      type: Number,
      required: [true, 'Submitted SAR is required'],
      min: [0, 'Submitted SAR cannot be negative'],
      default: 0,
    },
    reference2: {
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

// Calculate riyalAmount and balance before saving
// RiyalAmount logic:
//   - If PKR > 0 AND Rate > 0: RiyalAmount = PKR / Rate (auto-calculate)
//   - Otherwise: RiyalAmount = SubmittedSAR (use submitted directly)
// Balance logic:
//   - Always: Balance = RiyalAmount - SubmittedSAR
//   - When auto-calculating: Balance = (PKR/Rate) - SubmittedSAR
//   - When using submitted: Balance = SubmittedSAR - SubmittedSAR = 0
saudiEntrySchema.pre('save', function (next) {
  if (this.pkrAmount > 0 && this.riyalRate > 0) {
    // Auto-calculate: RiyalAmount = PKR / Rate
    this.riyalAmount = this.pkrAmount / this.riyalRate;
  } else {
    // Use submitted SAR directly as RiyalAmount
    this.riyalAmount = this.submittedSar;
  }

  // Balance is always: RiyalAmount - SubmittedSAR
  // When using submitted directly, this becomes 0
  this.balance = this.riyalAmount - this.submittedSar;

  next();
});

// Index for faster queries
saudiEntrySchema.index({ date: -1 });
saudiEntrySchema.index({ refNo: 1 }, { unique: false }); // Non-unique index for query performance

const SaudiEntry = mongoose.model('SaudiEntry', saudiEntrySchema);

export default SaudiEntry;

