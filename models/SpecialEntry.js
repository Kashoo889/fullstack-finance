import db from '../config/db.js';

const SpecialEntry = {
  create: async ({ userName, date, balanceType, nameRupees, submittedRupees, referencePerson, balance }) => {
    const query = `
      INSERT INTO special_hisaab_entries (user_name, date, balance_type, name_rupees, submitted_rupees, reference_person, balance)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [userName, date, balanceType, nameRupees, submittedRupees, referencePerson, balance]);
    return { id: result.insertId, userName, date, balanceType, nameRupees, submittedRupees, referencePerson, balance };
  },

  findAll: async () => {
    const query = 'SELECT * FROM special_hisaab_entries ORDER BY created_at DESC';
    const [rows] = await db.execute(query);
    return rows;
  },

  findById: async (id) => {
    const query = 'SELECT * FROM special_hisaab_entries WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },
};

export default SpecialEntry;
