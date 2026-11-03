const { triggerDocumentProcessing } = require('./src/services/pythonProcessingService');
const { pool } = require('./src/config/db');

async function reprocess() {
  const [docs] = await pool.query('SELECT * FROM documents WHERE id IN (1, 2, 3, 4)');
  for (const doc of docs) {
    console.log(`Reprocessing ${doc.id}...`);
    await triggerDocumentProcessing(doc.id, doc.file_path);
  }
  process.exit(0);
}
reprocess();
