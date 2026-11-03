# DocIntel — AI Document Intelligence Platform
## Comprehensive Master Architecture, Codebase & Systems Documentation

---

### Table of Contents
1. **Executive Architecture Overview**
2. **Server Orchestration & Startup Runbook**
3. **Database Architecture (`database/`)**
4. **Python OCR & AI Intelligence Engine (`python-service/`)**
5. **Node.js Express API & Business Layer (`backend/`)**
6. **Frontend UI/UX Architecture (`frontend/`)**
7. **Complete REST API Endpoints Specification**
8. **End-to-End Data Flow & Document Lifecycle**
9. **Critical Algorithms, Calculations & Problem-Solving Ledger**

---

## 1. Executive Architecture Overview

DocIntel is an end-to-end multi-tier document intelligence and enterprise management application. It bridges low-latency asynchronous optical character recognition (OCR) and structured entity extraction with a resilient relational database and a responsive single-page application.

### Multi-Tier Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                           FRONTEND: REACT 18 + VITE                               |
|                  Port 5173 | Single-Page Application (SPA)                        |
|                                                                                   |
|  [Dashboard]  [Documents]  [DocumentDetails]  [Upload]  [Search]  [Dates] [Admin]  |
|         |                                                             |           |
|         +----------------------- Axios Interceptor -------------------+           |
|                               (Bearer JWT Token)                                  |
+-----------------------------------------------------------------------------------+
                                        |  REST API Requests (JSON / Multipart)
                                        v
+-----------------------------------------------------------------------------------+
|                        BACKEND: NODE.JS (EXPRESS 4)                               |
|                            Port 5000 | Core API Gateway                           |
|                                                                                   |
|  [Auth Middleware] -> [Controllers] -> [Services] -> [MySQL Pool (mysql2/promise)]|
|                                  |                                                |
|                                  | Multi-part form upload -> Local Disk Storage   |
|                                  | Axios Proxy / Forwarding                       |
+-----------------------------------------------------------------------------------+
                                        | HTTP POST /process (File Path & Doc ID)
                                        v
+-----------------------------------------------------------------------------------+
|                   AI ENGINE: PYTHON 3.12 (FASTAPI + UVICORN)                     |
|                             Port 8000 | Microservice                              |
|                                                                                   |
|   [Tesseract OCR] -> [Text Extractor] -> [Classifier] -> [Information Extractor]  |
|   (CV2 Preprocess)    (PDF / PNG / JPG)   (Keyword Scoring) (Regex GST/Dates/KV)  |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                             DATABASE: MYSQL 8.0+                                  |
|                             Port 3306 | Schema: docintel                          |
|                                                                                   |
|   [users] <--- [documents] <=== (1:1) ===> [document_information]                 |
|                   |                                                               |
|                   +---> [document_history]                                        |
|   [users] ------------> [search_history]                                          |
+-----------------------------------------------------------------------------------+
```

---

## 2. Server Orchestration & Startup Runbook

To run the entire DocIntel platform, four distinct systems must be operational.

### 2.1 Prerequisite Requirements
* **Operating System**: Windows 10/11, Linux, or macOS.
* **Node.js**: v18.x, v20.x, or v22.x+
* **Python**: v3.10, v3.11, or v3.12+
* **Tesseract OCR Engine**: Installed at `C:\Program Files\Tesseract-OCR\tesseract.exe` (or in system PATH).
* **MySQL Server**: Running on localhost port 3306.

---

### 2.2 Server 1: MySQL Database Server
* **Default Port**: `3306`
* **Database Name**: `docintel`
* **Initialization Commands**:
```powershell
# Open MySQL CLI:
mysql -u root -p

