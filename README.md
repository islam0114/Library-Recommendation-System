# 📚 BiblioTech: The AI-Powered Smart Library

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Frontend](https://img.shields.io/badge/Frontend-React.js%20%7C%20CSS-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![Database](https://img.shields.io/badge/Database-MySQL-orange)
![AI](https://img.shields.io/badge/AI-TensorFlow%20%7C%20Keras-FF6F00)

## 🌟 About The Project

[cite_start]**BiblioTech** is an intelligent, full-stack library management and recommendation system developed for the **PHENOMENA Creative Festival** [cite: 30] [cite_start]at **Benha University**[cite: 4, 7]. [cite_start]Competing in the **Scientific Innovation** track [cite: 37] [cite_start]under the **Applications & Platforms** category[cite: 41], this project aims to revolutionize how students interact with the university's central library resources.

Moving beyond traditional keyword-based cataloging, BiblioTech leverages Deep Learning and Natural Language Processing (NLP) to understand student preferences, predict reading paths, and offer a seamless, emotionally intelligent conversational interface to assist students in finding the exact resources they need.

---

## ✨ Key Features

### 🧠 Core AI Engine
* **Hybrid Recommendation System:** Utilizes Collaborative Filtering (learning from student borrowing histories) and Content-Based Filtering (analyzing book genres and abstracts) to solve the cold-start problem and provide highly accurate book suggestions.
* **Semantic Search & NLP Chatbot:** An emotionally intelligent virtual assistant capable of understanding natural language queries (e.g., "I need a beginner-friendly book on deep learning") and fetching relevant materials instantly.

### 📱 Student Portal (User-Facing)
* **Smart Dashboard:** Personalized book recommendations tailored to the student's faculty and reading history.
* **Real-time Inventory:** Instant visibility into book availability and status.
* **Borrowing Management:** Track active borrows, due dates, and past reading history.

### 💻 Admin Dashboard (Management-Facing)
* **Inventory Control:** Complete CRUD operations for managing the library catalog.
* **Transaction Monitoring:** Real-time tracking of borrowed books and overdue alerts.
* **Analytics & Insights:** Data visualization for popular genres, peak borrowing times, and active user metrics.

---

## 🛠️ Technology Stack

* **Machine Learning & AI:** Python, TensorFlow, Keras, Pandas, Scikit-learn
* **Backend Architecture:** FastAPI (Python) for building high-performance, asynchronous RESTful APIs
* **Database Management:** MySQL (Relational DB ensuring robust, ACID-compliant transactions)
* **Frontend Development:** React.js, Vanilla CSS for responsive and custom UI design

---

## ⚙️ System Architecture

BiblioTech operates on a decoupled Client-Server architecture:
1. **Frontend (React):** Communicates asynchronously with the backend via REST APIs.
2. **Backend (FastAPI):** Acts as the central hub, managing business logic and secure MySQL database transactions.
3. **AI Microservice:** TensorFlow/Keras models seamlessly integrated within the Python ecosystem to process recommendation requests and NLP tasks on the fly.

---

## 📁 Project Structure

We utilize a structured Monorepo approach to keep our microservices, backend, and distinct frontend applications organized and easily maintainable:

```text
phenomena-smart-library/
├── .gitignore                   # Ignored files (node_modules, .env, venv, etc.)
├── README.md                    # Project documentation
│
├── ai-engine/                   # 🧠 AI/ML Workspace
│   ├── notebooks/               # Jupyter notebooks for model training & experiments
│   ├── data/                    # Datasets (cleaned CSVs) for recommendation models
│   ├── models/                  # Saved TensorFlow/Keras trained models (.h5)
│   ├── ai_microservice.py       # Python script/API for serving predictions
│   └── requirements.txt         # ML dependencies (tensorflow, pandas, etc.)
│
├── backend-server/              # ⚙️ Backend Workspace
│   ├── main.py                  # Entry point for the FastAPI server
│   ├── routes/                  # API endpoints (auth.py, books.py, borrow.py)
│   ├── schemas/                 # Pydantic models for request/response validation
│   ├── database.py              # MySQL connection and session management
│   └── requirements.txt         # Backend dependencies (fastapi, uvicorn, mysql-connector)
│
├── database-schema/             # 🗄️ Data Engineering Workspace
│   ├── init_db.sql              # SQL scripts for creating Books, Users, and Transactions tables
│   └── mock_data.json           # Initial seed data for frontend testing
│
├── frontend-user/               # 📱 Student Portal
│   ├── public/                  
│   ├── src/                     
│   │   ├── components/          # Reusable UI components (Navbar, BookCard, ChatWidget)
│   │   ├── pages/               # Main views (Home, Discover, MyLibrary)
│   │   ├── api/                 # Axios instances for backend communication
│   │   ├── styles/              # Vanilla CSS files for custom styling
│   │   └── App.js               
│   └── package.json             
│
└── frontend-admin/              # 💻 Admin Dashboard
    ├── public/                  
    ├── src/                     
    │   ├── components/          # Admin UI components (Sidebar, DataTables, StatCards)
    │   ├── pages/               # Admin views (Overview, Inventory, UsersList)
    │   ├── api/                 
    │   ├── styles/              # Vanilla CSS files for dashboard layout
    │   └── App.js               
    └── package.json
