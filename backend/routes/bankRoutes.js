import express from 'express';
import {
  getBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
} from '../controllers/bankController.js';
import { validateBank } from '../middleware/validation.js';
import bankLedgerRoutes from './bankLedgerRoutes.js';

const router = express.Router({ mergeParams: true });

// Nested ledger routes
router.use('/:bankId/ledger', bankLedgerRoutes);

router.route('/').get(getBanks).post(validateBank, createBank);
router.route('/:bankId').get(getBank).put(validateBank, updateBank).delete(deleteBank);

export default router;

