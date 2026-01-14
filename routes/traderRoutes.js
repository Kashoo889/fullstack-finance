import express from 'express';
import {
  getTraders,
  getTrader,
  createTrader,
  updateTrader,
  deleteTrader,
} from '../controllers/traderController.js';
import { validateTrader } from '../middleware/validation.js';
import bankRoutes from './bankRoutes.js';

const router = express.Router();

// Nested bank routes
router.use('/:traderId/banks', bankRoutes);

router.route('/').get(getTraders).post(validateTrader, createTrader);
router.route('/:id').get(getTrader).put(validateTrader, updateTrader).delete(deleteTrader);

export default router;

