import db from '../config/db.js';

const Trader = {
  // Create a new trader
  create: async ({ name, shortName, color, totalBalance = 0 }) => {
    const query = `
      INSERT INTO traders (name, short_name, color, total_balance)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [name, shortName, color, totalBalance]);
    return { id: result.insertId, name, shortName, color, totalBalance };
  },

  // Find all traders
  findAll: async () => {
    const query = 'SELECT * FROM traders ORDER BY name ASC';
    const [rows] = await db.execute(query);
    return rows;
  },

  // Find trader by ID
  findById: async (id) => {
    const query = 'SELECT * FROM traders WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },

  // Update total balance
  updateBalance: async (id, amount) => {
    const query = 'UPDATE traders SET total_balance = total_balance + ? WHERE id = ?';
    await db.execute(query, [amount, id]);
  },
};

export default Trader;
