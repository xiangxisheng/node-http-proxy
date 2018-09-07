#!/bin/bash
#git config --global core.safecrlf false
#git config --global core.autocrlf input
echo =========git diff============
git diff
echo =========git pull \& git commit============
PAUSE
git pull
git commit
echo =========git add *============
PAUSE
git add --all
echo =========git commit============
PAUSE
git commit
echo =========git push============
PAUSE
git push
echo =========EXIT============
