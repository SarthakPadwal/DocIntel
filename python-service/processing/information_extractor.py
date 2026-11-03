import re

def extract_structured_data(text: str) -> dict:
    """
    Extracts structured fields from raw document text using regex and heuristics.
    """
    data = {
        "company_name": None, "gst_number": None, "document_number": None,
        "document_date": None, "due_date": None, "amount": None, "payment_terms": None,
        "address": None, "email": None, "phone": None, "pan": None,
        "pincode": None, "city": None, "state": None, "landmark": None, "currency": None,
        "summary": None, "key_points": None
    }
    
    if not text:
        return data
        
    text_lines = [line.strip() for line in text.split('\n') if line.strip()]
    text_lower = text.lower()
    
    # 1. Company Name (First non-empty line usually)
    ignore_words = ['invoice', 'quotation', 'tax', 'receipt', 'bill', 'tender', 'purchase order', 'notice']
    for line in text_lines[:5]:
        if not any(word in line.lower() for word in ignore_words) and len(line) > 3:
            data["company_name"] = line[:255]
            break

    # Extract all the new tabular fields using robust regex
    
    # Email
    email_match = re.search(r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', text)
    if email_match: data["email"] = email_match.group(1)[:255]

    # Phone
    phone_match = re.search(r'(?i)(?:tel|phone|mob|ph)[\s:]*([\+\d\s-]{10,20})', text)
    if phone_match: data["phone"] = phone_match.group(1).strip()[:50]

    # PAN
    pan_match = re.search(r'(?i)pan[\s:]*([A-Z]{5}[0-9]{4}[A-Z]{1})', text)
    if pan_match: data["pan"] = pan_match.group(1).upper()[:20]

    # GST
    gst_match = re.search(r'(?i)(?:gstin|gst\s*no)[\s:]*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})', text)
    if gst_match: data["gst_number"] = gst_match.group(1).upper()

    # Pincode
    pin_match = re.search(r'\b([1-9][0-9]{5})\b', text)
    if pin_match: data["pincode"] = pin_match.group(1)[:20]

    # State
    state_match = re.search(r'(?i)state[\s:]*([a-zA-Z\s]+)(?:\(|$)', text)
    if state_match: data["state"] = state_match.group(1).strip()[:100]
    elif "Maharashtra" in text: data["state"] = "Maharashtra"

    # Address Heuristic
    if len(text_lines) >= 3:
        addr_lines = []
        for i in range(1, min(6, len(text_lines))):
            l = text_lines[i].lower()
            if not any(k in l for k in ['tel', 'email', 'gst', 'pan', 'cin', 'state', 'notice']):
                addr_lines.append(text_lines[i])
        data["address"] = ", ".join(addr_lines)[:500] if addr_lines else None
        
    # Landmark Heuristic (near, opp, beside) - STRICTER
    land_match = re.search(r'(?i)\b(near|opp\.|opposite to|behind|beside)\s+([A-Za-z0-9\s,]{5,50})(?:\n|$)', text)
    if land_match: data["landmark"] = land_match.group(0).strip()

    # Currency
    if "USD" in text or "$" in text: data["currency"] = "USD"
    elif "INR" in text or "Rs" in text or "₹" in text: data["currency"] = "INR"
    elif data.get("state") or data.get("pincode"): data["currency"] = "INR"
    else: data["currency"] = "INR"

    # Multiline parsing for Document Number, Date, Amount
    for i, line in enumerate(text_lines):
        line_lower = line.lower()
        
        # Document Number
        if not data.get("document_number") and any(k in line_lower for k in ['invoice #', 'invoice no', 'tender no', 'document no', 'bill no', 'po number', 'po no', 'order no']):
            match = re.search(r'(?i)(?:po\s*number|po\s*no\.?|order\s*no\.?|invoice\s*no\.?|tender\s*no\.?|document\s*no\.?|bill\s*no\.?|(?:no|#))[\s.:-]*([A-Za-z0-9\-/]+)', line)
            if match and len(match.group(1)) > 2:
                data["document_number"] = match.group(1)
            elif i + 1 < len(text_lines):
                next_l = text_lines[i+1].strip()
                if len(next_l) > 3 and " " not in next_l:
                    data["document_number"] = next_l

        # Dates
        if not data.get("document_date") and any(k in line_lower for k in ['date of issue', 'invoice date', 'document date', 'po date', 'order date', 'date']):
            match = re.search(r'(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})', line)
            if match: data["document_date"] = match.group(1)
            elif i + 1 < len(text_lines):
                nmatch = re.search(r'(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})', text_lines[i+1])
                if nmatch: data["document_date"] = nmatch.group(1)

        # Due Date / Delivery Date / Submission Deadline
        if not data.get("due_date") and any(k in line_lower for k in ['due date', 'delivery date', 'valid till', 'expiry', 'submission', 'last date', 'bid submission']):
            match = re.search(r'(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})', line)
            if match: data["due_date"] = match.group(1)
            elif i + 1 < len(text_lines):
                nmatch = re.search(r'(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})', text_lines[i+1])
                if nmatch: data["due_date"] = nmatch.group(1)

        # Amount (STRICTER: ignore percentages, pick highest confidence)
        if not data.get("amount") and any(k in line_lower for k in ['po total', 'grand total', 'total amount', 'total value', 'amount payable']):
            match = re.search(r'(?:rs\.?|inr|\$|₹)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)\b(?!\s*%)', line)
            if match: 
                val = match.group(1).replace(',', '')
                try: data["amount"] = float(val)
                except: pass
                
    # Fallback amount if not found
    if not data.get("amount"):
        for line in text_lines:
            if any(k in line.lower() for k in ['total', 'po total', 'net amount']):
                match = re.search(r'(?:rs\.?|inr|\$|₹)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)\b(?!\s*%)', line)
                if match:
                    val = match.group(1).replace(',', '')
                    try: 
                        data["amount"] = float(val)
                        break
                    except: pass
                    
    # Payment Terms
    terms_match = re.search(r'(?i)(terms|payment terms)\s*[:.-]?\s*([a-zA-Z0-9\s]+)(?:\n|$)', text)
    if terms_match:
        term_val = terms_match.group(2).strip()
        if len(term_val) > 3 and len(term_val) < 50:
            data["payment_terms"] = term_val
            
    # Step 8 & 9: Summary and Key Points
    summary_lines = []
    for line in text_lines:
        if len(line) > 20 and not any(kw in line.lower() for kw in ['invoice', 'page', 'date']):
            summary_lines.append(line)
        if len(summary_lines) >= 2: break
            
    if summary_lines: data["summary"] = f"Document appears to be from {data.get('company_name', 'Unknown')}. " + " ".join(summary_lines)
    else: data["summary"] = f"A document from {data.get('company_name', 'Unknown')}."

    key_points = []
    important_keywords = ['total', 'due', 'tax', 'balance', 'penalty', 'deliver', 'terms']
    for line in text_lines:
        if any(kw in line.lower() for kw in important_keywords) and len(line) > 10:
            key_points.append(f"• {line}")
            
    if key_points:
        unique_points = list(dict.fromkeys(key_points))[:4]
        data["key_points"] = "\n".join(unique_points)
    else:
        data["key_points"] = "• No critical financial or action items detected.\n• Standard processing applied."

    return data
