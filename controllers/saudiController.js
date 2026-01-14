import SaudiEntry from '../models/SaudiEntry.js';
import { calculateRiyalAmount, calculateSaudiBalance } from '../utils/calculations.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get all Saudi entries
 * @route   GET /api/saudi
 * @access  Public
 */
export const getSaudiEntries = asyncHandler(async (req, res) => {
  const entries = await SaudiEntry.find().sort({ date: -1, createdAt: -1 });

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
    data: entry,
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
    data: entry,
  });
});

/**
 * @desc    Update Saudi entry
 * @route   PUT /api/saudi/:id
 * @access  Public
 */
export const updateSaudiEntry = asyncHandler(async (req, res) => {
  const { pkrAmount, riyalRate, submittedSar } = req.body;

  // Get existing entry first
  const existingEntry = await SaudiEntry.findById(req.params.id);
  if (!existingEntry) {
    return res.status(404).json({
      success: false,
      error: 'Saudi entry not found',
    });
  }

  // Prepare update data
  let updateData = { ...req.body };

  // Always recalculate riyalAmount and balance when relevant fields are updated
  // Use provided values or existing values
  const finalPkrAmount = pkrAmount !== undefined ? parseFloat(pkrAmount) : existingEntry.pkrAmount;
  const finalRiyalRate = riyalRate !== undefined ? parseFloat(riyalRate) : existingEntry.riyalRate;
  const finalSubmittedSar = submittedSar !== undefined ? parseFloat(submittedSar) : existingEntry.submittedSar;

  // Calculate: PKR AMOUNT / RIYAL RATE = RIYAL AMOUNT
  const riyalAmount = calculateRiyalAmount(finalPkrAmount, finalRiyalRate);
  // Calculate: RIYAL AMOUNT - SUBMITTED SAR = Balance
  const balance = calculateSaudiBalance(riyalAmount, finalSubmittedSar);

  // Always update riyalAmount and balance to ensure consistency
  updateData.riyalAmount = riyalAmount;
  updateData.balance = balance;

  const entry = await SaudiEntry.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!entry) {
    return res.status(404).json({
      success: false,
      error: 'Saudi entry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: entry,
  });
});

/**
 * @desc    Delete Saudi entry
 * @route   DELETE /api/saudi/:id
 * @access  Public
 */
export const deleteSaudiEntry = asyncHandler(async (req, res) => {
  const entry = await SaudiEntry.findByIdAndDelete(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      error: 'Saudi entry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Saudi entry deleted successfully',
  });
});

