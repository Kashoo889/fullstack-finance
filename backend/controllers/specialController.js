import SpecialEntry from '../models/SpecialEntry.js';
import { calculateSpecialBalance } from '../utils/calculations.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get all Special entries
 * @route   GET /api/special
 * @access  Public
 */
export const getSpecialEntries = asyncHandler(async (req, res) => {
  const entries = await SpecialEntry.find().sort({ date: 1, createdAt: 1 });

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
    data: entry,
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

  res.status(201).json({
    success: true,
    data: entry,
  });
});

/**
 * @desc    Update Special entry
 * @route   PUT /api/special/:id
 * @access  Public
 */
export const updateSpecialEntry = asyncHandler(async (req, res) => {
  const { nameRupees, submittedRupees } = req.body;

  // Recalculate balance if relevant fields are updated
  let updateData = { ...req.body };
  if (nameRupees !== undefined || submittedRupees !== undefined) {
    const existingEntry = await SpecialEntry.findById(req.params.id);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        error: 'Special entry not found',
      });
    }

    const finalNameRupees = nameRupees !== undefined ? parseFloat(nameRupees) : existingEntry.nameRupees;
    const finalSubmittedRupees = submittedRupees !== undefined ? parseFloat(submittedRupees) : existingEntry.submittedRupees;

    updateData.balance = calculateSpecialBalance(finalNameRupees, finalSubmittedRupees);
  }

  const entry = await SpecialEntry.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!entry) {
    return res.status(404).json({
      success: false,
      error: 'Special entry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: entry,
  });
});

/**
 * @desc    Delete Special entry
 * @route   DELETE /api/special/:id
 * @access  Public
 */
export const deleteSpecialEntry = asyncHandler(async (req, res) => {
  const entry = await SpecialEntry.findByIdAndDelete(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      error: 'Special entry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Special entry deleted successfully',
  });
});

