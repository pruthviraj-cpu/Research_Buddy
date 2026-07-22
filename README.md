# 📚 Research Buddy — AI-Powered Research Paper Management System

> An intelligent platform that lets you upload, extract, organize, and search research papers — without ever storing a single PDF.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://research-papaer-data-base-managemen.vercel.app)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/database-Supabase-3ECF8E)](https://supabase.com/)
[![JWT Auth](https://img.shields.io/badge/auth-JWT-black)](https://jwt.io/)
[![License](https://img.shields.io/badge/license-MIT-blue)](#-license)

**🔗 Live App:** [research-papaer-data-base-managemen.vercel.app](https://research-papaer-data-base-managemen.vercel.app)

---

## 🌟 Overview

Research Buddy solves a simple but painful problem: **manually cataloguing research papers is slow, repetitive, and error-prone.**

Instead of forcing users to copy-paste titles, authors, and abstracts by hand, Research Buddy lets you **just upload the PDF** — an AI pipeline reads it, extracts every relevant field, and stores only the structured text data your team actually needs. No bloated file storage. No manual entry. No mess.

The system ships with **two role-based dashboards** (User & Admin), a full **CRUD backend**, **JWT-secured authentication**, and an **audit trail** that logs every change made to the database — so you always know *what* happened, *when*, and *by whom*.

---

## ✨ Key Features

### 🤖 AI-Driven Paper Ingestion
- Upload a research paper PDF directly — that's it.
- Text is extracted using **PyMuPDF**, then passed to the **Groq API (LLM inference)** to intelligently identify and structure:
  - Title
  - Authors
  - Abstract
  - Conference / Journal details
  - Publication year
  - Keywords & other metadata
- No copy-pasting, no manual tagging.

### 📦 Text-Only Storage (No PDF Bloat)
- The original PDF is **never persisted** in storage.
- Only the extracted, structured **text data** is saved to the database.
- Result: drastically lower storage costs, faster reads, and instant access to summaries — while keeping every important detail searchable.

### 🔐 JWT Authentication
- Stateless, token-based authentication secures every API route.
- Sessions are verified on each request, keeping user and admin data protected without server-side session storage.

### 🛡️ Role-Based Access Control (RBAC)
Two distinct dashboards, each with its own permission set:

| Role | Permissions |
|------|-------------|
| **User** | Browse papers, search by title/author/keywords, view summaries and abstracts |
| **Admin** | Everything a User can do, **plus**: add new papers (via AI upload), edit existing entries, delete papers, manage records |

### 🧩 Full CRUD Operations
- **Create** — Admins add papers via AI-assisted upload (or manual entry).
- **Read** — Users and Admins search, filter, and view paper details.
- **Update** — Admins can correct or update extracted metadata.
- **Delete** — Admins can remove papers no longer needed.

### 📜 Database Triggers & Audit Logging
- Postgres triggers (via Supabase) automatically log **every CRUD operation** performed on the papers table.
- Provides a transparent audit trail: what was inserted, updated, or deleted, and when — useful for accountability and debugging.

### ✅ Smart Validation
- Before processing, uploaded files are validated to confirm they're genuine research papers (not random or corrupted PDFs), preventing garbage data from entering the pipeline.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite |
| **Backend** | FastAPI (Python) |
| **ORM** | SQLAlchemy |
| **Database & Storage** | Supabase (PostgreSQL) |
| **Authentication** | JWT (JSON Web Tokens) |
| **PDF Text Extraction** | PyMuPDF (fitz) |
| **AI / LLM Processing** | Groq API |
| **Deployment** | Vercel (Frontend) |

### How a Paper Flows Through the System

```
 PDF Upload (Admin)
        │
        ▼
 Validation Check ──── ❌ Not a valid paper → Rejected
        │ ✅
        ▼
 PyMuPDF Text Extraction
        │
        ▼
 Groq API (LLM) → Structures data:
   title, authors, abstract, conference, keywords, etc.
        │
        ▼
 Structured Text Stored in Supabase (PostgreSQL)
        │
        ▼
 Trigger Logs the INSERT Operation (Audit Trail)
        │
        ▼
 Available Instantly to Users via Search/Browse
```

---

## 📂 Project Structure

```
Ai_Powered_ResearchPaper_Management_System/
├── Backend/
│   ├── main.py              # FastAPI entry point
│   ├── requirements.txt     # Python dependencies
│   └── ...                  # Models, routes, auth, AI processing logic
├── Frontend/
│   └── ...                  # React + Vite frontend (User & Admin dashboards)
├── README.md
└── ...
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js & npm
- A [Supabase](https://supabase.com/) project (URL + API keys)
- A [Groq API](https://groq.com/) key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/pruthviraj-cpu/Research_Buddy.git
   cd Research_Buddy
   ```

2. **Navigate to the Backend folder**
   ```bash
   cd Backend
   ```

3. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

4. **Activate the environment**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

5. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

6. **Configure environment variables**

   Create a `.env` file in the `Backend/` folder with:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_key
   JWT_SECRET_KEY=your_jwt_secret
   GROQ_API_KEY=your_groq_api_key
   ```

7. **Run the backend server**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000` by default.

### Frontend Setup

1. **Navigate to the Frontend folder** (from project root)
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   The app runs at `http://localhost:5173` (default Vite port). Make sure the backend is running for full functionality.

4. **Build for production** (optional)
   ```bash
   npm run build
   ```

---

## 👤 User Roles at a Glance

**As a User, you can:**
- 🔍 Search and browse the paper database
- 📖 Read AI-generated summaries and key metadata
- 🗂️ Filter by author, conference, or keywords

**As an Admin, you can:**
- ➕ Upload new papers — AI handles extraction automatically
- ✏️ Edit or correct extracted metadata
- 🗑️ Delete outdated or incorrect entries
- 📜 (Behind the scenes) every action is logged via database triggers

---

## 🔐 Security

- All protected routes require a valid **JWT** issued at login.
- Role claims are embedded in the token, so the backend enforces permissions before any CRUD operation executes.
- Uploaded files are validated before processing to prevent malicious or malformed input from reaching the AI pipeline or database.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please open an issue first for major changes so we can discuss what you'd like to add.

---

## 📄 License

This project is licensed under the MIT License — feel free to use, modify, and distribute it.

---



<p align="center">Made with ❤️ to make research discovery a little less painful.</p>
