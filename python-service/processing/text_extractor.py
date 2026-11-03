import fitz  # PyMuPDF
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts embedded text from a digital PDF using PyMuPDF.
    Returns the extracted text as a string.
    """
    try:
        logger.info(f"Attempting to extract text from digital PDF: {file_path}")
        text = ""
        with fitz.open(file_path) as doc:
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                # extract_text() gets the digital text layer
                page_text = page.get_text()
                if page_text:
                    text += page_text + "\n"
        
        # Clean up whitespace slightly
        text = text.strip()
        logger.info(f"Extracted {len(text)} characters from {file_path}")
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        return ""
