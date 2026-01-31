import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Validation middleware
 */
const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

const validateChangeEmail = [
  body('newEmail').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('currentPassword').notEmpty().withMessage('Current password is required for security'),
];

const validateUpdateName = [
  body('name').notEmpty().withMessage('Name is required').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
];

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
router.post(
  '/register',
  validateRegister,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  })
);

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
router.post(
  '/login',
  validateLogin,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Normalize email (lowercase) for case-insensitive lookup
      const normalizedEmail = email.toLowerCase().trim();
      
      // Find user with retry logic (handled in User model)
      const user = await User.findByEmail(normalizedEmail);
      if (!user) {
        console.error('Login failed: User not found', { email: normalizedEmail });
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      // Check if user has a password
      if (!user.password) {
        console.error('Login failed: User has no password', { userId: user.id, email: user.email });
        return res.status(401).json({ success: false, error: 'Account configuration error. Please contact administrator.' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.error('Login failed: Password mismatch', { userId: user.id, email: user.email });
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(user.id);

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      // Handle database connection errors specifically
      console.error('Login error:', {
        code: error.code,
        message: error.message,
        host: process.env.DB_HOST || 'not set',
        user: process.env.DB_USER || 'not set',
        database: process.env.DB_NAME || 'not set',
      });
      
      // Check for specific error types
      if (error.code === 'ECONNRESET' || 
          error.code === 'PROTOCOL_CONNECTION_LOST' ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ER_ACCESS_DENIED_ERROR' ||
          error.message.includes('Access denied') ||
          error.message.includes('Connection lost') ||
          error.message.includes('getaddrinfo ENOTFOUND')) {
        
        // Provide more specific error message
        let errorMessage = 'Database connection error. Please try again in a moment.';
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.message.includes('Access denied')) {
          errorMessage = 'Database authentication failed. Please check your database credentials.';
        } else if (error.code === 'ECONNREFUSED' || error.message.includes('ENOTFOUND')) {
          errorMessage = 'Cannot connect to database server. Please check your database host configuration.';
        } else if (error.code === 'ER_BAD_DB_ERROR') {
          errorMessage = 'Database not found. Please check your database name.';
        }
        
        return res.status(503).json({ 
          success: false, 
          error: errorMessage,
          // In development, include more details for debugging
          ...(process.env.NODE_ENV === 'development' && { 
            details: error.message,
            code: error.code,
            host: process.env.DB_HOST,
          })
        });
      }
      // Re-throw other errors to be handled by asyncHandler
      throw error;
    }
  })
);

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };
  res.status(200).json({ success: true, user });
}));

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
router.put(
  '/change-password',
  protect,
  validateChangePassword,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get fresh user data including password
    const user = await User.findById(req.user.id);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.updatePassword(user.id, hashedPassword);

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  })
);

/**
 * @desc    Change user email
 * @route   PUT /api/auth/change-email
 * @access  Private
 */
router.put(
  '/change-email',
  protect,
  validateChangeEmail,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { newEmail, currentPassword } = req.body;

    // Get fresh user data including password
    const user = await User.findById(req.user.id);

    // Verify current password for security
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    // Check if new email is different from current email
    if (user.email.toLowerCase() === newEmail.toLowerCase()) {
      return res.status(400).json({ success: false, error: 'New email must be different from current email' });
    }

    // Update email
    try {
      await User.updateEmail(user.id, newEmail);

      // Get updated user data
      const updatedUser = await User.findById(user.id);

      res.status(200).json({
        success: true,
        message: 'Email updated successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } catch (error) {
      if (error.message === 'Email already in use') {
        return res.status(400).json({ success: false, error: 'This email is already registered' });
      }
      throw error;
    }
  })
);

/**
 * @desc    Update user name
 * @route   PUT /api/auth/update-name
 * @access  Private
 */
router.put(
  '/update-name',
  protect,
  validateUpdateName,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name } = req.body;

    // Update name
    await User.updateName(req.user.id, name);

    // Get updated user data
    const updatedUser = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Name updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  })
);

export default router;
