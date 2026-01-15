import Bank from '../models/Bank.js';
import BankLedgerEntry from '../models/BankLedgerEntry.js';
import db from '../config/db.js';
import { calculateBankTotalBalance } from '../utils/calculations.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Helpers to map DB columns to frontend expected props
const mapBank = (bank) => {
  if (!bank) return null;
  return {
    _id: bank.id,
    id: bank.id,
    trader: bank.trader_id,
    name: bank.name,
    code: bank.code,
    totalBalance: parseFloat(bank.total_balance),
    createdAt: bank.created_at,
  };
};

const mapEntry = (entry) => {
  if (!entry) return null;
  return {
    _id: entry.id,
    id: entry.id,
    bank: entry.bank_id,
    date: entry.date,
    referenceType: entry.reference_type,
    amountAdded: parseFloat(entry.amount_added),
    amountWithdrawn: parseFloat(entry.amount_withdrawn),
    referencePerson: entry.reference_person,
    remainingAmount: parseFloat(entry.remaining_amount),
    createdAt: entry.created_at,
  };
};

/**
 * @desc    Get all Banks for a Trader
 * @route   GET /api/traders/:traderId/banks
 * @access  Public
 */
export const getBanks = asyncHandler(async (req, res) => {
  const banks = await Bank.findByTraderId(req.params.traderId);

  const banksWithBalance = await Promise.all(
    banks.map(async (bank) => {
      const entries = await BankLedgerEntry.findByBankId(bank.id);
      const mappedEntries = entries.map(mapEntry);
      const totalBalance = calculateBankTotalBalance(mappedEntries);

      return {
        ...mapBank(bank),
        entries: mappedEntries,
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
  console.log('--- getBank ---');
  console.log('Params:', req.params);

  const bank = await Bank.findById(req.params.bankId);
  console.log('Found Bank:', bank);

  // Validate ownership
  if (!bank || bank.trader_id != req.params.traderId) {
    return res.status(404).json({
      success: false,
      error: 'Bank not found',
    });
  }

  const entries = await BankLedgerEntry.findByBankId(bank.id);
  const mappedEntries = entries.map(mapEntry);
  const totalBalance = calculateBankTotalBalance(mappedEntries);

  res.status(200).json({
    success: true,
    data: {
      ...mapBank(bank),
      entries: mappedEntries,
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
    traderId: req.params.traderId,
  });

  // Bank.create returns the object with camelCase keys as defined in model
  // But we want to ensure _id is present
  res.status(201).json({
    success: true,
    data: { ...bank, _id: bank.id },
  });
});

/**
 * @desc    Update Bank
 * @route   PUT /api/traders/:traderId/banks/:bankId
 * @access  Public
 */
export const updateBank = asyncHandler(async (req, res) => {
  const { name, code } = req.body;

  const bank = await Bank.findById(req.params.bankId);

  if (!bank || bank.trader_id != req.params.traderId) {
    return res.status(404).json({
      success: false,
      error: 'Bank not found',
    });
  }

  await db.execute(
    'UPDATE banks SET name = ?, code = ? WHERE id = ?',
    [name, code, req.params.bankId]
  );

  const updatedBank = await Bank.findById(req.params.bankId);

  res.status(200).json({
    success: true,
    data: mapBank(updatedBank),
  });
});

/**
 * @desc    Delete Bank (with cascade delete of ledger entries)
 * @route   DELETE /api/traders/:traderId/banks/:bankId
 * @access  Public
 */
export const deleteBank = asyncHandler(async (req, res) => {
  const bank = await Bank.findById(req.params.bankId);

  if (!bank || bank.trader_id != req.params.traderId) {
    return res.status(404).json({
      success: false,
      error: 'Bank not found',
    });
  }

  // MySQL ON DELETE CASCADE handles entries
  await db.execute('DELETE FROM banks WHERE id = ?', [req.params.bankId]);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Bank and all associated ledger entries deleted successfully',
  });
});