# Execute initialization script:
source c:/Users/HP/Desktop/DOC AI/database/schema.sql;
source c:/Users/HP/Desktop/DOC AI/database/seed.sql;
```

---

### 2.3 Server 2: Python OCR / AI Microservice
* **Directory**: `c:\Users\HP\Desktop\DOC AI\python-service`
* **Default Port**: `8000`
* **Entry Script**: `app.py`
* **Startup Command**:
```powershell
cd "c:\Users\HP\Desktop\DOC AI\python-service"
.\venv\Scripts\Activate.ps1
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
* **Health Check**: `http://localhost:8000/health` $\rightarrow$ `{"status": "ok", "service": "DocIntel Python AI Service", "version": "1.0.0"}`

---

### 2.4 Server 3: Node.js Express Backend API Gateway
* **Directory**: `c:\Users\HP\Desktop\DOC AI\backend`
* **Default Port**: `5000`
* **Entry Script**: `src/server.js`
* **Environment File (`.env`)**:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=docintel
JWT_SECRET=docintel_dev_jwt_secret_key_2026
FRONTEND_URL=http://localhost:5173
PYTHON_SERVICE_URL=http://localhost:8000
UPLOAD_DIR=uploads
MAX_FILE_SIZE=25000000
```
* **Startup Command**:
```powershell
cd "c:\Users\HP\Desktop\DOC AI\backend"
npm run dev
# Or production mode: node src/server.js
```
* **Health Check**: `http://localhost:5000/api/health` $\rightarrow$ `{"success": true, "message": "DocIntel API is running"}`

---

### 2.5 Server 4: React + Vite Frontend Client
* **Directory**: `c:\Users\HP\Desktop\DOC AI\frontend`
* **Default Port**: `5173`
* **Startup Command**:
```powershell
cd "c:\Users\HP\Desktop\DOC AI\frontend"
npm run dev
```
* **Application Access**: Open your browser at `http://localhost:5173`

---

## 3. Database Architecture (`database/`)

The database is built on MySQL using foreign keys, cascading deletions, and indexed query patterns.

### 3.1 File Index & Purpose
1. **`schema.sql`**: Master DDL script defining the core tables (`users`, `documents`, `document_information`, `search_history`, `document_history`).
2. **`seed.sql`**: Initial realistic corporate records, default admin and standard user accounts with bcrypt-hashed passwords.
3. **`user_migration.sql`**: Adds security, departments, and designations to user profiles.
4. **`migrate_add_dept.sql`**: Alters tables to support soft-deletion fields (`is_deleted`, `deleted_at`, `deleted_by`, `deletion_reason`).
5. **`run_migration.js`**: Node.js automated migration runner script.

---

### 3.2 Relational Entity Relationship & Schema Breakdown

#### Table 1: `users`
Stores user identities, hashed credentials, and role authorizations.
* `id` (`INT PRIMARY KEY AUTO_INCREMENT`): Unique user identifier.
* `name` (`VARCHAR(100) NOT NULL`): Full name.
* `email` (`VARCHAR(255) NOT NULL UNIQUE`): Unique login email (Indexed).
* `password_hash` (`VARCHAR(255) NOT NULL`): Salted bcrypt password hash.
* `role` (`ENUM('USER', 'ADMIN') DEFAULT 'USER'`): RBAC permission level.
* `department` (`VARCHAR(100)`): Corporate division (e.g., Procurement, Finance, Legal).
* `designation` (`VARCHAR(100)`): Corporate job title (e.g., Senior Auditor, Director).
* `created_at` / `updated_at` (`DATETIME`): Automatic audit timestamps.

