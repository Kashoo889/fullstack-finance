import mongoose from 'mongoose';

const bankLedgerEntrySchema = new mongoose.Schema(
  {
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank',
      required: [true, 'Bank reference is required'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    referenceType: {
      type: String,
      required: [true, 'Reference type is required'],
      enum: {
        values: ['Online', 'Cash'],
        message: 'Reference type must be either Online or Cash',
      },
    },
    amountAdded: {
      type: Number,
      required: [true, 'Amount added is required'],
      min: [0, 'Amount added cannot be negative'],
      default: 0,
    },
    amountWithdrawn: {
      type: Number,
      required: [true, 'Amount withdrawn is required'],
      min: [0, 'Amount withdrawn cannot be negative'],
      default: 0,
    },
    referencePerson: {
      type: String,
      trim: true,
      default: '',
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate remaining amount before saving
bankLedgerEntrySchema.pre('save', function (next) {
  this.remainingAmount = this.amountAdded - this.amountWithdrawn;
  next();
});

// Index for faster queries
bankLedgerEntrySchema.index({ bank: 1, date: -1 });
bankLedgerEntrySchema.index({ date: -1 });

const BankLedgerEntry = mongoose.model('BankLedgerEntry', bankLedgerEntrySchema);

export default BankLedgerEntry;

