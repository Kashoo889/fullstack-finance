import db from '../config/db.js';

const SaudiEntry = {
  create: async ({ date, time, refNo, pkrAmount, riyalRate, riyalAmount, submittedSar, reference2, balance }) => {
    const query = `
      INSERT INTO saudi_hisaab_entries (date, time, ref_no, pkr_amount, riyal_rate, riyal_amount, submitted_sar, reference2, balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [date, time, refNo, pkrAmount, riyalRate, riyalAmount, submittedSar, reference2, balance]);
    return { id: result.insertId, date, time, refNo, pkrAmount, riyalRate, riyalAmount, submittedSar, reference2, balance };
  },

  findAll: async () => {
    const query = 'SELECT * FROM saudi_hisaab_entries ORDER BY created_at DESC';
    const [rows] = await db.execute(query);
    return rows;
  },

  findById: async (id) => {
    const query = 'SELECT * FROM saudi_hisaab_entries WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },
};

export default SaudiEntry;