#### Table 2: `documents`
Stores core physical and logical file metadata.
* `id` (`INT PRIMARY KEY AUTO_INCREMENT`): Document ID (`DOC-0001`, `DOC-0002`...).
* `uploaded_by` (`INT NOT NULL`): Foreign key referencing `users(id)`.
* `original_filename` (`VARCHAR(255) NOT NULL`): Uploaded file name.
* `stored_filename` (`VARCHAR(255) NOT NULL`): UUID/timestamped physical filename.
* `file_path` (`VARCHAR(500) NOT NULL`): Relative path on server disk (`uploads/...`).
* `file_type` (`VARCHAR(50)`): MIME type (`application/pdf`, `image/png`, `image/jpeg`).
* `file_size` (`INT`): Physical file weight in bytes.
* `document_type` (`ENUM('Invoice', 'Quotation', 'Tender', 'Purchase Document', 'Agreement', 'Other')`): Class label.
* `status` (`ENUM('PENDING', 'DONE') DEFAULT 'PENDING'`): Human workflow approval state.
* `processing_status` (`ENUM('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED')`): AI pipeline execution state.
* `document_date` (`DATE`): Issue/issuance date.
* `due_date` (`DATE`): Critical deadline / submission / expiration date.
* `is_deleted` (`TINYINT(1) DEFAULT 0`): Soft-delete flag (0 = Active, 1 = Recycled).
* `deleted_at`, `deleted_by`, `deletion_reason`: Deletion audit metadata.

#### Table 3: `document_information`
Stores the deep AI-extracted intelligence and structured attributes.
* `id` (`INT PRIMARY KEY AUTO_INCREMENT`): Information entry ID.
* `document_id` (`INT NOT NULL UNIQUE`): 1-to-1 Foreign key referencing `documents(id)` with `ON DELETE CASCADE`.
* `company_name` (`VARCHAR(255)`): Extracted vendor, partner, or issuer name.
* `gst_number` (`VARCHAR(50)`): 15-character statutory GST identification number.
* `document_number` (`VARCHAR(100)`): Extracted Invoice/PO/Tender reference code.
* `document_date` (`DATE`): OCR extracted issuance date.
* `due_date` (`DATE`): OCR extracted cutoff/deadline date.
* `amount` (`DECIMAL(15,2)`): Monetary total parsed from document.
* `key_points` (`TEXT`): JSON or bullet array of key terms, line items, and deliverables.
* `summary` (`TEXT`): Executive synthesized summary paragraph.
* `extracted_text` (`LONGTEXT`): Full raw OCR/text transcript.

#### Table 4: `search_history`
Tracks user search behavior for analytics, caching, and quick recall.
* `id` (`INT PRIMARY KEY AUTO_INCREMENT`): Query log ID.
* `user_id` (`INT NOT NULL`): User who performed the search (`FOREIGN KEY users(id)`).
* `search_query` (`VARCHAR(500) NOT NULL`): Search query string.
* `filters` (`JSON`): Active facets applied during search (type, date range, status).
* `result_count` (`INT DEFAULT 0`): Number of matched documents returned.
* `searched_at` (`DATETIME DEFAULT CURRENT_TIMESTAMP`): Query timestamp.

#### Table 5: `document_history`
Complete, immutable audit trail of enterprise repository actions.
* `id` (`INT PRIMARY KEY AUTO_INCREMENT`): Audit sequence ID.
* `user_id` (`INT NOT NULL`): Actor executing action (`FOREIGN KEY users(id)`).
* `document_id` (`INT NULL`): Affected document (`FOREIGN KEY documents(id) ON DELETE CASCADE`).
* `action` (`ENUM('VIEW', 'UPLOAD', 'SEARCH', 'OPEN', 'UPDATE_STATUS', 'EDIT_META', 'DELETE')`): Audited event type.
* `details` (`TEXT`): Change payloads, old/new diffs, query strings.
* `created_at` (`DATETIME`): Audit timestamp.

---

## 4. Python OCR & AI Intelligence Engine (`python-service/`)

The Python service is an asynchronous microservice powered by FastAPI, OpenCV, PyPDF2, pdfplumber, and Tesseract OCR.

### 4.1 File-by-File Breakdown

#### 1. `app.py` — *FastAPI Microservice Entrypoint*
* **Role**: Configures CORS middleware, route handlers, error wrappers, and background execution.
* **Key Endpoints**:
  * `GET /health`: Microservice readiness probe.
  * `POST /process`: Main entrypoint for document processing. Accepts JSON body `{ "document_id": int, "file_path": str }`.
