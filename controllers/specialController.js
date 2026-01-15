import SpecialEntry from '../models/SpecialEntry.js';
import db from '../config/db.js';
import { calculateSpecialBalance } from '../utils/calculations.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Helper to map DB columns to frontend expected props
const mapSpecialEntry = (entry) => {
  if (!entry) return null;
  return {
    _id: entry.id,
    id: entry.id,
    userName: entry.user_name,
    date: entry.date,
    balanceType: entry.balance_type,
    nameRupees: parseFloat(entry.name_rupees || 0),
    submittedRupees: parseFloat(entry.submitted_rupees || 0),
    referencePerson: entry.reference_person,
    balance: parseFloat(entry.balance || 0),
    createdAt: entry.created_at,
  };
};

/**
 * @desc    Get all Special entries
 * @route   GET /api/special
 * @access  Public
 */
export const getSpecialEntries = asyncHandler(async (req, res) => {
  const entriesRaw = await SpecialEntry.findAll();
  const entries = entriesRaw.map(mapSpecialEntry);

  // Sort ASC
  entries.sort((a, b) => new Date(a.date) - new Date(b.date) || new Date(a.createdAt) - new Date(b.createdAt));

  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries,
  });
});

/**
 * @desc    Get single Special entry
 * @route   GET /api/special/:id
 * @access  Public
 */
export const getSpecialEntry = asyncHandler(async (req, res) => {
  const entry = await SpecialEntry.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      error: 'Special entry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: mapSpecialEntry(entry),
  });
});

/**
 * @desc    Create new Special entry
 * @route   POST /api/special
 * @access  Public
 */
export const createSpecialEntry = asyncHandler(async (req, res) => {
  const { nameRupees, submittedRupees } = req.body;

  // Calculate balance server-side
  const balance = calculateSpecialBalance(
    parseFloat(nameRupees),
    parseFloat(submittedRupees || 0)
  );

  const entry = await SpecialEntry.create({
    ...req.body,
    balance,
  });

  // Entry is camelCase from helper
  res.status(201).json({
    success: true,
    data: { ...entry, _id: entry.id },
  });
});

/**
 * @desc    Update Special entry
 * @route   PUT /api/special/:id
 * @access  Public
 */
export const updateSpecialEntry = asyncHandler(async (req, res) => {
  const { userName, date, balanceType, nameRupees, submittedRupees, referencePerson } = req.body;

  // Recalculate balance if relevant fields are updated
  const existingEntry = await SpecialEntry.findById(req.params.id);
  if (!existingEntry) {
    return res.status(404).json({
      success: false,
      error: 'Special entry not found',
    });
  }

  const finalNameRupees = nameRupees !== undefined ? parseFloat(nameRupees) : parseFloat(existingEntry.name_rupees);
  const finalSubmittedRupees = submittedRupees !== undefined ? parseFloat(submittedRupees) : parseFloat(existingEntry.submitted_rupees);
  const balance = calculateSpecialBalance(finalNameRupees, finalSubmittedRupees);

  const finalUserName = userName !== undefined ? userName : existingEntry.user_name;
  const finalDate = date !== undefined ? date : existingEntry.date;
  const finalBalanceType = balanceType !== undefined ? balanceType : existingEntry.balance_type;
  const finalReferencePerson = referencePerson !== undefined ? referencePerson : (existingEntry.reference_person || '');

  const query = `
    UPDATE special_hisaab_entries
    SET user_name=?, date=?, balance_type=?, name_rupees=?, submitted_rupees=?, reference_person=?, balance=?
    WHERE id=?
  `;

  await db.execute(query, [
    finalUserName, finalDate, finalBalanceType, finalNameRupees, finalSubmittedRupees, finalReferencePerson, balance, req.params.id
  ]);

  const updatedEntry = await SpecialEntry.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: mapSpecialEntry(updatedEntry),
  });
});

/**
 * @desc    Delete Special entry
 * @route   DELETE /api/special/:id
 * @access  Public
 */
export const deleteSpecialEntry = asyncHandler(async (req, res) => {
  const entry = await SpecialEntry.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      error: 'Special entry not found',
    });
  }

  await db.execute('DELETE FROM special_hisaab_entries WHERE id = ?', [req.params.id]);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Special entry deleted successfully',
  });
});
