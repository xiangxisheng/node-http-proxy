#!/bin/bash
#git config --global core.safecrlf false
#git config --global core.autocrlf input
echo =========git diff============
git diff

echo =========git pull \& git commit============
read -s -n1 -p "Press any key to continue ... "
git pull
git commit

echo =========git add *============
read -s -n1 -p "Press any key to continue ... "
git add --all

echo =========git commit============
read -s -n1 -p "Press any key to continue ... "
git commit

echo =========git push============
read -s -n1 -p "Press any key to continue ... "
git push

echo =========EXIT============