* **Execution Flow**:
  1. Resolves absolute system file path.
  2. Calls `process_document_pipeline()` from `processing/ocr_processor.py`.
  3. Returns standard JSON envelope containing structured metadata, detected category, extracted text, and confidence scores.

#### 2. `processing/ocr_processor.py` — *Pipeline Orchestrator*
* **Role**: Pipeline conductor coordinating extraction, classification, structured entity parsing, and summary generation.
* **Key Functions**:
  * `process_document_pipeline(file_path)`: High-level controller function:
    1. Calls `extract_text_from_file(file_path)`.
    2. Calls `classify_document(text, filename)`.
    3. Calls `extract_structured_information(text, doc_type)`.
    4. Bundles output with confidence scores and timestamp.

#### 3. `processing/text_extractor.py` — *Multi-Format Document Ingestion Engine*
* **Role**: Extracts clean text from native digital PDFs, scanned PDFs, PNG, JPG, and TIFF images.
* **Key Functions**:
  * `extract_text_from_file(file_path)`: Dispatches file by extension (`.pdf` vs `.png`, `.jpg`, `.jpeg`).
  * `extract_from_pdf(file_path)`: Uses `pdfplumber` to extract digital text and tables. If text yield is below 50 characters, automatically converts PDF pages to images and passes them to Tesseract OCR.
  * `extract_from_image(file_path)`: Loads image via OpenCV (`cv2`), converts to grayscale, applies Gaussian bilateral filtering, performs adaptive thresholding, and invokes `pytesseract.image_to_string(preprocessed_img)`.
  * `detect_tesseract_path()`: Automatically probes standard Windows locations (`C:\Program Files\Tesseract-OCR\tesseract.exe`) and sets `pytesseract.tesseract_cmd`.

#### 4. `processing/classifier.py` — *Document Classification Engine*
* **Role**: Categorizes arbitrary corporate documents into standard types (`Invoice`, `Quotation`, `Tender`, `Purchase Document`, `Agreement`, `Other`).
* **Methodology**:
  * Utilizes weighted keyword scoring and regex pattern density matching.
  * *Invoice weights*: "Tax Invoice", "GSTIN", "Billed To", "Invoice Number", "Due Date", "Total Payable".
  * *Tender weights*: "Notice Inviting Tender", "NIT", "Bid Submission", "Earnest Money Deposit (EMD)", "Tender Fee".
  * *Purchase Document weights*: "Purchase Order", "PO Number", "Vendor", "Shipping Address", "Delivery Date".
  * *Quotation weights*: "Quotation", "Estimate", "Valid Until", "Quote Ref".
  * *Agreement weights*: "Memorandum of Understanding", "Agreement", "Terms & Conditions", "Party of the First Part".

#### 5. `processing/information_extractor.py` — *Entity & Key-Value Extraction Engine*
* **Role**: Extracts high-value business metadata using regex and natural language heuristics:
  * **GST Number**: `\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b`
  * **PAN Number**: `\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b`
  * **Company Name**: Identifies header entities before addresses, vendor keywords, or lines following "M/s", "Messrs", or "To:".
  * **Dates**: Multi-format regex parsers supporting `DD/MM/YYYY`, `YYYY-MM-DD`, `DD-Mon-YYYY`, and relative date formats.
  * **Due / Cutoff Dates**: Scans context windows surrounding terms like "Due Date", "Valid Till", "Submission Date", "Cutoff".
  * **Amounts & Currency**: Extracts total monetary values with commas and decimal numbers (supports INR `₹`, USD `$`, EUR `€`).
  * **Summary Synthesis**: Synthesizes a structured 3–4 sentence executive summary detailing the issuer, purpose, amount, and deadline.

---

