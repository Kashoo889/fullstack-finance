import SaudiEntry from '../models/SaudiEntry.js';
import db from '../config/db.js';
import { calculateRiyalAmount, calculateSaudiBalance } from '../utils/calculations.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Helper to map DB columns to frontend expected props
const mapSaudiEntry = (entry) => {
  if (!entry) return null;
  return {
    _id: entry.id,
    id: entry.id,
    date: entry.date,
    time: entry.time,
    refNo: entry.ref_no,
    pkrAmount: parseFloat(entry.pkr_amount || 0),
    riyalRate: parseFloat(entry.riyal_rate || 0),
    riyalAmount: parseFloat(entry.riyal_amount || 0),
    submittedSar: parseFloat(entry.submitted_sar || 0),
    reference2: entry.reference2,
    balance: parseFloat(entry.balance || 0),
    createdAt: entry.created_at,
  };
};

/**
 * @desc    Get all Saudi entries
 * @route   GET /api/saudi
 * @access  Public
 */
export const getSaudiEntries = asyncHandler(async (req, res) => {
  const entriesRaw = await SaudiEntry.findAll();
  // Sort Descending by date/created_at (Model implicitly does createdAt DESC, but let's reinforce or just rely on it)
  // Model `findAll` does `ORDER BY created_at DESC`.
  // Original code: `.sort({ date: -1, createdAt: -1 })`
  // I will rely on model sort for now or client side sort.

  const entries = entriesRaw.map(mapSaudiEntry);
  // Sort JS side to match exact original logic if needed, but created_at DESC is usually fine.
  // Let's add explicit sort to be safe:
  entries.sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries,
  });
});

/**
 * @desc    Get single Saudi entry
 * @route   GET /api/saudi/:id
 * @access  Public
 */
export const getSaudiEntry = asyncHandler(async (req, res) => {
  const entry = await SaudiEntry.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      error: 'Saudi entry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: mapSaudiEntry(entry),
  });
});

/**
 * @desc    Create new Saudi entry
 * @route   POST /api/saudi
 * @access  Public
 */
export const createSaudiEntry = asyncHandler(async (req, res) => {
  const { pkrAmount, riyalRate, submittedSar } = req.body;

  // Calculate riyalAmount and balance server-side
  const riyalAmount = calculateRiyalAmount(
    parseFloat(pkrAmount),
    parseFloat(riyalRate)
  );
  const balance = calculateSaudiBalance(
    riyalAmount,
    parseFloat(submittedSar || 0)
  );

  const entry = await SaudiEntry.create({
    ...req.body,
    riyalAmount,
    balance,
  });

  res.status(201).json({
    success: true,
    data: { ...entry, _id: entry.id },
  });
});

/**
 * @desc    Update Saudi entry
 * @route   PUT /api/saudi/:id
 * @access  Public
 */
export const updateSaudiEntry = asyncHandler(async (req, res) => {
  const { pkrAmount, riyalRate, submittedSar, date, time, refNo, reference2 } = req.body;

  // Get existing entry first
  const existingEntry = await SaudiEntry.findById(req.params.id);
  if (!existingEntry) {
    return res.status(404).json({
      success: false,
      error: 'Saudi entry not found',
    });
  }

  // Always recalculate riyalAmount and balance when relevant fields are updated
  // Use provided values or existing values (existingEntry is snake_case from DB!)
  const finalPkrAmount = pkrAmount !== undefined ? parseFloat(pkrAmount) : parseFloat(existingEntry.pkr_amount);
  const finalRiyalRate = riyalRate !== undefined ? parseFloat(riyalRate) : parseFloat(existingEntry.riyal_rate);
  const finalSubmittedSar = submittedSar !== undefined ? parseFloat(submittedSar) : parseFloat(existingEntry.submitted_sar);

  // Calculate: PKR AMOUNT / RIYAL RATE = RIYAL AMOUNT
  const riyalAmount = calculateRiyalAmount(finalPkrAmount, finalRiyalRate);
  // Calculate: RIYAL AMOUNT - SUBMITTED SAR = Balance
  const balance = calculateSaudiBalance(riyalAmount, finalSubmittedSar);

  // Prepare final values for update
  // existingEntry.date vs new date
  const finalDate = date !== undefined ? date : existingEntry.date;
  const finalTime = time !== undefined ? time : existingEntry.time;
  const finalRefNo = refNo !== undefined ? refNo : existingEntry.ref_no; // snake_case in existingEntry
  const finalRef2 = reference2 !== undefined ? reference2 : (existingEntry.reference2 || ''); // reference2 matches

  const query = `
    UPDATE saudi_hisaab_entries
    SET date=?, time=?, ref_no=?, pkr_amount=?, riyal_rate=?, riyal_amount=?, submitted_sar=?, reference2=?, balance=?
    WHERE id=?
  `;

  await db.execute(query, [
    finalDate, finalTime, finalRefNo, finalPkrAmount, finalRiyalRate, riyalAmount, finalSubmittedSar, finalRef2, balance, req.params.id
  ]);

  const updatedEntry = await SaudiEntry.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: mapSaudiEntry(updatedEntry),
  });
});

/**
 * @desc    Delete Saudi entry
 * @route   DELETE /api/saudi/:id
 * @access  Public
 */
export const deleteSaudiEntry = asyncHandler(async (req, res) => {
  const existingEntry = await SaudiEntry.findById(req.params.id);

  if (!existingEntry) {
    return res.status(404).json({
      success: false,
      error: 'Saudi entry not found',
    });
  }

  await db.execute('DELETE FROM saudi_hisaab_entries WHERE id = ?', [req.params.id]);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Saudi entry deleted successfully',
  });
});
