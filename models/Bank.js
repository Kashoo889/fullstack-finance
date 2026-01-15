import db from '../config/db.js';

const Bank = {
  // Create a new bank
  create: async ({ traderId, name, code, totalBalance = 0 }) => {
    const query = `
      INSERT INTO banks (trader_id, name, code, total_balance)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [traderId, name, code, totalBalance]);
    return { id: result.insertId, traderId, name, code, totalBalance };
  },

  // Find all banks for a specific trader
  findByTraderId: async (traderId) => {
    const query = 'SELECT * FROM banks WHERE trader_id = ? ORDER BY name ASC';
    const [rows] = await db.execute(query, [traderId]);
    return rows;
  },

  // Find bank by ID
  findById: async (id) => {
    const bankId = Number(id);

    // Attempt 1: Standard query
    const query = 'SELECT * FROM banks WHERE id = ?';
    const [rows] = await db.execute(query, [bankId]);

    if (rows[0]) return rows[0];

    // Attempt 2: Fallback (Fetch all and search) - fixes mysterious Hostinger binding issue
    console.log(`Fallback search for bankId: ${bankId}`);
    const checkQuery = 'SELECT * FROM banks';
    const [allRows] = await db.execute(checkQuery);
    return allRows.find(b => b.id === bankId);
  },

  // Update bank balance
  updateBalance: async (id, amount) => {
    const query = 'UPDATE banks SET total_balance = total_balance + ? WHERE id = ?';
    await db.execute(query, [amount, id]);
  },
};

export default Bank;
