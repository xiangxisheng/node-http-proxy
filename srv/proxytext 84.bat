@echo off
for %%i in (%0) do (set "name=%%~ni")
title %name%
set dirname=%~dp0
set NODE_PATH=%NODE_PATH%;.\node_modules
set NODE_PATH=%NODE_PATH%;..\node_modules
set NODE_PATH=%NODE_PATH%;%dirname%\node_modules
set NODE_PATH=%NODE_PATH%;%dirname%\..\node_modules
:start
echo [Start] %name%...
node %name%
echo [END] waiting try again...
REM CALL :delay 10
timeout 10
goto start
pause
EXIT
REM =====================================
:delay
for /L %%i in (%1,-1,1) do (
CALL :echo "%%i "
choice /t 1 /d y /n >nul
)
echo 0
goto :eof
:echo
set /p="%~1"<nul
goto :eof
