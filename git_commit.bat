@ECHO OFF
SET path=%path%;P:\data\code\PortableGit\bin\
REM git config --global core.safecrlf false
REM git config --global core.autocrlf input
ECHO =========git diff============
git diff
ECHO =========git pull ^&^& git commit============
PAUSE
git pull
git commit
ECHO =========git add *============
PAUSE
git add --all
ECHO =========git commit============
PAUSE
git commit
ECHO =========git push============
PAUSE
git push
ECHO =========EXIT============
PAUSE
EXIT