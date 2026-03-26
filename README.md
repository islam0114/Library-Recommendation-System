# 📚 BiblioTech - Advanced Library Ecosystem

BiblioTech is a comprehensive and advanced library ecosystem that brings the future of reading to your screen. It provides personalized book recommendations powered by AI, a vibrant social platform for readers to interact, and dedicated management portals tailored for both students and administrators.

## ✨ Key Features

- **🤖 AI-Powered Recommendations**: Utilizes collaborative filtering and content-based recommendation logic to suggest the best books for each user.
- **💬 Social Ecosystem**: Users can engage with the community by leaving reviews, commenting, and sharing their reading experiences.
- **👥 Specialized Portals**: Distinct, feature-rich interfaces designed specifically for Administrators and Students.
- **🌍 Multi-Language Support**: Fully adaptive UI with built-in support for both Arabic (RTL) and English (LTR).
- **🚀 One-Click Start**: Seamlessly spin up the entire application stack using a single startup script.

## 🛠️ Technology Stack

**Frontend 💻**
- React.js & Vite
- Vanilla CSS
- Lucide Icons (for scalable vector graphics)

**Backend ⚙️**
- FastAPI (Python) & Uvicorn
- MySQL (Database)

**AI & Machine Learning 🧠**
- Python (`scikit-learn`, `pandas`)
- Jupyter Notebooks

## 📂 Project Structure Overview

```text
BiblioTechApp/
├── AI/                           # AI Models & Recommendation Engine core logic
├── Backend/                      # FastAPI Server, Routes, Services, and DB Scripts
├── Data/                         # Raw Datasets (CSV) for books and ratings
├── frontend/                     # React UI components, pages, and themes
├── start.bat                     # One-click Startup Script for Windows
└── ...
```

## 🚀 How to Run the Project Locally

Follow these steps to get the BiblioTech ecosystem up and running on your local machine:

### 1. Database Configuration
- Open **MySQL Workbench** (or your preferred MySQL client).
- Create a new schema named `bibliotech`.

### 2. Install Dependencies
Ensure you have Python installed on your system. Navigate to the project directory and install the required AI and Backend libraries:
```bash
pip install -r AI/requirements.txt
```
*(Note: Ensure all required FastAPI and Python packages are installed within your environment as specified).*

### 3. Initialize and Seed the Database
Populate your newly created database with tables and initial data by running the included scripts from the root directory:
```bash
python Backend/scripts/create_db.py
python Backend/scripts/seed_db.py
```

### 4. Start the Application
Run the startup batch script. This will automatically start both the FastAPI backend server and the React frontend application:
```cmd
start.bat
```

Open your browser and enjoy exploring the BiblioTech Ecosystem! 📚✨
