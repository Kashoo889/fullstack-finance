import { body, validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation rules for Saudi Entry
 * All fields are optional to support partial updates
 */
export const validateSaudiEntry = [
  body('date')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Date cannot be empty'),
  body('time')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Time cannot be empty'),
  body('refNo')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Reference number cannot be empty')
    .isUppercase()
    .withMessage('Reference number should be uppercase'),
  body('pkrAmount')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('PKR amount must be 0 or greater'),
  body('riyalRate')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Riyal rate must be 0 or greater'),
  body('submittedSar')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Submitted SAR must be 0 or greater'),
  body('reference2')
    .optional({ checkFalsy: true })
    .trim(),
  validate,
];

/**
 * Validation rules for Special Entry
 * All fields are optional to support partial updates
 */
export const validateSpecialEntry = [
  body('userName')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('User name cannot be empty'),
  body('date')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Date cannot be empty'),
  body('balanceType')
    .optional({ checkFalsy: true })
    .isIn(['Online', 'Cash'])
    .withMessage('Balance type must be either Online or Cash'),
  body('nameRupees')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Name rupees must be a positive number'),
  body('submittedRupees')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Submitted rupees must be a positive number'),
  body('referencePerson')
    .optional({ checkFalsy: true })
    .trim(),
  validate,
];

/**
 * Validation rules for Trader
 */
export const validateTrader = [
  body('name').trim().notEmpty().withMessage('Trader name is required'),
  body('shortName')
    .trim()
    .notEmpty()
    .withMessage('Short name is required')
    .isLength({ max: 10 })
    .withMessage('Short name cannot exceed 10 characters')
    .isUppercase()
    .withMessage('Short name should be uppercase'),
  body('color').optional().trim(),
  validate,
];

/**
 * Validation rules for Bank
 */
export const validateBank = [
  body('name').trim().notEmpty().withMessage('Bank name is required'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Bank code is required')
    .isUppercase()
    .withMessage('Bank code should be uppercase'),
  validate,
];

/**
 * Validation rules for Bank Ledger Entry
 * All fields are optional to support partial updates
 */
export const validateBankLedgerEntry = [
  body('date')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Date cannot be empty'),
  body('referenceType')
    .optional({ checkFalsy: true })
    .isIn(['Online', 'Cash'])
    .withMessage('Reference type must be either Online or Cash'),
  body('amountAdded')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Amount added must be a positive number'),
  body('amountWithdrawn')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Amount withdrawn must be a positive number'),
  validate,
];

