const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'docintel'
  });

  try {
    await pool.query("ALTER TABLE document_history MODIFY COLUMN action ENUM('VIEW', 'UPLOAD', 'SEARCH', 'OPEN', 'UPDATE_STATUS', 'EDIT_META', 'DELETE') NOT NULL;");
    console.log('SUCCESS: document_history ENUM updated!');
  } catch (e) {
    console.error('ERROR:', e.message);
  }

  await pool.end();
  process.exit(0);
})();
