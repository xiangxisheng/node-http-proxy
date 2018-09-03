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
timeout 10
REM CALL :delay 10
goto start
pause
EXIT
REM =====================================
:delay
for /L %%i in (%1,-1,1) do (
CALL :echo "%%i "
timeout 1 >nul
)
echo 0
goto :eof
:echo
set /p="%~1"<nul
goto :eof
