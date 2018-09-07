#!/bin/bash
#git config --global core.safecrlf false
#git config --global core.autocrlf input
echo =========git diff============
git diff
echo =========git pull \& git commit============
./pause.sh
git pull
git commit
echo =========git add *============
./pause.sh
git add --all
echo =========git commit============
./pause.sh
git commit
echo =========git push============
./pause.sh
git push
echo =========EXIT============
