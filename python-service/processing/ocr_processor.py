import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import os
import logging

logger = logging.getLogger(__name__)

# Configure Tesseract path for Windows users if it's not in their PATH
# Standard installation path for Tesseract on Windows:
windows_tesseract_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
if os.path.exists(windows_tesseract_path):
    pytesseract.pytesseract.tesseract_cmd = windows_tesseract_path

def extract_text_with_ocr(file_path: str) -> str:
    """
    Extracts text using OCR. Handles both image files and scanned PDFs.
    """
    logger.info(f"Starting OCR processing for: {file_path}")
    ext = os.path.splitext(file_path)[1].lower()
    
    extracted_text = ""
    
    try:
        # If it's an image file
        if ext in ['.png', '.jpg', '.jpeg', '.tiff']:
            img = Image.open(file_path)
            extracted_text = pytesseract.image_to_string(img)
            
        # If it's a PDF file (scanned)
        elif ext == '.pdf':
            with fitz.open(file_path) as doc:
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    # Render page to an image (pixmap)
                    # Matrix(2, 2) increases resolution for much better OCR accuracy
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    
                    # Convert pixmap to PIL Image
                    mode = "RGBA" if pix.alpha else "RGB"
                    img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
                        
                    page_text = pytesseract.image_to_string(img)
                    extracted_text += page_text + "\n"
        else:
            logger.warning(f"Unsupported file type for OCR: {ext}")
            
    except pytesseract.TesseractNotFoundError:
        logger.error("Tesseract OCR is not installed or not found in PATH.")
        return "ERROR: Tesseract OCR is not installed on this system."
    except Exception as e:
        logger.error(f"OCR Error on {file_path}: {str(e)}")
        
    return extracted_text.strip()
