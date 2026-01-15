import BankLedgerEntry from '../models/BankLedgerEntry.js';
import Bank from '../models/Bank.js';
import db from '../config/db.js';
import { calculateRunningBalance, calculateBankTotalBalance } from '../utils/calculations.js';
import { asyncHandler } from '../middleware/errorHandler.js';

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

/**
 * @desc    Get all Bank Ledger Entries for a Bank
 * @route   GET /api/traders/:traderId/banks/:bankId/ledger
 * @access  Public
 */
export const getBankLedgerEntries = asyncHandler(async (req, res) => {
  console.log('--- getBankLedgerEntries ---');
  console.log('Params:', req.params);

  // Verify bank exists and belongs to trader
  const bank = await Bank.findById(req.params.bankId);
  console.log('Found Bank:', bank);

  // Validate ownership
  if (!bank || bank.trader_id != req.params.traderId) {
    return res.status(404).json({
      success: false,
      error: 'Bank not found',
    });
  }

  // Fetch entries sorted by date/createdAt ascending for proper running balance calculation
  // My SQL helper findByBankId sorts by created_at DESC by default.
  // But standard logic usually needs ASC for running balance.
  // Let's modify the query here or sort in JS.
  // It's safer to sort in JS or add a specific sorted query method.
  // For now, I'll rely on JS sort just like the original code did implicitly or explicitly.
  // Actually, original code sorted `{ date: 1, createdAt: 1 }`.
  // My `findByBankId` sorts DESC.
  // I will just query raw to get them ASC or sort in JS.
  // Sorting in JS:
  const entriesRaw = await BankLedgerEntry.findByBankId(req.params.bankId);
  const entriesMapped = entriesRaw.map(mapEntry);

  // Sort ASC
  entriesMapped.sort((a, b) => new Date(a.date) - new Date(b.date) || new Date(a.createdAt) - new Date(b.createdAt));

  // Calculate running balance (needs to be calculated from oldest to newest)
  const entriesWithBalance = calculateRunningBalance(entriesMapped);

  // Accounting totals
  const totalCredit = entriesMapped.reduce((total, entry) => total + (entry.amountAdded || 0), 0);
  const totalDebit = entriesMapped.reduce((total, entry) => total + (entry.amountWithdrawn || 0), 0);

  const remainingBalance = totalCredit - totalDebit;
  const totalBalance = calculateBankTotalBalance(entriesMapped);

  // Reverse to show newest first if desired (original code had commented it out, but UI often wants newest)
  // The original code had `// entriesWithBalance.reverse();` (commented out).
  // I'll keep it as is (Ascending).

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
  const bank = await Bank.findById(req.params.bankId);

  if (!bank || bank.trader_id != req.params.traderId) {
    return res.status(404).json({
      success: false,
      error: 'Bank not found',
    });
  }

  const entry = await BankLedgerEntry.findById(req.params.entryId);

  if (!entry || entry.bank_id != req.params.bankId) {
    return res.status(404).json({
      success: false,
      error: 'Ledger entry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: mapEntry(entry),
  });
});

/**
 * @desc    Create new Bank Ledger Entry
 * @route   POST /api/traders/:traderId/banks/:bankId/ledger
 * @access  Public
 */
export const createBankLedgerEntry = asyncHandler(async (req, res) => {
  const bank = await Bank.findById(req.params.bankId);

  if (!bank || bank.trader_id != req.params.traderId) {
    return res.status(404).json({
      success: false,
      error: 'Bank not found',
    });
  }

  // Ensure at least one amount is provided
  const { amountAdded, amountWithdrawn } = req.body;

  if ((!amountAdded || amountAdded === 0) && (!amountWithdrawn || amountWithdrawn === 0)) {
    // Check if both are missing/zero. 
    // Note: `!amountAdded` is true for 0. So strict check is needed or ensure logic covers it.
    // Original code: `(!amountAdded || amountAdded === 0)`
    // This allows negative? No schema validation handles that.
    // Let's stick to original logic.
    return res.status(400).json({
      success: false,
      error: 'Either amount added or amount withdrawn must be greater than zero',
    });
  }

  const entry = await BankLedgerEntry.create({
    ...req.body,
    bankId: req.params.bankId,
    // ensure mapping to snake_case happens in model create method or pass camelCase if model handles it
    // My model `create` takes camelCase args and maps to DB columns! Perfect.
    amountAdded: amountAdded || 0,
    amountWithdrawn: amountWithdrawn || 0,
    // remainingAmount needed? Model insert query expects it.
    // Logic: remainingAmount = added - withdrawn (for this specific transactional entry? Or running balance?)
    // Original Mongoose schema calculated it in `pre('save')`: `this.remainingAmount = this.amountAdded - this.amountWithdrawn;`
    // I should calculate it here.
    remainingAmount: (amountAdded || 0) - (amountWithdrawn || 0)
  });

  // Calculate running balance for response
  // Fetch all, sort, calculate, find this one.
  const entriesRaw = await BankLedgerEntry.findByBankId(req.params.bankId);
  const entriesMapped = entriesRaw.map(mapEntry);
  entriesMapped.sort((a, b) => new Date(a.date) - new Date(b.date) || new Date(a.createdAt) - new Date(b.createdAt));

  const entriesWithBalance = calculateRunningBalance(entriesMapped);
  const entryWithRunningBalance = entriesWithBalance.find((e) => e._id.toString() === entry.id.toString());

  res.status(201).json({
    success: true,
    data: entryWithRunningBalance || mapEntry(entry),
  });
});

/**
 * @desc    Update Bank Ledger Entry
 * @route   PUT /api/traders/:traderId/banks/:bankId/ledger/:entryId
 * @access  Public
 */
export const updateBankLedgerEntry = asyncHandler(async (req, res) => {
  const bank = await Bank.findById(req.params.bankId);

  if (!bank || bank.trader_id != req.params.traderId) {
    return res.status(404).json({ success: false, error: 'Bank not found' });
  }

  const existingEntry = await BankLedgerEntry.findById(req.params.entryId);
  if (!existingEntry || existingEntry.bank_id != req.params.bankId) {
    return res.status(404).json({ success: false, error: 'Ledger entry not found' });
  }

  const { date, referenceType, amountAdded, amountWithdrawn, referencePerson } = req.body;
  const remainingAmount = (amountAdded || 0) - (amountWithdrawn || 0);

  const query = `
    UPDATE bank_ledger_entries 
    SET date=?, reference_type=?, amount_added=?, amount_withdrawn=?, reference_person=?, remaining_amount=?
    WHERE id=?
  `;

  await db.execute(query, [
    date, referenceType, amountAdded || 0, amountWithdrawn || 0, referencePerson, remainingAmount, req.params.entryId
  ]);

  const updatedEntry = await BankLedgerEntry.findById(req.params.entryId);

  // Running balance logic again
  const entriesRaw = await BankLedgerEntry.findByBankId(req.params.bankId);
  const entriesMapped = entriesRaw.map(mapEntry);
  entriesMapped.sort((a, b) => new Date(a.date) - new Date(b.date) || new Date(a.createdAt) - new Date(b.createdAt));

  const entriesWithBalance = calculateRunningBalance(entriesMapped);
  const entryWithRunningBalance = entriesWithBalance.find((e) => e._id.toString() === req.params.entryId.toString());

  res.status(200).json({
    success: true,
    data: entryWithRunningBalance || mapEntry(updatedEntry),
  });
});

/**
 * @desc    Delete Bank Ledger Entry
 * @route   DELETE /api/traders/:traderId/banks/:bankId/ledger/:entryId
 * @access  Public
 */
export const deleteBankLedgerEntry = asyncHandler(async (req, res) => {
  const bank = await Bank.findById(req.params.bankId);

  if (!bank || bank.trader_id != req.params.traderId) {
    return res.status(404).json({ success: false, error: 'Bank not found' });
  }

  const existingEntry = await BankLedgerEntry.findById(req.params.entryId);
  if (!existingEntry || existingEntry.bank_id != req.params.bankId) {
    return res.status(404).json({ success: false, error: 'Ledger entry not found' });
  }

  await db.execute('DELETE FROM bank_ledger_entries WHERE id = ?', [req.params.entryId]);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Ledger entry deleted successfully',
  });
});
