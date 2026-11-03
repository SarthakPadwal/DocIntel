import re

def classify_document(text: str) -> str:
    """
    Classify a document into one of the allowed categories:
    Invoice, Quotation, Tender, Purchase Document, Agreement, Other
    Based on keyword occurrences.
    """
    if not text:
        return "Other"
        
    text_lower = text.lower()
    
    # Dictionary of categories and their associated keywords (weighted)
    categories = {
        "Invoice": ["invoice", "tax invoice", "bill to", "invoice no", "invoice date", "amount due", "subtotal"],
        "Quotation": ["quotation", "quote", "estimate", "proposal", "validity"],
        "Tender": ["tender", "bid", "rfp", "request for proposal", "notice inviting tender", "nit"],
        "Purchase Document": ["purchase order", "po number", "order form", "delivery order", "packing slip"],
        "Agreement": ["agreement", "contract", "terms and conditions", "memorandum of understanding", "mou", "parties", "witnesseth"]
    }
    
    scores = {category: 0 for category in categories}
    
    for category, keywords in categories.items():
        for keyword in keywords:
            # Add points based on how many times the keyword appears
            scores[category] += text_lower.count(keyword)
            
            # Boost score significantly if keyword appears in the first 500 characters (header)
            header_text = text_lower[:500]
            if keyword in header_text:
                scores[category] += 2
                
    # Find the category with the highest score
    best_category = "Other"
    highest_score = 0
    
    for category, score in scores.items():
        if score > highest_score and score >= 2: # Require a minimum threshold of 2 points to avoid random misclassification
            highest_score = score
            best_category = category
            
    return best_category
