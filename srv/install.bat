@echo off
for %%i in (%0) do (set "name=%%~ni")
title %name%
start /b /wait npm install cheerio iconv-lite
pause
