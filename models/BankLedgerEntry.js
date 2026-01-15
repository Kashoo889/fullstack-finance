import db from '../config/db.js';

const BankLedgerEntry = {
  create: async ({ bankId, date, referenceType, amountAdded = 0, amountWithdrawn = 0, referencePerson, remainingAmount }) => {
    const query = `
      INSERT INTO bank_ledger_entries (bank_id, date, reference_type, amount_added, amount_withdrawn, reference_person, remaining_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [bankId, date, referenceType, amountAdded, amountWithdrawn, referencePerson, remainingAmount]);
    return { id: result.insertId, bankId, date, referenceType, amountAdded, amountWithdrawn, referencePerson, remainingAmount };
  },

  findByBankId: async (bankId) => {
    const query = 'SELECT * FROM bank_ledger_entries WHERE bank_id = ? ORDER BY created_at DESC';
    const [rows] = await db.execute(query, [bankId]);
    return rows;
  },

  findById: async (id) => {
    const query = 'SELECT * FROM bank_ledger_entries WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },
};

export default BankLedgerEntry;
