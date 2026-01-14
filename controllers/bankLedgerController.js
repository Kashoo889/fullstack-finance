import BankLedgerEntry from '../models/BankLedgerEntry.js';
import Bank from '../models/Bank.js';
import { calculateRunningBalance, calculateBankTotalBalance } from '../utils/calculations.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get all Bank Ledger Entries for a Bank
 * @route   GET /api/traders/:traderId/banks/:bankId/ledger
 * @access  Public
 */
export const getBankLedgerEntries = asyncHandler(async (req, res) => {
  // Verify bank exists and belongs to trader
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

  // Fetch entries sorted by date/createdAt ascending for proper running balance calculation
  const entries = await BankLedgerEntry.find({
    bank: req.params.bankId,
  }).sort({ date: 1, createdAt: 1 });

  // Calculate running balance (needs to be calculated from oldest to newest)
  const entriesWithBalance = calculateRunningBalance(entries);

  // Accounting totals
  const totalCredit = entries.reduce((total, entry) => {
    const credit = entry.amountAdded || 0;
    return total + credit;
  }, 0);

  const totalDebit = entries.reduce((total, entry) => {
    const debit = entry.amountWithdrawn || 0;
    return total + debit;
  }, 0);

  const remainingBalance = totalCredit - totalDebit;
  const totalBalance = calculateBankTotalBalance(entries);

  // No need to reverse as we want Oldest First (Ascending)
  // entriesWithBalance.reverse();

  res.status(200).json({
    success: true,
    count: entriesWithBalance.length,
    totalCredit,
    totalDebit,
    remainingBalance,
    totalBalance,
    data: entriesWithBalance,
  });
});

/**
 * @desc    Get single Bank Ledger Entry
 * @route   GET /api/traders/:traderId/banks/:bankId/ledger/:entryId
 * @access  Public
 */
export const getBankLedgerEntry = asyncHandler(async (req, res) => {
  // Verify bank exists and belongs to trader
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

  const entry = await BankLedgerEntry.findOne({
    _id: req.params.entryId,
    bank: req.params.bankId,
  });

  if (!entry) {
    return res.status(404).json({
      success: false,
      error: 'Ledger entry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: entry,
  });
});

/**
 * @desc    Create new Bank Ledger Entry
 * @route   POST /api/traders/:traderId/banks/:bankId/ledger
 * @access  Public
 */
export const createBankLedgerEntry = asyncHandler(async (req, res) => {
  // Verify bank exists and belongs to trader
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

  // Ensure at least one amount is provided
  const { amountAdded, amountWithdrawn } = req.body;
  if ((!amountAdded || amountAdded === 0) && (!amountWithdrawn || amountWithdrawn === 0)) {
    return res.status(400).json({
      success: false,
      error: 'Either amount added or amount withdrawn must be greater than zero',
    });
  }

  const entry = await BankLedgerEntry.create({
    ...req.body,
    bank: req.params.bankId,
    amountAdded: amountAdded || 0,
    amountWithdrawn: amountWithdrawn || 0,
  });

  // Calculate running balance for response
  // Fetch in ascending order for proper running balance calculation, then reverse for display
  const allEntries = await BankLedgerEntry.find({ bank: req.params.bankId }).sort({ date: 1, createdAt: 1 });
  const entriesWithBalance = calculateRunningBalance(allEntries);
  // entriesWithBalance.reverse(); // Show newest first
  const entryWithRunningBalance = entriesWithBalance.find((e) => e._id.toString() === entry._id.toString());

  res.status(201).json({
    success: true,
    data: entryWithRunningBalance || entry,
  });
});

/**
 * @desc    Update Bank Ledger Entry
 * @route   PUT /api/traders/:traderId/banks/:bankId/ledger/:entryId
 * @access  Public
 */
export const updateBankLedgerEntry = asyncHandler(async (req, res) => {
  // Verify bank exists and belongs to trader
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

  const entry = await BankLedgerEntry.findOneAndUpdate(
    {
      _id: req.params.entryId,
      bank: req.params.bankId,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!entry) {
    return res.status(404).json({
      success: false,
      error: 'Ledger entry not found',
    });
  }

  // Calculate running balance for response
  // Fetch in ascending order for proper running balance calculation, then reverse for display
  const allEntries = await BankLedgerEntry.find({ bank: req.params.bankId }).sort({ date: 1, createdAt: 1 });
  const entriesWithBalance = calculateRunningBalance(allEntries);
  // entriesWithBalance.reverse(); // Show newest first
  const entryWithRunningBalance = entriesWithBalance.find((e) => e._id.toString() === entry._id.toString());

  res.status(200).json({
    success: true,
    data: entryWithRunningBalance || entry,
  });
});

/**
 * @desc    Delete Bank Ledger Entry
 * @route   DELETE /api/traders/:traderId/banks/:bankId/ledger/:entryId
 * @access  Public
 */
export const deleteBankLedgerEntry = asyncHandler(async (req, res) => {
  // Verify bank exists and belongs to trader
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

  const entry = await BankLedgerEntry.findOneAndDelete({
    _id: req.params.entryId,
    bank: req.params.bankId,
  });

  if (!entry) {
    return res.status(404).json({
      success: false,
      error: 'Ledger entry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Ledger entry deleted successfully',
  });
});

