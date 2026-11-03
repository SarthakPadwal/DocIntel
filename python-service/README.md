# DocIntel — Python OCR / AI Service (Phase 2)

This directory will contain the Python-based document processing service in Phase 2.

## Planned Architecture

```
python-service/
├── app.py                 # FastAPI application entry point
├── ocr/
│   └── text_extractor.py  # Tesseract OCR text extraction
├── classification/
│   └── classifier.py      # Document type classification
├── extraction/
│   └── info_extractor.py  # Key information extraction
├── summarization/
│   └── summarizer.py      # AI summary generation
├── requirements.txt
└── README.md
```

## Planned Technologies

- **Python 3.10+**
- **FastAPI** — REST API framework
- **Tesseract OCR** — Text extraction from images/scanned PDFs
- **Pillow / OpenCV** — Image preprocessing
- **PyPDF2 / pdfplumber** — PDF text extraction
- **AI/LLM** — Document classification, summary generation

## Integration with Node.js Backend

The Node.js backend will call this service via HTTP after a document is uploaded:

```
Node.js POST /process → Python FastAPI
Python processes document → Returns structured data
Node.js updates MySQL with extracted information
```

### Expected API

```
POST /api/process
Body: { document_id, file_path }
Response: {
  company_name, gst_number, document_number,
  document_date, due_date, amount,
  key_points, summary, extracted_text,
  document_type_detected
}
```

## Status

🔴 **Not implemented yet** — This service is planned for Phase 2.

The Node.js backend and MySQL database are already structured to receive and store 
the data this service will produce. The `document_information` table and 
`processing_status` field are ready for integration.
