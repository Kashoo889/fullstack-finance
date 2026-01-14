import express from 'express';
import {
  getBankLedgerEntries,
  getBankLedgerEntry,
  createBankLedgerEntry,
  updateBankLedgerEntry,
  deleteBankLedgerEntry,
} from '../controllers/bankLedgerController.js';
import { validateBankLedgerEntry } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getBankLedgerEntries)
  .post(validateBankLedgerEntry, createBankLedgerEntry);

router
  .route('/:entryId')
  .get(getBankLedgerEntry)
  .put(validateBankLedgerEntry, updateBankLedgerEntry)
  .delete(deleteBankLedgerEntry);

export default router;

