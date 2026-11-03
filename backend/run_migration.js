const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'docintel'
  });

  try {
    await pool.query('ALTER TABLE users ADD COLUMN department VARCHAR(100) NULL AFTER role, ADD COLUMN designation VARCHAR(100) NULL AFTER department');
    console.log('SUCCESS: department and designation columns added to users table!');
  } catch (e) {
    if (e.message.includes('Duplicate column')) {
      console.log('Columns already exist - no changes needed.');
    } else {
      console.error('ERROR:', e.message);
    }
  }

  await pool.end();
  process.exit(0);
})();
