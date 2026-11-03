from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import logging
import os
from processing.text_extractor import extract_text_from_pdf
from processing.ocr_processor import extract_text_with_ocr

from processing.classifier import classify_document
from processing.information_extractor import extract_structured_data

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="DocIntel Document Processing Service", version="1.0.0")

# Allow requests from Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocumentRequest(BaseModel):
    file_path: str  # Expected format: uploads/documents/filename.pdf

@app.get("/")
@app.get("/health")
def read_root():
    return {"status": "ok", "service": "DocIntel Python AI Service", "version": "1.0.0"}

@app.post("/process-document")
def process_document(req: DocumentRequest):
    """
    Step 4, 5, 6, 7: Extract text, OCR fallback, classify, and extract structured info.
    """
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
    full_path = os.path.join(base_path, req.file_path)
    
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail=f"File not found: {full_path}")
        
    ext = os.path.splitext(full_path)[1].lower()
    extracted_text = ""
    
    # 1. Attempt normal text extraction if it's a PDF
    if ext == '.pdf':
        extracted_text = extract_text_from_pdf(full_path)
        
    # 2. If it's an image OR a scanned PDF (where normal extraction yielded < 50 characters)
    if not extracted_text or len(extracted_text.strip()) < 50:
        logger.info(f"Insufficient or no digital text found. Falling back to OCR for {full_path}")
        ocr_text = extract_text_with_ocr(full_path)
        if ocr_text:
            extracted_text = ocr_text

    # 3. Step 6: Classify document type based on extracted text
    document_type = "Other"
    if extracted_text:
        document_type = classify_document(extracted_text)
        
    # 4. Step 7: Extract structured information (Company, GST, Date, Amount, etc.)
    structured_data = {}
    if extracted_text:
        structured_data = extract_structured_data(extracted_text)
    
    return {
        "success": True,
        "processing_status": "PROCESSED" if extracted_text else "FAILED",
        "extracted_text": extracted_text,
        "document_type": document_type,
        "structured_data": structured_data,
        "message": "Processing completed" if extracted_text else "No text found"
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
