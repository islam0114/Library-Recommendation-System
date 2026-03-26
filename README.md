# 📚 BiblioTech - Advanced Library Ecosystem

BiblioTech is a comprehensive and advanced library ecosystem that brings the future of reading to your screen. It provides personalized book recommendations powered by AI, a vibrant social platform for readers to interact, and dedicated management portals tailored for both students and administrators.

## ✨ Key Features

- **🤖 AI-Powered Recommendations**: Utilizes collaborative filtering and content-based recommendation logic to suggest the best books for each user.
- **💬 Social Ecosystem**: Users can engage with the community by leaving reviews, commenting, and sharing their reading experiences.
- **👥 Specialized Portals**: Distinct, feature-rich interfaces designed specifically for Administrators (Admin Portal) and Students (Student Portal).
- **🌍 Multi-Language Support**: Fully adaptive UI with built-in support for both Arabic (RTL) and English (LTR).
- **🚀 One-Click Start**: Seamlessly spin up the entire application stack using a single startup script (`start.bat`).

## 🛠️ Technology Stack

### Frontend 💻
- **Framework**: React.js, Vite
- **Styling**: Vanilla CSS
- **Icons**: Lucide Icons
- **State Management**: Redux (`store.js`)
- **Localization**: Built-in multi-language translation bindings (`ar_en.js`)

### Backend ⚙️
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **Database**: MySQL (with support for SQLite/PostgreSQL logic)
- **Services**: Custom Email services, OTP-based secure user registration

### AI & Machine Learning 🧠
- **Core Library**: Python (`scikit-learn`, `pandas`)
- **Environment**: Jupyter Notebooks for AI architecture research & experiments
- **Output**: Pre-trained model weights handled by `AI_Engine.py`

## 🧩 Module Breakdown

### 1. AI Engine
- Handles collaborative filtering and content-based recommendation operations.
- Analyzes core datasets (`Books_Details.csv`, `ratings_history.csv`) to personalize recommendations dynamically.
- Central logic encapsulates research findings from `AI_Architecture.ipynb`.

### 2. Backend (API)
- **FastAPI** implements async HTTP requests serving route modules:
  - `books_routes.py`: Book CRUD operations and retrievals.
  - `register_routes.py` & `otp_routes.py`: Comprehensive secure Auth layout and OTP email verification.
  - `social_routes.py`: Social and Community logic endpoints.
- Independent Python-based scripts provision database schemas (`create_db.py`) and inject pre-aggregated system data (`seed_db.py`).

### 3. Frontend (UI)
- Extensive React app featuring multiple application views (e.g., `StudentHome`, `AdminPortal`, `ExplorePage`, `BookDetail`, `SocialPage`).
- Employs a centralized component library (`BookCard`, `ChatbotModal`, `ParticleBackground`) ensuring UI consistency and aesthetic animations.
- Vite bundled application enabling fast hot-reloading across environments.

### 4. Data Services
- Manages local persistence of raw datasets, providing immediate baseline structures that seed the AI algorithms and foundational Data tables.

## 📂 Complete Project Structure

```text
BiblioTechApp/
├── AI/                           # AI & Recommendation Engine
│   ├── production_models/        # Saved model weights
│   ├── AI_Architecture.ipynb     # Research & Experiments
│   ├── AI_Engine.py              # Core logic
│   └── requirements.txt          # AI dependencies
├── Backend/                      # FastAPI Server
│   ├── routes/                   # API Endpoints
│   │   ├── books_routes.py       # Book CRUD
│   │   ├── otp_routes.py         # OTP Verification
│   │   ├── register_routes.py    # Auth & Registration
│   │   └── social_routes.py      # Social/Community logic
│   ├── scripts/                  # Database initialization & seeding
│   │   ├── create_db.py
│   │   └── seed_db.py
│   ├── services/                 # Business logic
│   │   └── email_service.py      # Email notifications
│   ├── .env                      # Environment config
│   └── main.py                   # FastAPI entry point
├── Data/                         # Raw Data files
│   └── raw_files/                # Datasets
│       ├── Books_Details.csv
│       └── ratings_history.csv
├── frontend/                     # React UI
│   ├── src/
│   │   ├── components/           # Reusable UI (BookCard, ChatbotModal, etc.)
│   │   ├── locales/              # Translations
│   │   │   └── ar_en.js
│   │   ├── pages/                # Application views (StudentHome, AdminPortal, etc.)
│   │   ├── styles/               # CSS & Styling
│   │   ├── utils/                # Helper functions
│   │   ├── App.jsx               # Main React Layout
│   │   ├── main.jsx              # Vite entry point
│   │   └── store.js              # Redux/State management
│   ├── index.html                # Entry HTML
│   ├── vite.config.js            # Vite configuration
│   └── package.json
├── for presentation/             # Presentation Assets
├── start.bat                     # One-click Startup Script
├── how to run project.txt        # Usage Instructions
└── arc.txt                       # Project Architectural Overview
```

## 🚀 How to Run the Project Locally

Follow these precise steps to get the BiblioTech ecosystem up and running:

### 1. Database Configuration
- Open **MySQL Workbench** (or preferred client).
- Execute SQL command to create the schema:
  ```sql
  CREATE SCHEMA bibliotech;
  ```

### 2. Install Project Dependencies
Ensure **Python** and **Node.js** are installed safely on your machine.
- Install the required AI packages (and backend dependencies):
  ```bash
  cd AI
  pip install -r requirements.txt
  cd ..
  ```

### 3. Initialize and Seed the Database
Populate your newly created database with exact tables and initial seeded data by firing the provided Python scripts from the root directory:
```bash
python Backend/scripts/create_db.py
python Backend/scripts/seed_db.py
```

### 4. Start the Application
Run the master batch script. This will seamlessly map all ports, boot up the FastAPI Python backend server, and inject the React frontend instantly on your localhost environment:
```cmd
start.bat
```

Navigate to the shown localhost web address and enjoy exploring the BiblioTech Ecosystem! 📚✨
