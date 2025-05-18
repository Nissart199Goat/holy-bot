@echo off
cd /d "%~dp0"
echo -------------------------------------
echo Holy Bot - Auto Git Push
echo -------------------------------------
git add .
set /p msg="Commit message: "
git commit -m "%msg%"
git push
echo.
echo ✅ Code pushed successfully!
pause