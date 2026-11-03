import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Skip cover page
        
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header
        self.drawString(54, 11 * inch - 36, "DOCINTEL PLATFORM — MASTER ARCHITECTURE & CODEBASE GUIDE")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.75)
        self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)
        
        # Footer
        self.line(54, 46, 8.5 * inch - 54, 46)
        self.setFont("Helvetica", 8)
        self.drawString(54, 34, "DocIntel Enterprise Architecture • Version 4.8 Hybrid")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 34, page_str)
        self.restoreState()

def build_pdf(filename="DocIntel_Complete_Architecture_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY = colors.HexColor("#0f172a")     # Deep Slate
    ACCENT = colors.HexColor("#0284c7")      # Cyan / Blue
    TEXT_DARK = colors.HexColor("#1e293b")
    TEXT_MUTED = colors.HexColor("#64748b")
    CARD_BG = colors.HexColor("#f8fafc")
    BORDER_COL = colors.HexColor("#cbd5e1")
    SUCCESS = colors.HexColor("#166534")
    WARNING = colors.HexColor("#92400e")
    DANGER = colors.HexColor("#991b1b")

    # Typography styles
    style_cover_badge = ParagraphStyle(
        'CoverBadge',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=ACCENT,
        textTransform='uppercase',
        spaceAfter=14
    )
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        fontName='Helvetica-Bold',
        fontSize=30,
        leading=34,
        textColor=PRIMARY,
        spaceAfter=12
    )
    style_cover_sub = ParagraphStyle(
        'CoverSub',
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=TEXT_MUTED,
        spaceAfter=30
    )
    style_h1 = ParagraphStyle(
        'Heading1_Custom',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=PRIMARY,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )
    style_h2 = ParagraphStyle(
        'Heading2_Custom',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=ACCENT,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    style_h3 = ParagraphStyle(
        'Heading3_Custom',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=TEXT_DARK,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    style_body = ParagraphStyle(
        'Body_Custom',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=TEXT_DARK,
        spaceAfter=8
    )
    style_bullet = ParagraphStyle(
        'Bullet_Custom',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4
    )
    style_code = ParagraphStyle(
        'Code_Custom',
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f1f5f9"),
        borderPadding=6,
        spaceAfter=8
    )
    style_callout = ParagraphStyle(
        'Callout_Text',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0369a1")
    )
    style_table_cell = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=TEXT_DARK
    )
    style_table_header = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=PRIMARY
    )

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 40))
    story.append(Paragraph("TECHNICAL ARCHITECTURE & CODEBASE MASTER GUIDE", style_cover_badge))
    story.append(Paragraph("DocIntel — AI Document Intelligence Platform", style_cover_title))
    story.append(Paragraph(
        "An exhaustive multi-tier engineering handbook covering Database Schemas, "
        "Python OCR/AI Microservice, Node.js Express Gateway, React Single-Page Application, "
        "Server Startup Runbooks, and Synchronized Business Logic.",
        style_cover_sub
    ))
    story.append(HRFlowable(width="100%", thickness=3, color=ACCENT, spaceAfter=30))

    meta_data = [
        [Paragraph("<b>Document Version:</b>", style_table_cell), Paragraph("v4.8 Multi-Tier Enterprise Architecture", style_table_cell)],
        [Paragraph("<b>Target Stack:</b>", style_table_cell), Paragraph("Node.js 22 + Python 3.12 + FastAPI + React 18 + MySQL 8.0", style_table_cell)],
        [Paragraph("<b>Platform Scope:</b>", style_table_cell), Paragraph("OCR Ingestion, Entity Extraction, Compliance & Audit Trail", style_table_cell)],
        [Paragraph("<b>Date of Compilation:</b>", style_table_cell), Paragraph("October 2026", style_table_cell)],
        [Paragraph("<b>Author / System:</b>", style_table_cell), Paragraph("DocIntel Core Engineering & Systems Architecture", style_table_cell)]
    ]
    meta_table = Table(meta_data, colWidths=[140, 360])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COL),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('LINEBELOW', (0,0), (-1,-2), 0.5, BORDER_COL),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 40))
    toc_data = [
        [Paragraph("<b>SECTION</b>", style_table_header), Paragraph("<b>TOPIC COVERAGE</b>", style_table_header)],
        [Paragraph("Section 1", style_table_cell), Paragraph("Executive Architecture Overview & Component Topology", style_table_cell)],
        [Paragraph("Section 2", style_table_cell), Paragraph("Server Orchestration & Startup Runbook (All 4 Tiers)", style_table_cell)],
        [Paragraph("Section 3", style_table_cell), Paragraph("Database Layer Breakdown & Relational Schema (database/)", style_table_cell)],
        [Paragraph("Section 4", style_table_cell), Paragraph("Python OCR & AI Intelligence Engine (python-service/)", style_table_cell)],
        [Paragraph("Section 5", style_table_cell), Paragraph("Node.js Express API Gateway & Business Layer (backend/)", style_table_cell)],
        [Paragraph("Section 6", style_table_cell), Paragraph("Frontend Single-Page Application (frontend/)", style_table_cell)],
        [Paragraph("Section 7", style_table_cell), Paragraph("Complete REST API Endpoints Specification", style_table_cell)],
        [Paragraph("Section 8", style_table_cell), Paragraph("End-to-End Ingestion Lifecycle & Data Flow", style_table_cell)],
        [Paragraph("Section 9", style_table_cell), Paragraph("Key Algorithms, Synchronized Metrics & Problem-Solving Ledger", style_table_cell)]
    ]
    toc_table = Table(toc_data, colWidths=[90, 410])
    toc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COL),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(toc_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 1: ARCHITECTURE OVERVIEW
    # =========================================================================
    story.append(Paragraph("1. Executive Architecture Overview", style_h1))
    story.append(Paragraph(
        "DocIntel is a centralized company document intelligence platform designed to eliminate "
        "document fragmentation across desktop folders, email threads, and local drives. It implements "
        "a decoupled multi-tier architecture where each service has strict boundaries of responsibility:",
        style_body
    ))

    arch_points = [
        "<b>Frontend Tier (Port 5173)</b>: Single-Page Application written in React 18, Vite, and modern CSS. Manages UI states, authenticated JWT sessions, document previews, and reactive dashboards.",
        "<b>API Gateway Tier (Port 5000)</b>: Express.js server providing authentication (JWT + bcrypt), authorization guards (Role-Based Access Control), disk storage handling via Multer, audit logging, and parameterized relational MySQL communication.",
        "<b>AI Microservice Tier (Port 8000)</b>: Python 3.12 FastAPI microservice. Executes optical character recognition (OCR) with Tesseract, computer vision image preprocessing via OpenCV, document classification, regex parsing for statutory entities (GSTIN, PAN, dates, financial amounts), and executive summary synthesis.",
        "<b>Database Tier (Port 3306)</b>: MySQL 8.0 relational database schema (docintel) maintaining ACID compliance, foreign key constraints, soft-deletion attributes, and full audit histories."
    ]
    for p in arch_points:
        story.append(Paragraph(f"• {p}", style_bullet))

    story.append(Spacer(1, 10))
    story.append(Paragraph("High-Level Topology Representation:", style_h3))
    topology_code = (
        "Frontend (React:5173) ---[Bearer JWT / REST]---> Express Backend (:5000)\n"
        "                                                       |\n"
        "                                                       +---[File Path / HTTP]---> Python AI (:8000)\n"
        "                                                       |                             |\n"
        "                                                       |                             v\n"
        "                                                       |                      (Tesseract + OpenCV)\n"
        "                                                       v\n"
        "                                                MySQL Database (:3306)\n"
        "                                          [users, docs, info, search, history]"
    )
    story.append(Paragraph(topology_code.replace("\n", "<br/>").replace(" ", "&nbsp;"), style_code))

    # =========================================================================
    # SECTION 2: STARTUP RUNBOOK
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("2. Server Orchestration & Startup Runbook", style_h1))
    story.append(Paragraph(
        "DocIntel requires four execution environments running in tandem. Below are the precise startup "
        "commands and health checks for each service:",
        style_body
    ))

    services_data = [
        [
            Paragraph("<b>SERVICE</b>", style_table_header),
            Paragraph("<b>PORT</b>", style_table_header),
            Paragraph("<b>DIRECTORY & START COMMAND</b>", style_table_header),
            Paragraph("<b>HEALTH VERIFICATION</b>", style_table_header)
        ],
        [
            Paragraph("<b>1. MySQL DB</b>", style_table_cell),
            Paragraph("3306", style_table_cell),
            Paragraph("<code>net start MySQL80</code> (or via Windows Services / XAMPP)", style_table_cell),
            Paragraph("<code>SELECT 1;</code> on database <code>docintel</code>", style_table_cell)
        ],
        [
            Paragraph("<b>2. Python AI</b>", style_table_cell),
            Paragraph("8000", style_table_cell),
            Paragraph("<code>cd python-service<br/>.\\venv\\Scripts\\Activate.ps1<br/>uvicorn app:app --host 0.0.0.0 --port 8000 --reload</code>", style_table_cell),
            Paragraph("<code>GET http://localhost:8000/health</code><br/>&rarr; 200 OK Status", style_table_cell)
        ],
        [
            Paragraph("<b>3. Node.js API</b>", style_table_cell),
            Paragraph("5000", style_table_cell),
            Paragraph("<code>cd backend<br/>npm run dev</code>", style_table_cell),
            Paragraph("<code>GET http://localhost:5000/api/health</code><br/>&rarr; 200 OK Status", style_table_cell)
        ],
        [
            Paragraph("<b>4. React Web</b>", style_table_cell),
            Paragraph("5173", style_table_cell),
            Paragraph("<code>cd frontend<br/>npm run dev</code>", style_table_cell),
            Paragraph("Open browser at <code>http://localhost:5173</code>", style_table_cell)
        ]
    ]
    srv_table = Table(services_data, colWidths=[80, 45, 235, 140])
    srv_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COL),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(srv_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 3: DATABASE ARCHITECTURE
    # =========================================================================
    story.append(Paragraph("3. Database Architecture (database/)", style_h1))
    story.append(Paragraph(
        "The database is structured to support strong referential integrity, cascading updates, "
        "high-speed search indexing, and complete chronological audit tracking.",
        style_body
    ))

    story.append(Paragraph("Database File Index:", style_h2))
    story.append(Paragraph("• <b>database/schema.sql</b>: Full DDL script defining tables, foreign keys, and indexes.", style_bullet))
    story.append(Paragraph("• <b>database/seed.sql</b>: Realistic demo data containing admin, users, documents, and extracted metadata.", style_bullet))
    story.append(Paragraph("• <b>database/user_migration.sql</b>: Migration script adding department and designation columns to users.", style_bullet))
    story.append(Paragraph("• <b>database/migrate_add_dept.sql</b>: Adds soft-delete attributes (is_deleted, deleted_at, deleted_by).", style_bullet))
    story.append(Paragraph("• <b>database/run_migration.js</b>: Automated Node.js migration execution runner.", style_bullet))

    story.append(Spacer(1, 6))
    story.append(Paragraph("Core Relational Tables Schema:", style_h2))

    schema_tables = [
        ("Table 1: users", [
            ("id", "INT AUTO_INCREMENT PRIMARY KEY", "Unique user ID"),
            ("name", "VARCHAR(100) NOT NULL", "Full display name"),
            ("email", "VARCHAR(255) NOT NULL UNIQUE", "Login credential (indexed)"),
            ("password_hash", "VARCHAR(255) NOT NULL", "Bcrypt salted hash"),
            ("role", "ENUM('USER', 'ADMIN') DEFAULT 'USER'", "RBAC authorization level"),
            ("department", "VARCHAR(100)", "Corporate department"),
            ("designation", "VARCHAR(100)", "Job title / position"),
            ("created_at / updated_at", "DATETIME", "Automatic audit timestamps")
        ]),
        ("Table 2: documents", [
            ("id", "INT AUTO_INCREMENT PRIMARY KEY", "Document identifier (DOC-0001)"),
            ("uploaded_by", "INT NOT NULL", "Foreign key references users(id)"),
            ("original_filename", "VARCHAR(255) NOT NULL", "Source file name"),
            ("stored_filename", "VARCHAR(255) NOT NULL", "Disk storage filename"),
            ("file_path", "VARCHAR(500) NOT NULL", "Path on filesystem (uploads/...)"),
            ("file_type", "VARCHAR(50)", "MIME type (PDF, PNG, JPEG)"),
            ("file_size", "INT", "File size in bytes"),
            ("document_type", "ENUM('Invoice', 'Quotation', 'Tender', ...)", "Document business category"),
            ("status", "ENUM('PENDING', 'DONE')", "Workflow approval status"),
            ("processing_status", "ENUM('UPLOADED', 'PROCESSING', ...)", "AI OCR pipeline state"),
            ("document_date / due_date", "DATE", "Issue and deadline cutoff dates"),
            ("is_deleted", "TINYINT(1) DEFAULT 0", "Soft-deletion flag (0=Active, 1=Recycled)")
        ]),
        ("Table 3: document_information (1-to-1 with documents)", [
            ("id", "INT AUTO_INCREMENT PRIMARY KEY", "Metadata entry ID"),
            ("document_id", "INT NOT NULL UNIQUE", "FK to documents(id) ON DELETE CASCADE"),
            ("company_name", "VARCHAR(255)", "Extracted vendor/issuer entity"),
            ("gst_number", "VARCHAR(50)", "Indian GST statutory number"),
            ("document_number", "VARCHAR(100)", "Invoice/PO/Tender reference #"),
            ("document_date / due_date", "DATE", "Extracted issue and deadline dates"),
            ("amount", "DECIMAL(15,2)", "Parsed financial total"),
            ("key_points", "TEXT", "Extracted bullets / line items"),
            ("summary", "TEXT", "Synthesized executive summary paragraph"),
            ("extracted_text", "LONGTEXT", "Full raw OCR text transcript")
        ]),
        ("Table 4 & 5: search_history & document_history", [
            ("search_history", "id, user_id, search_query, filters, result_count, searched_at", "Tracks query queries and result counts"),
            ("document_history", "id, user_id, document_id, action, details, created_at", "Audit ledger: VIEW, UPLOAD, SEARCH, EDIT_META, DELETE")
        ])
    ]

    for title, rows in schema_tables:
        story.append(Paragraph(title, style_h3))
        table_rows = [[Paragraph("<b>Field Name</b>", style_table_header), Paragraph("<b>Type & Attributes</b>", style_table_header), Paragraph("<b>Description</b>", style_table_header)]]
        for f, t, d in rows:
            table_rows.append([Paragraph(f, style_table_cell), Paragraph(f"<code>{t}</code>", style_table_cell), Paragraph(d, style_table_cell)])
        t_obj = Table(table_rows, colWidths=[130, 170, 200])
        t_obj.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), CARD_BG),
            ('BOX', (0,0), (-1,-1), 0.5, BORDER_COL),
            ('GRID', (0,0), (-1,-1), 0.5, BORDER_COL),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(t_obj)
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 4: PYTHON OCR & AI SERVICE
    # =========================================================================
    story.append(Paragraph("4. Python OCR & AI Intelligence Engine (python-service/)", style_h1))
    story.append(Paragraph(
        "The Python service is an asynchronous microservice written in FastAPI. It handles heavy computer vision "
        "and natural language processing workloads, isolating them from the Node.js API Gateway.",
        style_body
    ))

    py_files = [
        ("app.py", "FastAPI Service Entrypoint",
         "Configures CORS middleware to allow requests from the Node.js backend. Defines the health check endpoint "
         "<code>GET /health</code> and the primary ingestion endpoint <code>POST /process</code>. Receives the file path, "
         "calls the processing pipeline, handles processing timeouts and exceptions, and returns standard JSON payloads."),
        
        ("processing/ocr_processor.py", "Pipeline Conductor & Orchestrator",
         "The master controller for document processing. Coordinates the workflow: (1) invokes text extraction, "
         "(2) passes raw text to the classifier to determine document type, (3) executes entity extraction for structured "
         "key-values, and (4) bundles the response with processing confidence scores and timestamps."),
        
        ("processing/text_extractor.py", "Multi-Format Ingestion & Computer Vision",
         "Ingests PDFs and image files (PNG, JPG, TIFF). For digital PDFs, it leverages <code>pdfplumber</code> and <code>PyPDF2</code> "
         "for rapid extraction. If character density is low (< 50 chars), it falls back to page rendering and OCR. "
         "For images, it utilizes OpenCV (<code>cv2</code>) for image optimization: converting to grayscale, applying Gaussian "
         "bilateral filtering to reduce noise while preserving edges, and applying adaptive Otsu thresholding before passing "
         "to <code>pytesseract.image_to_string()</code>. Includes automated binary path detection for Windows."),

        ("processing/classifier.py", "Rule-Based Document Classification",
         "Uses weighted keyword dictionaries and regular expression pattern density to classify documents into standard "
         "business types (Invoice, Quotation, Tender, Purchase Document, Agreement, Other). Computes score differentials "
         "to ensure high-precision classification."),

        ("processing/information_extractor.py", "Entity & Key-Value Extraction Engine",
         "Applies regular expressions and structural heuristics to extract critical business entities:<br/>"
         "• <b>GST Number</b>: <code>\\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\\b</code><br/>"
         "• <b>PAN Number</b>: <code>\\b[A-Z]{5}[0-9]{4}[A-Z]{1}\\b</code><br/>"
         "• <b>Company Name</b>: Contextual header extraction preceding addresses, GSTINs, or lines following 'M/s'.<br/>"
         "• <b>Dates & Deadlines</b>: Multi-pattern date parsing (DD/MM/YYYY, YYYY-MM-DD, DD-Mon-YYYY) distinguishing document date from due date.<br/>"
         "• <b>Financial Amounts</b>: Currency-aware numeric parsing supporting commas, decimals, INR, USD, and EUR.<br/>"
         "• <b>Summary Generator</b>: Synthesizes a structured 3-sentence executive summary.")
    ]

    for fname, role, desc in py_files:
        story.append(Paragraph(f"<b>{fname}</b> &mdash; <i>{role}</i>", style_h2))
        story.append(Paragraph(desc, style_body))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 5: NODE.JS BACKEND
    # =========================================================================
    story.append(Paragraph("5. Node.js Express API & Business Layer (backend/)", style_h1))
    story.append(Paragraph(
        "The Node.js backend operates as the central API Gateway. It enforces security, orchestrates "
        "business services, handles file uploads, communicates with MySQL, and coordinates with the Python AI service.",
        style_body
    ))

    node_components = [
        ("src/server.js", "Server Entrypoint & Middleware Assembly",
         "Initializes Express, enables CORS for the React frontend, configures body-parsers, mounts static file serving "
         "for uploads, binds modular routers under <code>/api</code>, and attaches global error handling middleware on port 5000."),

        ("src/config/db.js", "MySQL Connection Pool",
         "Configures an asynchronous connection pool using <code>mysql2/promise</code> with a connection limit of 10. "
         "Exports the pool for parameterized queries, preventing SQL injection."),

        ("src/middleware/authMiddleware.js & roleMiddleware.js", "Security & RBAC Guards",
         "<code>authMiddleware</code> inspects the <code>Authorization: Bearer &lt;token&gt;</code> header, verifies "
         "the JWT signature with <code>JWT_SECRET</code>, and attaches <code>{ userId, email, role }</code> to <code>req.user</code>. "
         "<code>roleMiddleware</code> verifies whether <code>req.user.role === 'ADMIN'</code>, returning 403 Forbidden for unauthorized access."),

        ("src/middleware/uploadMiddleware.js", "Multer Multipart Ingestion",
         "Configures disk storage destination and generates unique UUID filenames. Enforces a 25MB file size limit "
         "and validates MIME types (PDF, PNG, JPEG)."),

        ("src/services/documentService.js", "Core Business Queries & Statistics Engine",
         "Implements comprehensive document lifecycle operations:<br/>"
         "• <b>getStats()</b>: Calculates synchronized repository metrics across tables: Total Volume, Action Queue (Pending), "
         "Upcoming Pipeline (due within 14 days), Overdue Documents (past due date and not DONE), and Purge Queue.<br/>"
         "• <b>getDocuments()</b>: Dynamic SQL query builder supporting pagination, search strings, status filters, and sorting.<br/>"
         "• <b>updateDocument()</b>: In-line metadata updates committing changes to both documents and document_information.<br/>"
         "• <b>deleteDocument()</b>: Performs safe soft-deletions (is_deleted=1) with audit logging."),

        ("src/services/pythonProcessingService.js", "Node-to-Python Microservice Bridge",
         "Asynchronously dispatches document file paths to Python <code>POST http://localhost:8000/process</code>. "
         "On response, updates <code>document_information</code> via SQL UPSERT and marks the document as <code>PROCESSED</code>."),

        ("src/controllers/historyController.js", "Audit & Search Tracking Controller",
         "• <b>getSearchHistory</b>: Returns user query history with automatic seeding fallback.<br/>"
         "• <b>addSearchHistory</b>: Deduplicates repeated searches by updating timestamps, avoiding database clutter.<br/>"
         "• <b>getActivityHistory</b>: Queries <code>document_history</code> enriched with company names and user roles.")
    ]

    for fname, role, desc in node_components:
        story.append(Paragraph(f"<b>{fname}</b> &mdash; <i>{role}</i>", style_h2))
        story.append(Paragraph(desc, style_body))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 6: FRONTEND ARCHITECTURE
    # =========================================================================
    story.append(Paragraph("6. Frontend Single-Page Application (frontend/)", style_h1))
    story.append(Paragraph(
        "Built with React 18, Vite, and custom CSS variables, the frontend provides a dark-navy corporate design "
        "optimized for high-density document intelligence and responsive user feedback.",
        style_body
    ))

    fe_screens = [
        ("Dashboard.jsx", "Executive Operational Overview",
         "Displays 4 core stat cards (TOTAL VOLUME, ACTION QUEUE, UPCOMING PIPELINE, URGENT ATTENTION). "
         "Renders the recent documents table with live tab filters (All, Pending, Upcoming, Done). Directly connects "
         "to document upload and detail inspection views."),

        ("DocumentDates.jsx", "Chronological Milestone & Compliance Ledger",
         "Features 3 top stat cards (UPCOMING DEADLINES, PENDING & SCHEDULED, OVERDUE DOCUMENTS). "
         "Presents a 3-column chronological Kanban board:<br/>"
         "• <b>Column 1</b>: Upcoming Deadlines (Deadlines in 1 to 2 weeks).<br/>"
         "• <b>Column 2</b>: Pending & Scheduled (Documents pending review or future milestones).<br/>"
         "• <b>Column 3</b>: Recently Due / Overdue (Past cutoff dates requiring immediate resolution)."),

        ("DocumentDetails.jsx", "Split-Screen Inspection & In-Line Metadata Editor",
         "Displays an embedded document viewer (PDF/Image) side-by-side with AI-extracted attributes. "
         "Features editable fields (Company, GSTIN, Due Date, Amount, Status Toggle) and a <b>Save to Database</b> "
         "button that persists modifications directly to MySQL via <code>PUT /api/documents/:id</code>."),

        ("History.jsx", "1-Screen Executive Console & Audit Explorer",
         "Contained in a single screen viewport:<br/>"
         "• <b>Left Column</b>: Recent searches with quick-search bar and 1-click execution chips.<br/>"
         "• <b>Right Column</b>: Recent activity showing distinct, condensed business events (view counts grouped).<br/>"
         "• <b>Audit Trail Modal</b>: Full searchable audit log modal with category filters (All, Edits, Views, Uploads, Searches)."),

        ("AdminManagement.jsx", "Administrator Control Console",
         "Protected administrative interface with 4 synchronized stat cards (INDEXED FILES, PENDING AUDIT, "
         "OVERDUE ESCALATIONS, VERIFIED / DONE). Includes document management table, metadata drawer, soft delete, and CSV export."),

        ("Navbar.jsx", "Global Header & SLA Notification Dropdown",
         "Features real-time engine status indicators and an active notification bell. Displays red badge counts for "
         "overdue documents and provides a slide-down notification menu with direct links to affected records."),

        ("AuthContext.jsx & api.js", "Authentication State & Axios Client",
         "Persists JWT tokens and user profiles in <code>localStorage</code>. Centralized Axios client automatically "
         "injects <code>Authorization: Bearer &lt;token&gt;</code> headers on all outgoing API requests.")
    ]

    for fname, role, desc in fe_screens:
        story.append(Paragraph(f"<b>{fname}</b> &mdash; <i>{role}</i>", style_h2))
        story.append(Paragraph(desc, style_body))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 7: API ENDPOINTS TABLE
    # =========================================================================
    story.append(Paragraph("7. Complete REST API Endpoints Specification", style_h1))
    story.append(Paragraph(
        "All API endpoints follow standard REST conventions and return structured JSON responses: "
        "<code>{ success: boolean, message: string, data: object }</code>.",
        style_body
    ))

    api_data = [
        [
            Paragraph("<b>METHOD</b>", style_table_header),
            Paragraph("<b>ENDPOINT</b>", style_table_header),
            Paragraph("<b>AUTH</b>", style_table_header),
            Paragraph("<b>DESCRIPTION</b>", style_table_header)
        ],
        [Paragraph("POST", style_table_cell), Paragraph("<code>/api/auth/register</code>", style_table_cell), Paragraph("Public", style_table_cell), Paragraph("Register new account with name, email, password, role", style_table_cell)],
        [Paragraph("POST", style_table_cell), Paragraph("<code>/api/auth/login</code>", style_table_cell), Paragraph("Public", style_table_cell), Paragraph("Verify credentials and issue signed 7-day JWT token", style_table_cell)],
        [Paragraph("GET", style_table_cell), Paragraph("<code>/api/auth/me</code>", style_table_cell), Paragraph("Bearer JWT", style_table_cell), Paragraph("Fetch authenticated user profile and permissions", style_table_cell)],
        [Paragraph("GET", style_table_cell), Paragraph("<code>/api/documents</code>", style_table_cell), Paragraph("Bearer JWT", style_table_cell), Paragraph("Retrieve paginated documents with search and filters", style_table_cell)],
        [Paragraph("POST", style_table_cell), Paragraph("<code>/api/documents/upload</code>", style_table_cell), Paragraph("Bearer JWT", style_table_cell), Paragraph("Upload file (PDF/Image) and trigger Python AI pipeline", style_table_cell)],
        [Paragraph("GET", style_table_cell), Paragraph("<code>/api/documents/stats</code>", style_table_cell), Paragraph("Bearer JWT", style_table_cell), Paragraph("Fetch unified repository statistics (total, pending, overdue)", style_table_cell)],
        [Paragraph("GET", style_table_cell), Paragraph("<code>/api/documents/:id</code>", style_table_cell), Paragraph("Bearer JWT", style_table_cell), Paragraph("Fetch complete document record and extracted AI attributes", style_table_cell)],
        [Paragraph("PUT", style_table_cell), Paragraph("<code>/api/documents/:id</code>", style_table_cell), Paragraph("Bearer JWT", style_table_cell), Paragraph("Update metadata in database and record EDIT_META audit", style_table_cell)],
        [Paragraph("DELETE", style_table_cell), Paragraph("<code>/api/documents/:id</code>", style_table_cell), Paragraph("Admin JWT", style_table_cell), Paragraph("Soft-delete document (is_deleted=1) with audit logging", style_table_cell)],
        [Paragraph("GET", style_table_cell), Paragraph("<code>/api/history/search</code>", style_table_cell), Paragraph("Bearer JWT", style_table_cell), Paragraph("Retrieve recent search queries for current user", style_table_cell)],
        [Paragraph("POST", style_table_cell), Paragraph("<code>/api/history/search</code>", style_table_cell), Paragraph("Bearer JWT", style_table_cell), Paragraph("Log search query and result count with deduplication", style_table_cell)],
        [Paragraph("GET", style_table_cell), Paragraph("<code>/api/history/activity</code>", style_table_cell), Paragraph("Bearer JWT", style_table_cell), Paragraph("Fetch repository activity history and audit ledger", style_table_cell)],
        [Paragraph("GET", style_table_cell), Paragraph("<code>/api/users</code>", style_table_cell), Paragraph("Admin JWT", style_table_cell), Paragraph("List all registered users in the organization", style_table_cell)],
        [Paragraph("POST", style_table_cell), Paragraph("<code>/process</code> (Python :8000)", style_table_cell), Paragraph("Internal", style_table_cell), Paragraph("Process file via Tesseract OCR and extract structured keys", style_table_cell)]
    ]

    api_table = Table(api_data, colWidths=[55, 155, 75, 215])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COL),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(api_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 8 & 9: DATA FLOW & PROBLEM-SOLVING
    # =========================================================================
    story.append(Paragraph("8. End-to-End Data Flow & Ingestion Lifecycle", style_h1))
    flow_steps = [
        "<b>Step 1: Intake & Upload</b> &mdash; User uploads a document (e.g., Invoice PDF or PO scan). The React frontend dispatches a multipart request to Express.",
        "<b>Step 2: File Persistence</b> &mdash; Multer writes the file to <code>backend/uploads/</code>, generating a secure UUID filename. A record is inserted into <code>documents</code> with status='PENDING' and processing_status='UPLOADED'.",
        "<b>Step 3: Asynchronous AI Trigger</b> &mdash; Node.js dispatches an HTTP request to the Python microservice (<code>POST http://localhost:8000/process</code>) passing the file path.",
        "<b>Step 4: Computer Vision & OCR</b> &mdash; Python applies OpenCV preprocessing (grayscale, bilateral filtering, adaptive thresholding) and executes Tesseract OCR / pdfplumber extraction.",
        "<b>Step 5: Classification & Extraction</b> &mdash; The classifier determines document type. Heuristics extract GSTIN, dates, due date, amounts, and summary.",
        "<b>Step 6: Database Persistence</b> &mdash; Python returns JSON to Node.js. Node executes an UPSERT into <code>document_information</code> and marks processing_status='PROCESSED'.",
        "<b>Step 7: User Review & Persistence</b> &mdash; User inspects the extracted data in DocumentDetails, edits any fields, and clicks 'Save to Database', updating MySQL and setting status='DONE'."
    ]
    for s in flow_steps:
        story.append(Paragraph(s, style_bullet))

    story.append(Spacer(1, 10))
    story.append(Paragraph("9. Key Algorithms, Synchronized Metrics & Problem-Solving Ledger", style_h1))
    
    solutions = [
        ("Unified Overdue Metric Calculation",
         "<b>Problem</b>: Dashboard showed 0 overdue documents while the top notification banner showed 2 overdue documents and Document Dates showed 2.<br/>"
         "<b>Solution</b>: Unified calculation in backend <code>documentService.js</code>:<br/>"
         "<code>WHERE d.is_deleted = 0 AND ((COALESCE(d.due_date, di.due_date) &lt; CURDATE() AND d.status != 'DONE') OR d.status = 'FAILED')</code>.<br/>"
         "Ensures completed documents (status='DONE') are never counted as overdue blockers."),

        ("Upcoming Deadlines Window (1–2 Weeks)",
         "<b>Problem</b>: Conflicting ranges across pages (Due Next 7 Days vs 1-2 Weeks).<br/>"
         "<b>Solution</b>: Standardized on a 14-day window: active documents where due date falls between <code>CURDATE()</code> and <code>CURDATE() + 14 DAYS</code>."),

        ("Search Logging & Throttled Activity Deduplication",
         "<b>Problem</b>: Repeated search queries and rapid page reloads created spam in the activity feed.<br/>"
         "<b>Solution</b>: Implemented deduplication in <code>historyController.js</code> that updates existing timestamps on repeated queries, and throttled view tracking within 5-minute windows."),

        ("Case-Sensitivity Fix on Admin Console",
         "<b>Problem</b>: Pending Audit showed 0 because of case-sensitive comparison (<code>d.status === 'pending'</code> vs <code>'PENDING'</code> in MySQL).<br/>"
         "<b>Solution</b>: Updated to case-insensitive comparison (<code>d.status?.toLowerCase() === 'pending'</code>), correctly displaying 2.")
    ]

    for title, desc in solutions:
        story.append(Paragraph(f"<b>{title}</b>", style_h2))
        story.append(Paragraph(desc, style_body))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"SUCCESS: PDF generated successfully at {filename}")

if __name__ == '__main__':
    out_file = os.path.join(os.path.dirname(__file__), "DocIntel_Complete_Architecture_Guide.pdf")
    build_pdf(out_file)