## 5. Node.js Express API & Business Layer (`backend/`)

The backend is built with clean separation between Routing, Controllers, Services, Configuration, and Middleware.

### 5.1 Configuration & Infrastructure (`src/config/`)
* **`db.js`**:
  * Initializes a resilient MySQL connection pool using `mysql2/promise`.
  * Configured with `waitForConnections: true`, `connectionLimit: 10`, `queueLimit: 0`.
  * Exports `pool` for parameterized async SQL queries and `testConnection()`.

### 5.2 Middleware Layer (`src/middleware/`)
1. **`authMiddleware.js`**:
   * Inspects `Authorization: Bearer <token>` header.
   * Verifies signature using `jsonwebtoken` and `process.env.JWT_SECRET`.
   * Attaches decoded payload `{ userId, email, role }` directly to `req.user`.
   * Rejects missing or expired tokens with `401 Unauthorized`.
2. **`roleMiddleware.js`**:
   * Enforces Role-Based Access Control (RBAC).
   * Verifies if `req.user.role === 'ADMIN'`. Rejects unauthorized attempts with `403 Forbidden`.
3. **`uploadMiddleware.js`**:
   * Configures `multer` disk storage.
   * Validates MIME types (`application/pdf`, `image/png`, `image/jpeg`).
   * Sanitizes filenames and enforces a 25MB maximum upload limit.
4. **`errorMiddleware.js`**:
   * Global catch-all Express error handler. Ensures no unhandled rejections crash the server.

### 5.3 Services Layer (`src/services/`)
1. **`authService.js`**:
   * `registerUser({ name, email, password, role, department, designation })`: Hashes password with `bcryptjs` (salt 10) and inserts user record.
   * `loginUser(email, password)`: Queries user by email, compares bcrypt hash, and issues a 7-day JWT.
2. **`documentService.js`**:
   * `createDocument()`: Inserts initial row in `documents` with status `'UPLOADED'`.
   * `getDocuments(filters)`: Dynamic query builder supporting pagination, search queries, document type, status, and date sorting.
   * `getDocumentById(id)`: Joins `documents` and `document_information` on `d.id = di.document_id`.
   * `updateDocument(id, data, userId)`: Allows editing document metadata (company name, dates, amount, status) and records an `EDIT_META` audit event.
   * `deleteDocument(id, userId, reason)`: Performs safe soft-delete (`is_deleted = 1`, `deleted_at = NOW()`).
   * `getStats()`: Unified dashboard analytics calculation engine returning `total`, `pending`, `done`, `upcoming`, and `overdue` counts.
3. **`pythonProcessingService.js`**:
   * Node-to-Python HTTP bridge.
   * Sends asynchronous `POST http://localhost:8000/process` request with `file_path`.
   * On response, executes `UPSERT` into `document_information` and updates `documents.processing_status = 'PROCESSED'`.
4. **`storageService.js`**:
   * Abstracted file storage utility for managing disk files, calculating hashes, and cleaning up storage.

### 5.4 Controllers Layer (`src/controllers/`)
* **`authController.js`**: Handles user login, registration, and profile fetching.
* **`documentController.js`**: Handles file uploads, document filtering, document viewing, metadata editing, soft-deletion, and statistics retrieval.
* **`historyController.js`**:
  * `getSearchHistory`: Fetches user search history, with automated seeding fallback.
  * `addSearchHistory`: Records searches, touches timestamps for deduplication, and writes to `document_history`.
  * `getActivityHistory`: Returns activity events enriched with document and user attributes.
* **`userController.js`**: Administrative management of user accounts.

### 5.5 Routes Layer (`src/routes/`)
* **`authRoutes.js`**: Mapped to `/api/auth`.
* **`documentRoutes.js`**: Mapped to `/api/documents`.
* **`historyRoutes.js`**: Mapped to `/api/history`.
* **`userRoutes.js`**: Mapped to `/api/users`.

---

