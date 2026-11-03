const fs = require('fs');
const mysql = require('mysql2/promise');

(async () => {
  try {
    const sql = fs.readFileSync('../database/user_migration.sql', 'utf8');
    const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'docintel', multipleStatements: true });
    await pool.query(sql);
    console.log('SUCCESS: Migration applied!');
    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
