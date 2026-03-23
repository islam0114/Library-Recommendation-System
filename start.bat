@echo off
echo ===================================================
echo     Starting BiblioTech System (Backend & Frontend)
echo ===================================================

:: 1. Start the API Server (FastAPI)
echo Starting FastAPI Backend...
start "BiblioTech Backend" cmd /k "cd Backend && uvicorn main:app --reload --port 8000"

:: 2. Start the Frontend Server (React)
echo Starting React Frontend...
start "BiblioTech Frontend" cmd /k "cd Frontend && npm run dev"

echo.
echo ✅ Servers are starting in new windows...
echo You can close this window now.