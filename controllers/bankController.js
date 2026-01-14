import Bank from '../models/Bank.js';
import BankLedgerEntry from '../models/BankLedgerEntry.js';
import { calculateBankTotalBalance } from '../utils/calculations.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get all Banks for a Trader
 * @route   GET /api/traders/:traderId/banks
 * @access  Public
 */
export const getBanks = asyncHandler(async (req, res) => {
  const banks = await Bank.find({ trader: req.params.traderId }).sort({ name: 1 });

  const banksWithBalance = await Promise.all(
    banks.map(async (bank) => {
      const entries = await BankLedgerEntry.find({ bank: bank._id }).sort({ date: 1, createdAt: 1 });
      const totalBalance = calculateBankTotalBalance(entries);

      return {
        ...bank.toObject(),
        entries,
        totalBalance,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: banksWithBalance.length,
    data: banksWithBalance,
  });
});

/**
 * @desc    Get single Bank with entries
 * @route   GET /api/traders/:traderId/banks/:bankId
 * @access  Public
 */
export const getBank = asyncHandler(async (req, res) => {
  const bank = await Bank.findOne({
    _id: req.params.bankId,
    trader: req.params.traderId,
  });

  if (!bank) {
    return res.status(404).json({
      success: false,
      error: 'Bank not found',
    });
  }

  const entries = await BankLedgerEntry.find({ bank: bank._id }).sort({ date: 1, createdAt: 1 });
  const totalBalance = calculateBankTotalBalance(entries);

  res.status(200).json({
    success: true,
    data: {
      ...bank.toObject(),
      entries,
      totalBalance,
    },
  });
});

/**
 * @desc    Create new Bank
 * @route   POST /api/traders/:traderId/banks
 * @access  Public
 */
export const createBank = asyncHandler(async (req, res) => {
  const bank = await Bank.create({
    ...req.body,
    trader: req.params.traderId,
  });

  res.status(201).json({
    success: true,
    data: bank,
  });
});

/**
 * @desc    Update Bank
 * @route   PUT /api/traders/:traderId/banks/:bankId
 * @access  Public
 */
export const updateBank = asyncHandler(async (req, res) => {
  const bank = await Bank.findOneAndUpdate(
    {
      _id: req.params.bankId,
      trader: req.params.traderId,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!bank) {
    return res.status(404).json({
      success: false,
      error: 'Bank not found',
    });
  }

  res.status(200).json({
    success: true,
    data: bank,
  });
});

/**
 * @desc    Delete Bank (with cascade delete of ledger entries)
 * @route   DELETE /api/traders/:traderId/banks/:bankId
 * @access  Public
 */
export const deleteBank = asyncHandler(async (req, res) => {
  const bank = await Bank.findOne({
    _id: req.params.bankId,
    trader: req.params.traderId,
  });

  if (!bank) {
    return res.status(404).json({
      success: false,
      error: 'Bank not found',
    });
  }

  // Delete all ledger entries for this bank
  await BankLedgerEntry.deleteMany({ bank: req.params.bankId });

  // Delete the bank
  await Bank.findOneAndDelete({
    _id: req.params.bankId,
    trader: req.params.traderId,
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Bank and all associated ledger entries deleted successfully',
  });
});

