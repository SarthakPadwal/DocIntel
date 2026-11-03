const axios = require('axios');
const { pool } = require('../config/db');
const documentService = require('./documentService');

const PYTHON_SERVICE_URL = 'http://localhost:8000';

const triggerDocumentProcessing = async (documentId, filePath) => {
  try {
    // 1. Mark status as PROCESSING
    await pool.query(
      "UPDATE documents SET processing_status = 'PROCESSING' WHERE id = ?",
      [documentId]
    );

    console.log(`[PROCESSING] Document ${documentId} started. Path: ${filePath}`);

    // 2. Call Python Service
    const response = await axios.post(`${PYTHON_SERVICE_URL}/process-document`, {
      file_path: filePath
    });

    const data = response.data;

      // 3. Update document_information with extracted text and structured data
      if (data.success && data.extracted_text) {
        
        let updateQuery = "UPDATE document_information SET extracted_text = ?";
        let updateParams = [data.extracted_text];
        
        if (data.structured_data) {
          const sd = data.structured_data;
          
          if (sd.company_name !== undefined && sd.company_name !== null) { updateQuery += ", company_name = ?"; updateParams.push(sd.company_name); }
          if (sd.gst_number !== undefined && sd.gst_number !== null) { updateQuery += ", gst_number = ?"; updateParams.push(sd.gst_number); }
          if (sd.document_number !== undefined && sd.document_number !== null) { updateQuery += ", document_number = ?"; updateParams.push(sd.document_number); }
          if (sd.amount !== undefined) { updateQuery += ", amount = ?"; updateParams.push(sd.amount); }
          if (sd.payment_terms !== undefined) { updateQuery += ", payment_terms = ?"; updateParams.push(sd.payment_terms); }
          if (sd.summary !== undefined) { updateQuery += ", summary = ?"; updateParams.push(sd.summary); }
          if (sd.key_points !== undefined) { updateQuery += ", key_points = ?"; updateParams.push(sd.key_points); }
          
          if (sd.address !== undefined) { updateQuery += ", address = ?"; updateParams.push(sd.address); }
          if (sd.email !== undefined) { updateQuery += ", email = ?"; updateParams.push(sd.email); }
          if (sd.phone !== undefined) { updateQuery += ", phone = ?"; updateParams.push(sd.phone); }
          if (sd.pan !== undefined) { updateQuery += ", pan = ?"; updateParams.push(sd.pan); }
          if (sd.pincode !== undefined) { updateQuery += ", pincode = ?"; updateParams.push(sd.pincode); }
          if (sd.city !== undefined) { updateQuery += ", city = ?"; updateParams.push(sd.city); }
          if (sd.state !== undefined) { updateQuery += ", state = ?"; updateParams.push(sd.state); }
          if (sd.landmark !== undefined) { updateQuery += ", landmark = ?"; updateParams.push(sd.landmark); }
          if (sd.currency !== undefined) { updateQuery += ", currency = ?"; updateParams.push(sd.currency); }

          // Dates require reformatting to YYYY-MM-DD if possible
          if (sd.document_date) {
            // Regex match dd/mm/yyyy, dd.mm.yyyy, or dd-mm-yyyy and convert to YYYY-MM-DD
            const dateStr = String(sd.document_date);
            const match = dateStr.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
            if (match) {
              let [_, d, m, y] = match;
              if (y.length === 2) y = '20' + y;
              updateQuery += ", document_date = ?"; 
              updateParams.push(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
            }
          }
          if (sd.due_date) {
            const dateStr = String(sd.due_date);
            const match = dateStr.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
            if (match) {
              let [_, d, m, y] = match;
              if (y.length === 2) y = '20' + y;
              updateQuery += ", due_date = ?"; 
              updateParams.push(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
            }
          }
        }
        
        updateQuery += " WHERE document_id = ?";
        updateParams.push(documentId);
        
        await pool.query(updateQuery, updateParams);
      
      // Update the main document with processed status and classified document_type
      if (data.document_type && data.document_type !== 'Other') {
        await pool.query(
          "UPDATE documents SET processing_status = 'PROCESSED', document_type = ? WHERE id = ?",
          [data.document_type, documentId]
        );
      } else {
        await pool.query(
          "UPDATE documents SET processing_status = 'PROCESSED' WHERE id = ?",
          [documentId]
        );
      }
      
      console.log(`[PROCESSING] Document ${documentId} completed successfully.`);
    } else {
      await pool.query(
        "UPDATE documents SET processing_status = 'FAILED' WHERE id = ?",
        [documentId]
      );
      console.log(`[PROCESSING] Document ${documentId} failed extraction.`);
    }

  } catch (error) {
    console.error(`[PROCESSING] Document ${documentId} failed:`, error.message);
    // Mark as FAILED on error
    await pool.query(
      "UPDATE documents SET processing_status = 'FAILED' WHERE id = ?",
      [documentId]
    );
  }
};

module.exports = {
  triggerDocumentProcessing
};
