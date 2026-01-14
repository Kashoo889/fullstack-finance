import express from 'express';
import {
  getSpecialEntries,
  getSpecialEntry,
  createSpecialEntry,
  updateSpecialEntry,
  deleteSpecialEntry,
} from '../controllers/specialController.js';
import { validateSpecialEntry } from '../middleware/validation.js';

const router = express.Router();

router.route('/').get(getSpecialEntries).post(validateSpecialEntry, createSpecialEntry);
router.route('/:id').get(getSpecialEntry).put(validateSpecialEntry, updateSpecialEntry).delete(deleteSpecialEntry);

export default router;

