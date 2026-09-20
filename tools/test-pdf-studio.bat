@echo off
rem PDF Studio smoke test - run before pushing changes to pdf-tools\index.html.
rem Uses the Chrome or Edge already on this PC; starts the dev server on :8080 if needed.
rem   tools\test-pdf-studio.bat                 local copy
rem   set FORMS_CODE=...  then run it           also checks packets + agency stamps
rem   set PDF_STUDIO_URL=https://www.billlayneinsurance.com/pdf-tools/   test the live site
cd /d "%~dp0pdf-studio-tests"
if not exist node_modules (
  echo Installing test dependencies once...
  call npm install --no-audit --no-fund
)
node smoke.js
