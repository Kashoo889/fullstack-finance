import express from 'express';
import {
  getSaudiEntries,
  getSaudiEntry,
  createSaudiEntry,
  updateSaudiEntry,
  deleteSaudiEntry,
} from '../controllers/saudiController.js';
import { validateSaudiEntry } from '../middleware/validation.js';

const router = express.Router();

router.route('/').get(getSaudiEntries).post(validateSaudiEntry, createSaudiEntry);
router.route('/:id').get(getSaudiEntry).put(validateSaudiEntry, updateSaudiEntry).delete(deleteSaudiEntry);

export default router;

