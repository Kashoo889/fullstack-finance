import Trader from '../models/Trader.js';
import Bank from '../models/Bank.js';
import BankLedgerEntry from '../models/BankLedgerEntry.js';
import { calculateTraderTotalBalance } from '../utils/calculations.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get all Traders
 * @route   GET /api/traders
 * @access  Public
 */
export const getTraders = asyncHandler(async (req, res) => {
  const traders = await Trader.find().sort({ name: 1 });

  // Calculate total balance for each trader
  const tradersWithBalance = await Promise.all(
    traders.map(async (trader) => {
      const banks = await Bank.find({ trader: trader._id });
      const banksWithEntries = await Promise.all(
        banks.map(async (bank) => {
          const entries = await BankLedgerEntry.find({ bank: bank._id }).sort({ date: 1, createdAt: 1 });
          return { ...bank.toObject(), entries };
        })
      );
      const totalBalance = calculateTraderTotalBalance(banksWithEntries);

      return {
        ...trader.toObject(),
        banks: banksWithEntries,
        totalBalance,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: tradersWithBalance.length,
    data: tradersWithBalance,
  });
});

/**
 * @desc    Get single Trader with banks
 * @route   GET /api/traders/:id
 * @access  Public
 */
export const getTrader = asyncHandler(async (req, res) => {
  const trader = await Trader.findById(req.params.id);

  if (!trader) {
    return res.status(404).json({
      success: false,
      error: 'Trader not found',
    });
  }

  const banks = await Bank.find({ trader: trader._id });
  const banksWithEntries = await Promise.all(
    banks.map(async (bank) => {
      const entries = await BankLedgerEntry.find({ bank: bank._id }).sort({ date: 1, createdAt: 1 });
      const totalBalance = entries.reduce((sum, entry) => sum + (entry.amountAdded - entry.amountWithdrawn), 0);
      return {
        ...bank.toObject(),
        entries,
        totalBalance,
      };
    })
  );

  const totalBalance = calculateTraderTotalBalance(banksWithEntries);

  res.status(200).json({
    success: true,
    data: {
      ...trader.toObject(),
      banks: banksWithEntries,
      totalBalance,
    },
  });
});

/**
 * @desc    Create new Trader
 * @route   POST /api/traders
 * @access  Public
 */
export const createTrader = asyncHandler(async (req, res) => {
  const trader = await Trader.create(req.body);

  res.status(201).json({
    success: true,
    data: trader,
  });
});

/**
 * @desc    Update Trader
 * @route   PUT /api/traders/:id
 * @access  Public
 */
export const updateTrader = asyncHandler(async (req, res) => {
  const trader = await Trader.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!trader) {
    return res.status(404).json({
      success: false,
      error: 'Trader not found',
    });
  }

  res.status(200).json({
    success: true,
    data: trader,
  });
});

/**
 * @desc    Delete Trader (with cascade delete of banks and ledger entries)
 * @route   DELETE /api/traders/:id
 * @access  Public
 */
export const deleteTrader = asyncHandler(async (req, res) => {
  const trader = await Trader.findById(req.params.id);

  if (!trader) {
    return res.status(404).json({
      success: false,
      error: 'Trader not found',
    });
  }

  // Find all banks for this trader
  const banks = await Bank.find({ trader: req.params.id });

  // Delete all bank ledger entries for all banks of this trader
  if (banks.length > 0) {
    const bankIds = banks.map(bank => bank._id);
    await BankLedgerEntry.deleteMany({ bank: { $in: bankIds } });
    
    // Delete all banks for this trader
    await Bank.deleteMany({ trader: req.params.id });
  }

  // Delete the trader
  await Trader.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Trader and all associated data deleted successfully',
  });
});

