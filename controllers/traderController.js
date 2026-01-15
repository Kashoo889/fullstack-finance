import Trader from '../models/Trader.js';
import Bank from '../models/Bank.js';
import BankLedgerEntry from '../models/BankLedgerEntry.js';
import db from '../config/db.js';
import { calculateTraderTotalBalance } from '../utils/calculations.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Helper to map DB columns to frontend expected props (camelCase)
const mapEntry = (entry) => {
  if (!entry) return null;
  return {
    _id: entry.id,
    id: entry.id,
    bank: entry.bank_id,
    date: entry.date,
    referenceType: entry.reference_type,
    amountAdded: parseFloat(entry.amount_added || 0),
    amountWithdrawn: parseFloat(entry.amount_withdrawn || 0),
    referencePerson: entry.reference_person,
    remainingAmount: parseFloat(entry.remaining_amount || 0),
    createdAt: entry.created_at,
  };
};

const mapBank = (bank) => {
  if (!bank) return null;
  return {
    _id: bank.id,
    id: bank.id,
    trader: bank.trader_id,
    name: bank.name,
    code: bank.code,
    totalBalance: parseFloat(bank.total_balance || 0),
    createdAt: bank.created_at,
  };
};

const mapTrader = (trader) => {
  if (!trader) return null;
  return {
    _id: trader.id,
    id: trader.id,
    name: trader.name,
    shortName: trader.short_name,
    color: trader.color,
    totalBalance: parseFloat(trader.total_balance || 0),
    createdAt: trader.created_at,
  };
};

/**
 * @desc    Get all Traders
 * @route   GET /api/traders
 * @access  Public
 */
export const getTraders = asyncHandler(async (req, res) => {
  const traders = await Trader.findAll();

  // Calculate total balance for each trader
  const tradersWithBalance = await Promise.all(
    traders.map(async (traderData) => {
      const trader = mapTrader(traderData);
      const banks = await Bank.findByTraderId(trader.id);

      const banksWithEntries = await Promise.all(
        banks.map(async (bankData) => {
          const bank = mapBank(bankData);
          const entries = await BankLedgerEntry.findByBankId(bank.id);
          const mappedEntries = entries.map(mapEntry);
          return { ...bank, entries: mappedEntries };
        })
      );

      const totalBalance = calculateTraderTotalBalance(banksWithEntries);

      return {
        ...trader,
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
  const traderData = await Trader.findById(req.params.id);

  if (!traderData) {
    return res.status(404).json({
      success: false,
      error: 'Trader not found',
    });
  }

  const trader = mapTrader(traderData);
  const banks = await Bank.findByTraderId(trader.id);

  const banksWithEntries = await Promise.all(
    banks.map(async (bankData) => {
      const bank = mapBank(bankData);
      const entries = await BankLedgerEntry.findByBankId(bank.id);
      const mappedEntries = entries.map(mapEntry);

      const totalBalance = mappedEntries.reduce((sum, entry) => sum + (entry.amountAdded - entry.amountWithdrawn), 0);

      return {
        ...bank,
        entries: mappedEntries,
        totalBalance,
      };
    })
  );

  const totalBalance = calculateTraderTotalBalance(banksWithEntries);

  res.status(200).json({
    success: true,
    data: {
      ...trader,
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
  // Trader.create returns camelCase keys as we defined it
  res.status(201).json({
    success: true,
    data: { ...trader, _id: trader.id },
  });
});

/**
 * @desc    Update Trader
 * @route   PUT /api/traders/:id
 * @access  Public
 */
export const updateTrader = asyncHandler(async (req, res) => {
  const { name, shortName, color } = req.body;

  // Check if trader exists
  const existingTrader = await Trader.findById(req.params.id);
  if (!existingTrader) {
    return res.status(404).json({ success: false, error: 'Trader not found' });
  }

  // Update
  await db.execute(
    'UPDATE traders SET name = ?, short_name = ?, color = ? WHERE id = ?',
    [name, shortName, color, req.params.id]
  );

  const updatedTrader = await Trader.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: mapTrader(updatedTrader),
  });
});

/**
 * @desc    Delete Trader (Cascade delete handled by MySQL)
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

  // MySQL ON DELETE CASCADE will handle banks and entries
  await db.execute('DELETE FROM traders WHERE id = ?', [req.params.id]);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Trader and all associated data deleted successfully',
  });
});
