# DocIntel — AI Document Intelligence Platform

A centralized company document intelligence and management platform where employees can upload, search, filter, and manage business documents (invoices, tenders, quotations, agreements) with architecture ready for future Python OCR/AI integration.

## 🎯 What is DocIntel?

Companies handle hundreds of business documents — invoices, tenders, quotations, purchase orders, agreements — that are often scattered across desktop folders, email attachments, and individual computers. DocIntel provides a centralized platform where:

- Employees **upload** documents to a single system
- Documents are **searchable** by company name, type, document number
- Documents can be **filtered** and **sorted** by status, type, date
- **Role-based access** separates regular users from administrators
- Architecture is **ready for AI/OCR** processing in Phase 2

## 📸 Screenshots

The application features a professional dark-themed UI inspired by modern SaaS dashboards.

## 🏗️ Architecture

```
┌─────────────────────┐
│   React Frontend    │
│   (Vite + React)    │
└──────────┬──────────┘
           │ REST API
           ▼
┌─────────────────────┐
│   Node.js Backend   │
│   (Express.js)      │
└─────┬─────────┬─────┘
      │         │
      ▼         ▼
┌──────────┐ ┌──────────────┐
│  MySQL   │ │ File Storage │
│ Database │ │  (uploads/)  │
└──────────┘ └──────────────┘

      FUTURE (Phase 2)
           │
           ▼
┌─────────────────────┐
│   Python Service    │
│ FastAPI + OCR + AI  │
└─────────────────────┘
```

## 🚀 Features

### Phase 1 (Current)
- ✅ User authentication (signup/login with JWT)
- ✅ Role-based access control (USER / ADMIN)
- ✅ Professional dark-themed dashboard
- ✅ Document upload with drag & drop
- ✅ Document listing with pagination
- ✅ Search by company name, document name, document number
- ✅ Filter by document type, status
- ✅ Sort by newest, oldest, document date, due date
- ✅ Document details page with AI placeholder sections
- ✅ User activity history tracking
- ✅ Admin document management (edit/delete)
- ✅ File storage abstraction (local, cloud-ready)
- ✅ Responsive design

### Phase 2 (Future)
- 🔲 Python OCR service (Tesseract)
- 🔲 AI document classification
- 🔲 Information extraction (company, GST, amounts)
- 🔲 AI summary generation
- 🔲 Key points extraction

### Phase 3 (Future)
- 🔲 Cloud deployment
- 🔲 Managed MySQL database
- 🔲 Cloud file storage (S3-compatible)
- 🔲 Production security hardening

## 📁 Folder Structure

```
DOC AI/
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components (Sidebar, Navbar, etc.)
│   │   ├── pages/      # Page components (Dashboard, Documents, etc.)
│   │   ├── services/   # API service layer (api.js)
│   │   ├── context/    # React Context (AuthContext)
│   │   ├── styles/     # Global CSS and variables
│   │   └── App.jsx     # Main app with routing
│   └── package.json
│
├── backend/            # Node.js + Express backend
│   ├── src/
│   │   ├── config/     # Database configuration
│   │   ├── controllers/# Request handlers
│   │   ├── middleware/  # Auth, role, upload, error middleware
│   │   ├── routes/     # API route definitions
│   │   ├── services/   # Business logic layer
│   │   └── utils/      # Validation, response helpers
│   ├── uploads/        # Uploaded documents (local storage)
│   └── package.json
│
├── database/           # SQL scripts
│   ├── schema.sql      # Database tables DDL
│   └── seed.sql        # Demo/test data
│
├── python-service/     # Phase 2 placeholder
│   ├── README.md
│   └── requirements.txt
│
└── README.md           # This file
```

## 📋 Requirements

- **Node.js** v18 or later
- **npm** v8 or later
- **MySQL** v8 or later
- **Git**
- **VS Code** (recommended)

## ⚙️ Installation & Setup

### 1. Clone or Open the Project

```bash
cd "DOC AI"
```

### 2. Set Up MySQL Database

Open MySQL terminal or MySQL Workbench and run:

```sql
source database/schema.sql;
source database/seed.sql;
```

Or copy-paste the contents of `schema.sql` then `seed.sql` into your MySQL client.

### 3. Configure Backend Environment

Edit `backend/.env` and set your MySQL password:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password    ← Change this
DB_NAME=docintel
JWT_SECRET=docintel_dev_jwt_secret_key_2026
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 4. Install Backend Dependencies

```bash
cd backend
npm install
```

