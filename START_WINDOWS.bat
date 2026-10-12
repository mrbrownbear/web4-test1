@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel% equ 0 (
  echo Launching Majenta Solutions website on http://127.0.0.1:4173
  start "" "http://127.0.0.1:4173"
  node server.mjs
  goto :end
)
where py >nul 2>nul
if %errorlevel% equ 0 (
  echo Node not installed. Using Python instead.
  start "" "http://127.0.0.1:4173"
  py -m http.server 4173 --bind 127.0.0.1
  goto :end
)
where python >nul 2>nul
if %errorlevel% equ 0 (
  echo Node not installed. Using Python instead.
  start "" "http://127.0.0.1:4173"
  python -m http.server 4173 --bind 127.0.0.1
  goto :end
)
echo Neither Node nor Python was found. Install Node.js or Python to launch the local model server.
:end
pause