## 6. Frontend UI/UX Architecture (`frontend/`)

Built with React 18 and Vite, the frontend features a dark-navy design system, token-based authentication, and responsive state synchronization.

### 6.1 State & Client Architecture
* **`src/context/AuthContext.jsx`**: Global authentication state provider. Persists user profile and JWT token in `localStorage`. Automatically configures Axios Authorization headers.
* **`src/services/api.js`**: Centralized HTTP client configured with Axios interceptors. Automatically attaches Bearer tokens and handles `401` redirect logic.

---

### 6.2 Key Screen Pages Breakdown (`src/pages/`)

1. **`Dashboard.jsx`**:
   * **Purpose**: Primary control plane displaying overall repository health and recent uploads.
   * **Key Components**:
     * 4 Stat Cards: `TOTAL VOLUME`, `ACTION QUEUE`, `UPCOMING PIPELINE`, `URGENT ATTENTION`.
     * `Recent Documents` table with live status filter tabs (`All`, `Pending`, `Upcoming`, `Done`).
     * Direct link to Upload modal and detail views.

2. **`Documents.jsx`**:
   * **Purpose**: Main repository catalog and document browser.
   * **Features**: Live text search, document type filter dropdown, status filter, and pagination.

3. **`DocumentDates.jsx`**:
   * **Purpose**: Chronological milestone and compliance ledger.
   * **3 Stat Cards**: `UPCOMING DEADLINES`, `PENDING & SCHEDULED`, `OVERDUE DOCUMENTS`.
   * **3-Column Board**:
     * Column 1: *Upcoming Deadlines* (Deadlines in 1–2 weeks).
     * Column 2: *Pending & Scheduled* (Awaiting signoff or future milestones).
     * Column 3: *Recently Due / Overdue* (Cutoff dates in the past).

4. **`DocumentDetails.jsx`**:
   * **Purpose**: Split-screen document inspection and intelligence editing console.
   * **Features**:
     * Embedded document preview (PDF / Image viewer).
     * AI Extraction Panel: Extracted company name, GST, document number, dates, amounts.
     * In-line Editing & **Save to Database** button: Commits changes directly to MySQL via `PUT /api/documents/:id`.
     * Status Toggle (`PENDING` $\leftrightarrow$ `DONE`).

5. **`UploadDocument.jsx`**:
   * **Purpose**: Drag-and-drop document intake.
   * **Features**: Live file validation, upload progress bar, and immediate dispatch to the Python AI processing pipeline.

6. **`Search.jsx`**:
   * **Purpose**: Global full-text and attribute search.
   * **Features**: Instant query execution, URL query param sync (`?q=...`), recent search tags, and structured result cards.

7. **`History.jsx`**:
   * **Purpose**: Single-screen executive activity console.
   * **Features**:
     * Left Column: Recent Searches with quick-search input and 1-click execution chips.
     * Right Column: Condensed Recent Activity showing top distinct events with deduplication.
     * Audit Trail Modal: Full searchable audit ledger with action filters.

8. **`AdminManagement.jsx`**:
   * **Purpose**: Admin console for repository control.
   * **Features**:
     * 4 Stat Cards: `INDEXED FILES`, `PENDING AUDIT`, `OVERDUE ESCALATIONS`, `VERIFIED / DONE`.
     * Document management table with in-line metadata editor and soft-delete capabilities.
     * CSV Export functionality.

9. **`Login.jsx` & `Signup.jsx`**:
   * Secure credential entry with client validation and JWT token acquisition.

10. **`Profile.jsx`**:
    * User profile view displaying identity, role, department, and activity statistics.

---

