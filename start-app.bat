@echo off
echo Starting Complaint Registry System...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo Starting Frontend Server...
cd ../frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo Application is starting...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3000
echo.
echo Please wait a few moments for the servers to start...
pause 