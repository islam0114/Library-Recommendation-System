# 📚 BiblioTech — Benha University Library System

A full library management system with a Student portal and Admin panel.

## 🚀 How to Run

### Step 1 — Install Node.js
Download from: https://nodejs.org (choose the LTS version)

### Step 2 — Clone the project
```bash
git clone https://github.com/Mohsen1279/bibliotech.git
cd bibliotech
```

### Step 3 — Install dependencies
```bash
npm install
```

### Step 4 — Run the project
```bash
npm run dev
```

Then open your browser and go to: **http://localhost:5173**

---

## 📁 Project Structure

```
bibliotech/
├── src/
│   ├── main.jsx              ← App entry point
│   ├── App.jsx               ← Router (connects all pages)
│   └── pages/
│       ├── Landing.jsx       ← Home screen (choose Student or Admin)
│       ├── BiblioTechStudent.jsx  ← Student portal
│       └── BiblioTechAdmin.jsx   ← Admin panel
├── index.html
├── vite.config.js
└── package.json
```

## 🔗 Routes

| URL | Page |
|---|---|
| `/` | Landing page (choose Student or Admin) |
| `/student` | Student portal |
| `/admin` | Admin panel |

## 👥 Team

| Name | Role |
|---|---|
| Mohsen1279 | Student Frontend + Admin Frontend |

## 🛠️ Built With
- React 18
- Vite
- React Router DOM
- Recharts
- Claude AI (chatbot + book summarizer)