### 5. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 6. Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server is running on port 5000
Successfully connected to the database.
```

### 7. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v8.x.x  ready in XXms
➜  Local:   http://localhost:5173/
```

### 8. Open the Application

Navigate to `http://localhost:5173` in your browser.

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@docintel.com | Admin@123 |
| User | user@docintel.com | User@123 |

> ⚠️ These are development/demo accounts only. Never use these credentials in production.

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Create new account | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Documents
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/documents` | Upload document | Yes | Any |
| GET | `/api/documents` | List documents (with search/filter/sort/pagination) | Yes | Any |
| GET | `/api/documents/stats` | Dashboard statistics | Yes | Any |
| GET | `/api/documents/:id` | Get document details | Yes | Any |
| PUT | `/api/documents/:id` | Edit document | Yes | ADMIN |
| DELETE | `/api/documents/:id` | Delete document | Yes | ADMIN |
| GET | `/api/documents/:id/file` | Download original file | Yes | Any |

**Query Parameters for GET /api/documents:**
- `search` — Search company name, filename, document number
- `document_type` — Filter: Invoice, Quotation, Tender, etc.
- `status` — Filter: PENDING, DONE
- `sort` — Sort: newest, oldest, document_date, due_date
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 10)

### History
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/history/search` | User's search history | Yes |
| GET | `/api/history/activity` | User's activity history | Yes |
| DELETE | `/api/history/search` | Clear search history | Yes |

### User
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Get profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |

## 🗄️ Database Schema

### Tables
1. **users** — User accounts with roles (USER/ADMIN)
2. **documents** — Document metadata (filename, type, status, dates)
3. **document_information** — Extracted information (company, GST, amounts, AI summary)
4. **search_history** — User search queries
5. **document_history** — User activity log (VIEW, UPLOAD, OPEN)

### Key Concepts
- **Business Status** (PENDING / DONE) — Is the document task complete?
- **Processing Status** (UPLOADED / PROCESSING / PROCESSED / FAILED) — Has AI processed it?

These are intentionally separate. A document can be:
- Status: PENDING, Processing: PROCESSED → AI processed it, but the business task is pending
- Status: DONE, Processing: UPLOADED → Business task is done, but AI hasn't processed it yet

## 🔒 Security

- Passwords hashed with **bcrypt** (never stored in plain text)
- **JWT** authentication with 7-day expiry
- **Role-based authorization** enforced on backend routes
- **Parameterized SQL queries** (no SQL injection)
- **File validation** (type + size limits)
- **CORS** configured for frontend origin
- **Environment variables** for all secrets

## 🌍 Deployment Readiness

The application is designed for future global deployment:

| Component | Local (Phase 1) | Global (Phase 3) |
|-----------|-----------------|-------------------|
| Frontend | `localhost:5173` | Vercel / Netlify |
| Backend | `localhost:5000` | Railway / Render |
| Database | Local MySQL | PlanetScale / AWS RDS |
| Storage | `uploads/` folder | AWS S3 / Cloudflare R2 |
| AI Service | N/A | Cloud VM / Lambda |

All configuration comes from environment variables — no code changes needed for deployment.

## 🎓 For Viva / Presentation

### Demo Flow
1. Open DocIntel → Login page
2. Sign up as new user
3. View Dashboard (statistics, recent documents)
4. Upload a document
5. Document appears in listing
6. Search for a company name
7. Filter by type/status
8. Open document details
9. Show AI summary placeholder ("Ready for Phase 2")
10. Open original document
11. View activity history
12. Login as Admin
13. Show admin document management
14. Edit document information
15. Delete document (with confirmation)

### Key Technical Questions

**Q: What is React doing?**
A: React handles the user interface — it renders pages, manages state, and communicates with the backend through REST API calls.

**Q: What is Node.js/Express doing?**
A: Express handles API requests — authentication, authorization, document CRUD operations, search/filter queries, and communicates with MySQL.

**Q: What is MySQL doing?**
A: MySQL stores all persistent data — users, documents, extracted information, statuses, and user activity history.

**Q: Why separate Python for AI?**
A: Python has the strongest ecosystem for OCR (Tesseract), document processing, and AI/ML. Keeping it as a separate service means we can upgrade the AI independently without touching the web application.

**Q: What does OCR do?**
A: OCR (Optical Character Recognition) converts text in scanned images or PDF documents into machine-readable text that can be searched and analyzed.

**Q: How does role-based access work?**
A: JWT tokens contain the user's role. Backend middleware checks this role before allowing admin-only operations. Even if someone calls the API directly, they get 403 Forbidden without admin role.

## 📝 License

This is a college project for educational purposes.