### 6.3 Reusable Components (`src/components/`)
* **`Navbar.jsx`**: Header bar containing breadcrumbs, engine status indicator, and notification bell dropdown with real-time overdue alerts and persistent count badges.
* **`Sidebar.jsx`**: Fixed navigation sidebar with branding, navigation links, and active route highlighting.
* **`StatCard.jsx`**: Reusable metric card with color-coded accent bars, icons, and trend labels.
* **`StatusBadge.jsx`**: Color-coded status indicator dot for `pending`, `done`, `upcoming`, `overdue`, and `failed`.
* **`ProtectedRoute.jsx`**: Route guard preventing unauthenticated access and enforcing Admin role restrictions.
* **`EmptyState.jsx` / `Loading.jsx`**: Clean loading spinners and contextual empty state prompts.

---

## 7. Complete REST API Endpoints Specification

| Method | Endpoint | Protection | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Bearer JWT | Fetch current authenticated user profile |
| `GET` | `/api/documents` | Bearer JWT | Retrieve paginated documents with filters |
| `POST` | `/api/documents/upload`| Bearer JWT | Upload document file & trigger AI pipeline |
| `GET` | `/api/documents/stats` | Bearer JWT | Fetch unified dashboard analytics |
| `GET` | `/api/documents/:id` | Bearer JWT | Get full document metadata & extracted info |
| `PUT` | `/api/documents/:id` | Bearer JWT | Update document metadata in database |
| `DELETE`| `/api/documents/:id` | Admin JWT | Soft-delete document from repository |
| `GET` | `/api/history/search` | Bearer JWT | Retrieve recent search queries |
| `POST` | `/api/history/search` | Bearer JWT | Record new search query with result count |
| `GET` | `/api/history/activity`| Bearer JWT | Retrieve audit trail activity events |
| `GET` | `/api/users` | Admin JWT | List all user accounts |
| `POST` | `/api/process` *(Python)*| Internal | Microservice OCR & entity extraction |
| `GET` | `/health` *(Python)* | Public | Python microservice health check |

---

## 8. End-to-End Data Flow & Document Lifecycle

```
1. USER UPLOAD
   User drops "invoice.png" into UploadDocument.jsx
        |
        v
2. INGESTION (Node.js)
   Express Multer saves file to backend/uploads/<uuid>-invoice.png
   Inserts row into documents table with status='PENDING', processing_status='UPLOADED'
        |
        v
3. ASYNC AI TRIGGER (Node.js -> Python)
   Node calls POST http://localhost:8000/process
        |
        v
4. OCR & CLASSIFICATION (Python Service)
   OpenCV preprocesses image -> Tesseract extracts raw text
   Classifier analyzes keywords -> categorizes as "Invoice"
   InformationExtractor parses GSTIN, Invoice #, Date, Due Date, and Amount
   Returns JSON payload to Node.js
        |
        v
5. DATABASE PERSISTENCE (Node.js)
   Node updates document_information table with all extracted entities
   Updates documents.processing_status = 'PROCESSED'
   Logs audit event UPLOAD to document_history
        |
        v
6. USER REVIEW & VERIFICATION (Frontend)
   User opens DocumentDetails.jsx, views document preview & extracted fields
   User edits company name or dates -> clicks "Save to Database"
   Node commits update -> marks status='DONE'
```

---

## 9. Critical Algorithms, Calculations & Problem-Solving Ledger

1. **Unified Overdue Calculation**:
   * *Formula*: A document is overdue if `COALESCE(due_date, info_due_date) < CURDATE()` and `status != 'DONE'`.
   * Ensures that documents already approved or completed are never flagged as overdue blockers.

2. **Upcoming Deadlines Window (1–2 Weeks)**:
   * *Formula*: Active documents where `COALESCE(due_date, info_due_date)` is between `CURDATE()` and `CURDATE() + 14 DAYS`.

3. **Search Deduplication**:
   * Searches repeated within short intervals update the existing query's timestamp instead of spamming the audit log.

4. **Activity View Throttling**:
   * View events for the same document by the same user within 5 minutes are throttled to keep the audit trail clean.

---

*DocIntel Architecture Guide — Compiled for Development, Review & Deployment.*
