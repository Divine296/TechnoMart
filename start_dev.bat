@echo off
echo Starting Django + React...

:: Run frontend in a new terminal window
start cmd /k "npm run dev"

:: Move to frontend directory (optional)
cd C:\Django\sanaol-cnt-00\backend

:: Activate virtual environment
call .venv\Scripts\activate

:: Run backend in a new terminal window
start cmd /k "python manage.py runserver"

echo All services started!
