@echo off
title Carbon Footprint Platform - Dev Runner
echo ===================================================
echo   Starting Carbon Footprint Platform Dev Servers
echo ===================================================
echo.

echo [1/2] Launching Backend Server on http://localhost:3001 ...
start "Carbon Footprint - Backend" cmd /k "cd backend && npm run dev"

echo [2/2] Launching Frontend Server on http://localhost:5173 ...
start "Carbon Footprint - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   Servers started! 
echo   - Backend: http://localhost:3001
echo   - Frontend: http://localhost:5173
echo ===================================================
pause
